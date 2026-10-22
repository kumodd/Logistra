import type { ComparisonRequest, OperationalCostInput, PaymentMode, ShipmentInput, ShippingRateRequest } from "./types";

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; fieldErrors: Record<string, string> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value.trim() : null;
}

function numberValue(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function optionalNumber(
  record: Record<string, unknown>,
  key: string,
  fieldErrors: Record<string, string>,
  minimum = 0,
  maximum = 1_000_000,
  errorKey = key,
): number | undefined {
  if (record[key] === undefined || record[key] === null || record[key] === "") return undefined;
  const value = numberValue(record[key]);
  if (value === undefined || value < minimum || value > maximum) {
    fieldErrors[errorKey] = `Enter a number between ${minimum} and ${maximum}.`;
    return undefined;
  }
  return value;
}

function requiredNumber(
  record: Record<string, unknown>,
  key: string,
  fieldErrors: Record<string, string>,
  minimum: number,
  maximum: number,
  errorKey = key,
): number {
  const value = numberValue(record[key]);
  if (value === undefined || value < minimum || value > maximum) {
    fieldErrors[errorKey] = `Enter a number between ${minimum} and ${maximum}.`;
    return minimum;
  }
  return value;
}

function pincode(record: Record<string, unknown>, key: string, fieldErrors: Record<string, string>, errorKey = key): string {
  const value = stringValue(record[key]) ?? "";
  if (!/^\d{6}$/.test(value)) fieldErrors[errorKey] = "Enter a valid six-digit Indian PIN code.";
  return value;
}

function shipment(value: unknown, prefix: string, fieldErrors: Record<string, string>): ShipmentInput {
  const record = isRecord(value) ? value : {};
  const weightKg = requiredNumber(record, "weightKg", fieldErrors, 0.01, 100, `${prefix}.weightKg`);
  const lengthCm = optionalNumber(record, "lengthCm", fieldErrors, 1, 200, `${prefix}.lengthCm`);
  const breadthCm = optionalNumber(record, "breadthCm", fieldErrors, 1, 200, `${prefix}.breadthCm`);
  const heightCm = optionalNumber(record, "heightCm", fieldErrors, 1, 200, `${prefix}.heightCm`);
  const declaredValue = optionalNumber(record, "declaredValue", fieldErrors, 0, 10_000_000, `${prefix}.declaredValue`);
  const paymentMode = record.paymentMode;

  if (paymentMode !== "prepaid" && paymentMode !== "cod") {
    fieldErrors[`${prefix}.paymentMode`] = "Choose prepaid or cash on delivery.";
  }

  const mode = record.mode === "Surface" || record.mode === "Air" ? record.mode : undefined;
  return {
    weightKg,
    ...(lengthCm === undefined ? {} : { lengthCm }),
    ...(breadthCm === undefined ? {} : { breadthCm }),
    ...(heightCm === undefined ? {} : { heightCm }),
    paymentMode: (paymentMode === "cod" ? "cod" : "prepaid") as PaymentMode,
    ...(declaredValue === undefined ? {} : { declaredValue }),
    ...(mode ? { mode } : {}),
  };
}

function operationalCosts(value: unknown, prefix: string, fieldErrors: Record<string, string>): OperationalCostInput | undefined {
  if (value === undefined || value === null) return undefined;
  if (!isRecord(value)) {
    fieldErrors[prefix] = "Operating costs must be an object.";
    return undefined;
  }

  const costKeys = [
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
  const costs: OperationalCostInput = {};
  for (const key of costKeys) {
    const valueForKey = optionalNumber(value, key, fieldErrors, 0, 10_000_000, `${prefix}.${key}`);
    if (valueForKey !== undefined) costs[key] = valueForKey;
  }
  if (value.gstTreatment !== undefined && value.gstTreatment !== "inclusive" && value.gstTreatment !== "exclusive" && value.gstTreatment !== "unknown") {
    fieldErrors[`${prefix}.gstTreatment`] = "GST treatment must be inclusive, exclusive, or unknown.";
  } else if (value.gstTreatment !== undefined) {
    costs.gstTreatment = value.gstTreatment;
  }
  return costs;
}

export function validateShippingRateRequest(input: unknown): ValidationResult<ShippingRateRequest> {
  const fieldErrors: Record<string, string> = {};
  const record = isRecord(input) ? input : {};
  const request: ShippingRateRequest = {
    pickupPincode: pincode(record, "pickupPincode", fieldErrors),
    deliveryPincode: pincode(record, "deliveryPincode", fieldErrors),
    shipment: shipment(record.shipment, "shipment", fieldErrors),
  };
  return Object.keys(fieldErrors).length ? { ok: false, fieldErrors } : { ok: true, value: request };
}

export function validateComparisonRequest(input: unknown): ValidationResult<ComparisonRequest> {
  const fieldErrors: Record<string, string> = {};
  const record = isRecord(input) ? input : {};
  const currentWarehouse = isRecord(record.currentWarehouse) ? record.currentWarehouse : {};
  const monthlyOrderVolume = optionalNumber(record, "monthlyOrderVolume", fieldErrors, 1, 1_000_000);
  const request: ComparisonRequest = {
    currentWarehouse: {
    pickupPincode: pincode(currentWarehouse, "pickupPincode", fieldErrors, "currentWarehouse.pickupPincode"),
      costs: operationalCosts(currentWarehouse.costs, "currentWarehouse.costs", fieldErrors),
    },
    deliveryPincode: pincode(record, "deliveryPincode", fieldErrors),
    shipment: shipment(record.shipment, "shipment", fieldErrors),
    ...(monthlyOrderVolume === undefined ? {} : { monthlyOrderVolume }),
  };
  return Object.keys(fieldErrors).length ? { ok: false, fieldErrors } : { ok: true, value: request };
}
