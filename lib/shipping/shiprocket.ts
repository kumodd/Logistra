import { CALCULATOR_REQUEST_TIMEOUT_MS, RATE_CACHE_TTL_MS, SHIPROCKET_BASE_URL, SHIPROCKET_RATE_PATH, hasShiprocketCredentials } from "./config";
import type { ProviderLookupResult, ShippingRateRequest } from "./types";

type ProviderErrorCode = "not_configured" | "authentication_failed" | "provider_error" | "rate_limited" | "timeout";

type TokenCache = { token: string; expiresAt: number } | null;
type RateCache = Map<string, ProviderLookupResult & { expiresAt: number }>;
type ShiprocketRuntimeState = {
  tokenCache: TokenCache;
  authenticationInFlight: Promise<string> | null;
  rateCache: RateCache;
};

export class ShiprocketError extends Error {
  readonly code: ProviderErrorCode;
  readonly status: number;
  readonly retryable: boolean;

  constructor(code: ProviderErrorCode, message: string, status: number, retryable = false) {
    super(message);
    this.name = "ShiprocketError";
    this.code = code;
    this.status = status;
    this.retryable = retryable;
  }
}

const globalWithShiprocketState = globalThis as typeof globalThis & {
  __logistraShiprocketRuntime?: ShiprocketRuntimeState;
};
const runtimeState = globalWithShiprocketState.__logistraShiprocketRuntime ??= {
  tokenCache: null,
  authenticationInFlight: null,
  rateCache: new Map(),
};
const MAX_RATE_CACHE_ENTRIES = 500;

function timeoutError(): ShiprocketError {
  return new ShiprocketError("timeout", "The shipping provider took too long to respond. Please try again.", 504, true);
}

function tokenExpiry(token: string): number | null {
  const payloadPart = token.split(".")[1];
  if (!payloadPart) return null;
  try {
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payloadPart.length / 4) * 4, "=");
    const payload = JSON.parse(atob(base64)) as { exp?: unknown };
    return typeof payload.exp === "number" && Number.isFinite(payload.exp) ? payload.exp * 1000 - 60_000 : null;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CALCULATOR_REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw timeoutError();
    throw new ShiprocketError("provider_error", "The shipping provider could not be reached. Please try again.", 502, true);
  } finally {
    clearTimeout(timeout);
  }
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function authenticationMessage(response: Response, payload: unknown): string {
  const message = payload && typeof payload === "object" && !Array.isArray(payload)
    ? (payload as Record<string, unknown>).message
    : null;
  if (response.status === 403 && typeof message === "string" && /blocked|failed login attempts/i.test(message)) {
    return "The Shiprocket API user is blocked after failed login attempts. Unblock it or create a new API user in Shiprocket, then update the server credentials.";
  }
  return "The shipping provider could not authenticate the configured API user.";
}

async function authenticate(): Promise<string> {
  if (!hasShiprocketCredentials()) {
    throw new ShiprocketError("not_configured", "Shipping rates are not configured yet.", 503);
  }

  const response = await fetchWithTimeout(`${SHIPROCKET_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });
  const payload = await parseJson(response);
  const rawToken = payload && typeof payload === "object" && !Array.isArray(payload) ? (payload as Record<string, unknown>).token : null;
  const token = typeof rawToken === "string" ? rawToken : null;

  if (!response.ok || !token) {
    throw new ShiprocketError("authentication_failed", authenticationMessage(response, payload), 502);
  }

  runtimeState.tokenCache = { token, expiresAt: tokenExpiry(token) ?? Date.now() + 9 * 24 * 60 * 60 * 1000 };
  return token;
}

async function getToken(force = false): Promise<string> {
  if (!force && runtimeState.tokenCache && runtimeState.tokenCache.expiresAt > Date.now() + 60_000) return runtimeState.tokenCache.token;
  if (!runtimeState.authenticationInFlight) {
    runtimeState.authenticationInFlight = authenticate().finally(() => {
      runtimeState.authenticationInFlight = null;
    });
  }
  return runtimeState.authenticationInFlight;
}

function providerError(response: Response): ShiprocketError {
  if (response.status === 429) {
    return new ShiprocketError("rate_limited", "The shipping provider rate limit was reached. Please try again shortly.", 502, true);
  }
  if (response.status === 401) {
    return new ShiprocketError("authentication_failed", "The shipping provider rejected the API authentication.", 502);
  }
  return new ShiprocketError("provider_error", "The shipping provider could not return a rate quote.", 502, response.status >= 500);
}

async function authenticatedJson(url: string): Promise<unknown> {
  let token = await getToken();
  let response = await fetchWithTimeout(url, {
    method: "GET",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    runtimeState.tokenCache = null;
    token = await getToken(true);
    response = await fetchWithTimeout(url, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
  }

  const payload = await parseJson(response);
  if (!response.ok) throw providerError(response);
  return payload;
}

function requestKey(request: ShippingRateRequest): string {
  return JSON.stringify(request);
}

function queryFor(request: ShippingRateRequest): string {
  const params = new URLSearchParams({
    pickup_postcode: request.pickupPincode,
    delivery_postcode: request.deliveryPincode,
    weight: String(request.shipment.weightKg),
    cod: request.shipment.paymentMode === "cod" ? "1" : "0",
  });
  if (request.shipment.lengthCm !== undefined) params.set("length", String(request.shipment.lengthCm));
  if (request.shipment.breadthCm !== undefined) params.set("breadth", String(request.shipment.breadthCm));
  if (request.shipment.heightCm !== undefined) params.set("height", String(request.shipment.heightCm));
  if (request.shipment.declaredValue !== undefined) params.set("declared_value", String(request.shipment.declaredValue));
  if (request.shipment.mode) params.set("mode", request.shipment.mode);
  return params.toString();
}

export async function fetchServiceability(request: ShippingRateRequest): Promise<ProviderLookupResult> {
  const key = requestKey(request);
  const cached = runtimeState.rateCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return { payload: cached.payload, quoteTimestamp: cached.quoteTimestamp, cached: true };
  }
  if (cached) runtimeState.rateCache.delete(key);

  const payload = await authenticatedJson(`${SHIPROCKET_BASE_URL}${SHIPROCKET_RATE_PATH}?${queryFor(request)}`);
  const result = { payload, quoteTimestamp: new Date().toISOString(), cached: false };
  if (runtimeState.rateCache.size >= MAX_RATE_CACHE_ENTRIES) {
    const oldestKey = runtimeState.rateCache.keys().next().value;
    if (oldestKey) runtimeState.rateCache.delete(oldestKey);
  }
  runtimeState.rateCache.set(key, { ...result, expiresAt: Date.now() + RATE_CACHE_TTL_MS });
  return result;
}
