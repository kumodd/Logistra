import type { NormalizedCourierRate, ShipmentInput } from "./types";

type RouteTier = "same-region" | "adjacent-region" | "long-distance" | "other";

const STANDARD_COURIER_NAME = "Standard courier estimate";

// Temporary values only. Replace this table with approved/live pricing later.
export const STANDARD_ESTIMATE_PRICING = {
  weightBands: [
    { maxWeightKg: 0.5, charge: 95 },
    { maxWeightKg: 1, charge: 120 },
    { maxWeightKg: 2, charge: 155 },
    { maxWeightKg: 5, charge: 240 },
  ],
  chargePerAdditionalKg: 35,
  routeAdjustment: {
    sameRegion: 0,
    adjacentRegion: 25,
    longDistance: 55,
    other: 75,
  },
  codCharge: 30,
} as const;

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function regionForPincode(pincode: string): "north" | "west" | "south" | "east" | "other" {
  switch (pincode[0]) {
    case "1":
    case "2":
      return "north";
    case "3":
    case "4":
      return "west";
    case "5":
    case "6":
      return "south";
    case "7":
    case "8":
      return "east";
    default:
      return "other";
  }
}

function routeTier(pickupPincode: string, deliveryPincode: string): RouteTier {
  const pickupRegion = regionForPincode(pickupPincode);
  const deliveryRegion = regionForPincode(deliveryPincode);
  if (pickupRegion === "other" || deliveryRegion === "other") return "other";
  if (pickupRegion === deliveryRegion) return "same-region";
  const adjacentRegions = new Set([
    ["north", "west"].sort().join(":"),
    ["north", "east"].sort().join(":"),
    ["south", "west"].sort().join(":"),
    ["south", "east"].sort().join(":"),
  ]);
  return adjacentRegions.has([pickupRegion, deliveryRegion].sort().join(":")) ? "adjacent-region" : "long-distance";
}

function weightBase(weightKg: number): number {
  const band = STANDARD_ESTIMATE_PRICING.weightBands.find((item) => weightKg <= item.maxWeightKg);
  return band?.charge ?? 240 + Math.ceil(weightKg - 5) * STANDARD_ESTIMATE_PRICING.chargePerAdditionalKg;
}

function routeAdjustment(tier: RouteTier): number {
  if (tier === "same-region") return STANDARD_ESTIMATE_PRICING.routeAdjustment.sameRegion;
  if (tier === "adjacent-region") return STANDARD_ESTIMATE_PRICING.routeAdjustment.adjacentRegion;
  if (tier === "long-distance") return STANDARD_ESTIMATE_PRICING.routeAdjustment.longDistance;
  return STANDARD_ESTIMATE_PRICING.routeAdjustment.other;
}

function deliveryEstimate(tier: RouteTier): { days: number; label: string } {
  if (tier === "same-region") return { days: 2.5, label: "2–3 days (estimate)" };
  if (tier === "adjacent-region") return { days: 4, label: "3–5 days (estimate)" };
  if (tier === "long-distance") return { days: 6, label: "5–7 days (estimate)" };
  return { days: 8, label: "6–9 days (estimate)" };
}

/**
 * Deliberately conservative, temporary values used only when live provider
 * credentials are not configured. Keep this clearly labelled in the UI and
 * replace it with approved/live pricing before relying on it commercially.
 */
export function buildStandardCourierEstimate(
  pickupPincode: string,
  deliveryPincode: string,
  shipment: ShipmentInput,
): NormalizedCourierRate {
  const tier = routeTier(pickupPincode, deliveryPincode);
  const freightCharge = round(weightBase(shipment.weightKg) + routeAdjustment(tier));
  const codCharges = shipment.paymentMode === "cod" ? STANDARD_ESTIMATE_PRICING.codCharge : 0;
  const delivery = deliveryEstimate(tier);

  return {
    courierCompanyId: null,
    courierName: STANDARD_COURIER_NAME,
    freightCharge,
    codCharges,
    additionalCharges: null,
    totalCharge: round(freightCharge + codCharges),
    estimatedDeliveryDays: delivery.days,
    etd: delivery.label,
    pickupDate: null,
    rating: null,
    codAvailable: true,
    chargeWeightKg: shipment.weightKg,
    rtoCharges: null,
  };
}
