import type { ApprovedLogistraPricing, GstTreatment } from "./types";

export const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";
export const SHIPROCKET_RATE_PATH = "/courier/serviceability/";
export const CALCULATOR_REQUEST_TIMEOUT_MS = 10_000;
export const RATE_CACHE_TTL_MS = 60_000;
export const DEFAULT_STANDARD_ORIGIN_PINCODE = "801103";

function parseBoolean(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

function parseNonNegativeNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return undefined;
  return value;
}

function parseGstTreatment(value: unknown): GstTreatment | undefined {
  return value === "inclusive" || value === "exclusive" ? value : undefined;
}

export function hasShiprocketCredentials(): boolean {
  return Boolean(process.env.SHIPROCKET_EMAIL?.trim() && process.env.SHIPROCKET_PASSWORD);
}

/**
 * Temporary fallback for the public calculator. Live Shiprocket serviceability
 * takes precedence whenever credentials are configured. Set this to false if
 * the calculator must be live-only.
 */
export function hasStandardRateEstimates(): boolean {
  return process.env.STANDARD_RATE_ESTIMATES_ENABLED?.trim().toLowerCase() !== "false";
}

export function getStandardEstimateOriginPincode(): string {
  const configured = process.env.STANDARD_LOGISTRA_ORIGIN_PINCODE?.trim()
    || process.env.LOGISTRA_ORIGIN_PINCODE?.trim()
    || DEFAULT_STANDARD_ORIGIN_PINCODE;
  return /^\d{6}$/.test(configured) ? configured : DEFAULT_STANDARD_ORIGIN_PINCODE;
}

export function getLogistraFacility(): { available: true; originPincode: string } | { available: false; reason: string } {
  const enabled = parseBoolean(process.env.LOGISTRA_FULFILMENT_ENABLED);
  const verified = parseBoolean(process.env.LOGISTRA_FACILITY_VERIFIED);
  const originPincode = process.env.STANDARD_LOGISTRA_ORIGIN_PINCODE?.trim()
    || process.env.LOGISTRA_ORIGIN_PINCODE?.trim()
    || "";

  if (!enabled) return { available: false, reason: "Logistra live fulfilment comparison is not enabled yet." };
  if (!verified) return { available: false, reason: "The Logistra fulfilment facility is not marked as verified yet." };
  if (!/^\d{6}$/.test(originPincode)) return { available: false, reason: "A verified Logistra origin PIN code is not configured." };

  return { available: true, originPincode };
}

export function getApprovedLogistraPricing(): ApprovedLogistraPricing | null {
  const raw = process.env.LOGISTRA_PRICING_CONFIG_JSON?.trim();
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const record = parsed as Record<string, unknown>;
    const fees = record.fees;
    if (!fees || typeof fees !== "object" || Array.isArray(fees)) return null;
    const feeRecord = fees as Record<string, unknown>;
    const currency = record.currency;
    const gstTreatment = parseGstTreatment(record.gstTreatment);

    if (
      typeof record.version !== "string" ||
      !record.version.trim() ||
      typeof record.effectiveDate !== "string" ||
      !record.effectiveDate.trim() ||
      currency !== "INR" ||
      !gstTreatment ||
      gstTreatment === "unknown" ||
      record.approvalStatus !== "approved" ||
      record.publicDisplay !== true
    ) {
      return null;
    }

    const feeKeys = [
      "pickAndPackPerOrder",
      "packagingPerOrder",
      "storagePerOrder",
      "receivingPerOrder",
      "putawayPerOrder",
      "returnsPerOrder",
      "otherPerOrder",
      "fixedMonthly",
      "inventoryTransferMonthly",
    ] as const;
    const parsedFees: ApprovedLogistraPricing["fees"] = {};
    for (const key of feeKeys) {
      if (feeRecord[key] !== undefined) {
        const amount = parseNonNegativeNumber(feeRecord[key]);
        if (amount === undefined) return null;
        parsedFees[key] = amount;
      }
    }

    return {
      version: record.version.trim(),
      effectiveDate: record.effectiveDate.trim(),
      currency,
      gstTreatment,
      approvalStatus: "approved",
      publicDisplay: true,
      fees: parsedFees,
    };
  } catch {
    return null;
  }
}
