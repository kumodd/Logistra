import { getApprovedLogistraPricing, getLogistraFacility, getStandardEstimateOriginPincode, hasShiprocketCredentials, hasStandardRateEstimates } from "./config";
import { comparisonSummary, buildScenarioCosts } from "./calculations";
import { normalizeCourierRates, chooseBestCourier } from "./normalize";
import { estimatePickupDate } from "./pickup-estimate";
import { ShiprocketError, fetchServiceability } from "./shiprocket";
import { buildStandardCourierEstimate } from "./standard";
import type { ComparisonRequest, ComparisonResponse, ScenarioResult, ShippingRateRequest, ShippingRateResponse } from "./types";

function unavailableScenario(
  id: ScenarioResult["id"],
  label: ScenarioResult["label"],
  destinationPincode: string,
  message: string,
  serviceability: ScenarioResult["serviceability"],
  originPincode: string | null = null,
): ScenarioResult {
  return {
    id,
    label,
    status: "unavailable",
    serviceability,
    originPincode,
    destinationPincode,
    rateSource: null,
    quoteTimestamp: null,
    cachedQuote: false,
    couriers: [],
    bestCourier: null,
    costs: buildScenarioCosts({
      bestCourier: null,
      operationalCosts: undefined,
      operationalSource: id === "currentWarehouse" ? "user-input" : "approved-logistra-pricing",
      pricing: id === "logistraFulfilment" ? getApprovedLogistraPricing() : undefined,
    }),
    message,
    notes: [],
  };
}

async function lookupScenario(
  id: ScenarioResult["id"],
  label: ScenarioResult["label"],
  request: ShippingRateRequest,
  options: { costs?: ComparisonRequest["currentWarehouse"]["costs"]; monthlyOrderVolume?: number; logistraPricing?: ReturnType<typeof getApprovedLogistraPricing> },
): Promise<ScenarioResult> {
  const lookup = await fetchServiceability(request);
  const couriers = normalizeCourierRates(lookup.payload).map((courier) => ({
    ...courier,
    estimatedPickupDate: estimatePickupDate(courier, lookup.quoteTimestamp),
  }));
  const bestCourier = chooseBestCourier(couriers);
  const costs = buildScenarioCosts({
    bestCourier,
    operationalCosts: options.costs,
    operationalSource: id === "currentWarehouse" ? "user-input" : "approved-logistra-pricing",
    pricing: options.logistraPricing,
    monthlyOrderVolume: options.monthlyOrderVolume,
  });
  const notes: string[] = ["Rates are from the configured Shiprocket account for this pickup and destination PIN code."];
  if (id === "logistraFulfilment") notes.push("This does not by itself represent a separate Logistra carrier contract or negotiated fulfilment rate.");
  if (couriers.length > 0) notes.push("Approximate pickup dates are calculated by Logistra from the returned courier cutoff and pickup-delay information. They are not scheduled Shiprocket pickup dates; actual pickup may differ.");
  if (bestCourier && bestCourier.totalCharge === null) notes.push("The provider did not return enough charge fields for a comparable total on the selected courier.");

  return {
    id,
    label,
    status: couriers.length ? "available" : "unavailable",
    serviceability: couriers.length ? "available" : "unavailable",
    originPincode: request.pickupPincode,
    destinationPincode: request.deliveryPincode,
    rateSource: "Shiprocket account serviceability response",
    quoteTimestamp: lookup.quoteTimestamp,
    cachedQuote: lookup.cached,
    couriers,
    bestCourier,
    costs,
    message: couriers.length ? null : "No courier options were returned for this route and shipment profile.",
    notes,
  };
}

function standardScenario(
  id: ScenarioResult["id"],
  label: ScenarioResult["label"],
  request: ShippingRateRequest,
  options: { costs?: ComparisonRequest["currentWarehouse"]["costs"]; monthlyOrderVolume?: number; logistraPricing?: ReturnType<typeof getApprovedLogistraPricing> },
): ScenarioResult {
  const bestCourier = buildStandardCourierEstimate(request.pickupPincode, request.deliveryPincode, request.shipment);
  const costs = buildScenarioCosts({
    bestCourier,
    operationalCosts: options.costs,
    operationalSource: id === "currentWarehouse" ? "user-input" : "approved-logistra-pricing",
    shippingSource: "standard-estimate",
    pricing: options.logistraPricing,
    monthlyOrderVolume: options.monthlyOrderVolume,
  });

  return {
    id,
    label,
    status: "available",
    serviceability: "available",
    originPincode: request.pickupPincode,
    destinationPincode: request.deliveryPincode,
    rateSource: "Temporary standard estimate (replace before launch)",
    quoteTimestamp: new Date().toISOString(),
    cachedQuote: false,
    couriers: [bestCourier],
    bestCourier,
    costs,
    message: null,
    notes: [
      "This is a temporary illustrative estimate based on broad PIN-code regions and shipment weight, not a live carrier quote or delivery promise.",
      ...(id === "logistraFulfilment" ? [`The temporary comparison assumes a Logistra dispatch origin of ${request.pickupPincode}; confirm the operating facility before relying on this result.`] : []),
    ],
  };
}

