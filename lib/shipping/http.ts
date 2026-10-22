import { NextResponse } from "next/server";
import { ShiprocketError } from "./shiprocket";
import type { ApiErrorResponse } from "./types";

const MAX_BODY_BYTES = 12_000;

export class RequestBodyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestBodyError";
  }
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new RequestBodyError("Request body is too large.");
  }
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) throw new RequestBodyError("Request body is too large.");
  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new RequestBodyError("Request body must be valid JSON.");
  }
}

export function errorResponse(code: string, message: string, status: number, fieldErrors?: Record<string, string>, retryable = false) {
  const payload: ApiErrorResponse = { error: { code, message, ...(fieldErrors ? { fieldErrors } : {}), ...(retryable ? { retryable } : {}) } };
  return NextResponse.json(payload, { status });
}

export function unexpectedErrorResponse() {
  return errorResponse("internal_error", "The calculator could not complete the request. Please try again.", 500, undefined, true);
}

export function providerErrorResponse(error: unknown) {
  if (error instanceof ShiprocketError) {
    return errorResponse(error.code, error.message, error.status, undefined, error.retryable);
  }
  return unexpectedErrorResponse();
}

export function rateLimitResponse(retryAfterSeconds: number) {
  const response = errorResponse("rate_limited", "Too many calculator requests. Please try again shortly.", 429, undefined, true);
  response.headers.set("Retry-After", String(retryAfterSeconds));
  return response;
}
