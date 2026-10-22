import type { NormalizedCourierRate } from "./types";

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function numberFrom(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function firstNumber(item: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = numberFrom(item[key]);
    if (value !== null) return value;
  }
  return null;
}

function firstString(item: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    if (typeof item[key] === "string" && item[key].trim()) return item[key].trim();
  }
  return null;
}

function booleanFrom(value: unknown): boolean | null {
  if (value === true || value === false) return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return null;
}

function rounded(value: number): number {
  return Math.round(value * 100) / 100;
}

export function normalizeCourierRate(value: unknown): NormalizedCourierRate | null {
  const item = record(value);
  if (!item) return null;
  const courierName = firstString(item, ["courier_name", "courierName"]);
  if (!courierName) return null;

  const freightCharge = firstNumber(item, ["freight_charge", "freightCharge"]);
  const codCharges = firstNumber(item, ["cod_charges", "codCharges"]);
  const additionalFields = ["coverage_charges", "entry_tax", "other_charges", "surcharge"];
  const additionalValues = additionalFields.map((key) => numberFrom(item[key])).filter((value): value is number => value !== null);
  const additionalCharges = additionalValues.length ? rounded(additionalValues.reduce((sum, value) => sum + value, 0)) : null;
  const totalCharge = freightCharge === null || (codCharges === null && booleanFrom(item.cod) === true)
    ? null
    : rounded(freightCharge + (codCharges ?? 0) + (additionalCharges ?? 0));
  const estimatedDeliveryDays = firstNumber(item, ["estimated_delivery_days", "estimatedDeliveryDays"]);
  const suppressionDates = record(item.suppression_dates);

  return {
    courierCompanyId: firstNumber(item, ["courier_company_id", "courierCompanyId", "id"]),
    courierName,
    freightCharge,
    codCharges,
    additionalCharges,
    totalCharge,
    estimatedDeliveryDays,
    etd: firstString(item, ["etd", "edd"]),
    pickupDate: firstString(item, ["pickup_date", "pickupDate", "pickup_datetime", "pickupDateTime"]),
    cutoffTime: firstString(item, ["cutoff_time", "cutoffTime"]),
    pickupDelayFrom: firstString(suppressionDates ?? {}, ["pickup_delay_from", "pickupDelayFrom"]),
    pickupDelayTo: firstString(suppressionDates ?? {}, ["pickup_delay_to", "pickupDelayTo"]),
    suppressDate: firstString(item, ["suppress_date", "suppressDate"]),
    suppressText: firstString(item, ["suppress_text", "suppressText"]),
    estimatedPickupDate: null,
    rating: firstNumber(item, ["rating"]),
    codAvailable: booleanFrom(item.cod),
    chargeWeightKg: firstNumber(item, ["charge_weight", "chargeWeight"]),
    rtoCharges: firstNumber(item, ["rto_charges", "rto_charge", "reverse_charges"]),
  };
}

export function normalizeCourierRates(payload: unknown): NormalizedCourierRate[] {
  const root = record(payload);
  const data = record(root?.data);
  const rawCouriers = data?.available_courier_companies;
  if (!Array.isArray(rawCouriers)) return [];
  return rawCouriers.map(normalizeCourierRate).filter((value): value is NormalizedCourierRate => value !== null);
}

export function chooseBestCourier(couriers: NormalizedCourierRate[]): NormalizedCourierRate | null {
  return [...couriers]
    .filter((courier) => courier.totalCharge !== null)
    .sort((a, b) => {
      const totalDifference = (a.totalCharge ?? Number.POSITIVE_INFINITY) - (b.totalCharge ?? Number.POSITIVE_INFINITY);
      if (totalDifference !== 0) return totalDifference;
      return (a.estimatedDeliveryDays ?? Number.POSITIVE_INFINITY) - (b.estimatedDeliveryDays ?? Number.POSITIVE_INFINITY);
    })[0] ?? null;
}