function standardComparison(request: ComparisonRequest): ComparisonResponse {
  const logistraOrigin = getStandardEstimateOriginPincode();
  const currentWarehouse = standardScenario(
    "currentWarehouse",
    "Current Warehouse",
    { pickupPincode: request.currentWarehouse.pickupPincode, deliveryPincode: request.deliveryPincode, shipment: request.shipment },
    { costs: request.currentWarehouse.costs, monthlyOrderVolume: request.monthlyOrderVolume },
  );
  const logistraFulfilment = standardScenario(
    "logistraFulfilment",
    "Logistra Fulfilment",
    { pickupPincode: logistraOrigin, deliveryPincode: request.deliveryPincode, shipment: request.shipment },
    { monthlyOrderVolume: request.monthlyOrderVolume, logistraPricing: getApprovedLogistraPricing() },
  );
  const quoteTimestamp = new Date().toISOString();
  return {
    quoteTimestamp,
    destinationPincode: request.deliveryPincode,
    shipment: request.shipment,
    monthlyOrderVolume: request.monthlyOrderVolume ?? null,
    currentWarehouse,
    logistraFulfilment,
    comparison: comparisonSummary(currentWarehouse, logistraFulfilment),
  };
}

function providerMessage(error: unknown): string {
  if (error instanceof ShiprocketError) return error.message;
  return "The shipping provider could not return a quote. Please try again.";
}

export async function buildComparison(request: ComparisonRequest): Promise<ComparisonResponse> {
  if (!hasShiprocketCredentials()) {
    if (hasStandardRateEstimates()) return standardComparison(request);
    throw new ShiprocketError("not_configured", "Live shipping rates are not configured yet.", 503);
  }

  const currentRequest: ShippingRateRequest = {
    pickupPincode: request.currentWarehouse.pickupPincode,
    deliveryPincode: request.deliveryPincode,
    shipment: request.shipment,
  };
  const currentWarehouse = await lookupScenario("currentWarehouse", "Current Warehouse", currentRequest, {
    costs: request.currentWarehouse.costs,
    monthlyOrderVolume: request.monthlyOrderVolume,
  });

  const facility = getLogistraFacility();
  const pricing = getApprovedLogistraPricing();
  let logistraFulfilment: ScenarioResult;
  if (!facility.available) {
    logistraFulfilment = unavailableScenario(
      "logistraFulfilment",
      "Logistra Fulfilment",
      request.deliveryPincode,
      facility.reason,
      "not-configured",
    );
  } else {
    const logistraRequest: ShippingRateRequest = {
      pickupPincode: facility.originPincode,
      deliveryPincode: request.deliveryPincode,
      shipment: request.shipment,
    };
    try {
      logistraFulfilment = await lookupScenario("logistraFulfilment", "Logistra Fulfilment", logistraRequest, {
        monthlyOrderVolume: request.monthlyOrderVolume,
        logistraPricing: pricing,
      });
      if (!pricing) logistraFulfilment.notes.push("Approved Logistra fulfilment pricing is not configured, so only shipping-only information can be shown.");
    } catch (error) {
      logistraFulfilment = unavailableScenario(
        "logistraFulfilment",
        "Logistra Fulfilment",
        request.deliveryPincode,
        providerMessage(error),
        "error",
        facility.originPincode,
      );
    }
  }

  const quoteTimestamp = currentWarehouse.quoteTimestamp ?? new Date().toISOString();
  return {
    quoteTimestamp,
    destinationPincode: request.deliveryPincode,
    shipment: request.shipment,
    monthlyOrderVolume: request.monthlyOrderVolume ?? null,
    currentWarehouse,
    logistraFulfilment,
    comparison: comparisonSummary(currentWarehouse, logistraFulfilment),
  };
}

export async function buildShippingRateResponse(request: ShippingRateRequest): Promise<ShippingRateResponse> {
  if (!hasShiprocketCredentials()) {
    if (hasStandardRateEstimates()) {
      const bestCourier = buildStandardCourierEstimate(request.pickupPincode, request.deliveryPincode, request.shipment);
      const scenario: ScenarioResult = {
        id: "currentWarehouse",
        label: "Current Warehouse",
        status: "available",
        serviceability: "available",
        originPincode: request.pickupPincode,
        destinationPincode: request.deliveryPincode,
        rateSource: "Temporary standard estimate (replace before launch)",
        quoteTimestamp: new Date().toISOString(),
        cachedQuote: false,
        couriers: [bestCourier],
        bestCourier,
        costs: buildScenarioCosts({ bestCourier, operationalSource: "user-input", shippingSource: "standard-estimate" }),
        message: null,
        notes: ["This is a temporary illustrative estimate based on broad PIN-code regions and shipment weight, not a live carrier quote or delivery promise."],
      };
      return { quoteTimestamp: scenario.quoteTimestamp ?? new Date().toISOString(), request, scenario };
    }
    throw new ShiprocketError("not_configured", "Live shipping rates are not configured yet.", 503);
  }
  const scenario = await lookupScenario("currentWarehouse", "Current Warehouse", request, {});
  return { quoteTimestamp: scenario.quoteTimestamp ?? new Date().toISOString(), request, scenario };
}
