import test from "node:test";
import assert from "node:assert/strict";
import { buildScenarioCosts, comparisonSummary } from "../lib/shipping/calculations.ts";
import { normalizeCourierRates } from "../lib/shipping/normalize.ts";
import { buildStandardCourierEstimate } from "../lib/shipping/standard.ts";
import { validateComparisonRequest } from "../lib/shipping/validation.ts";
import type { NormalizedCourierRate, ScenarioResult } from "../lib/shipping/types.ts";

const courier: NormalizedCourierRate = {
  courierCompanyId: 12,
  courierName: "Example courier",
  freightCharge: 100,
  codCharges: 10,
  additionalCharges: 0,
  totalCharge: 110,
  estimatedDeliveryDays: 4,
  etd: "4 days",
  pickupDate: null,
  rating: 4.4,
  codAvailable: true,
  chargeWeightKg: 0.5,
  rtoCharges: 40,
};

test("complete cost totals include explicit per-order and monthly allocation", () => {
  const costs = buildScenarioCosts({
    bestCourier: courier,
    operationalSource: "user-input",
    monthlyOrderVolume: 100,
    operationalCosts: {
      pickAndPackPerOrder: 10,
      packagingPerOrder: 2,
      storagePerOrder: 3,
      returnsPerOrder: 4,
      otherPerOrder: 1,
      fixedMonthly: 100,
      inventoryTransferMonthly: 200,
      gstTreatment: "inclusive",
    },
  });

  assert.equal(costs.totalStatus, "complete");
  assert.equal(costs.totalPerOrder, 133);
  assert.equal(costs.monthlyTotal, 13_300);
  assert.deepEqual(costs.missingCosts, []);
});

test("unknown costs remain unavailable instead of becoming zero", () => {
  const costs = buildScenarioCosts({ bestCourier: courier, operationalSource: "user-input" });

  assert.equal(costs.shippingOnlyPerOrder, 110);
  assert.equal(costs.totalPerOrder, null);
  assert.equal(costs.monthlyTotal, null);
  assert.equal(costs.totalStatus, "incomplete");
  assert.ok(costs.missingCosts.includes("Pick-and-pack"));
  assert.ok(costs.missingCosts.includes("GST treatment"));
});

function scenario(id: ScenarioResult["id"], totalPerOrder: number, shippingOnlyPerOrder: number, monthlyTotal: number, days: number): ScenarioResult {
  return {
    id,
    label: id === "currentWarehouse" ? "Current Warehouse" : "Logistra Fulfilment",
    status: "available",
    serviceability: "available",
    originPincode: "400001",
    destinationPincode: "800001",
    rateSource: "test",
    quoteTimestamp: new Date(0).toISOString(),
    cachedQuote: false,
    couriers: [],
    bestCourier: { ...courier, totalCharge: shippingOnlyPerOrder, estimatedDeliveryDays: days },
    costs: {
      shippingOnlyPerOrder,
      totalPerOrder,
      monthlyTotal,
      gstTreatment: "inclusive",
      totalStatus: "complete",
      lines: [],
      missingCosts: [],
      assumptions: [],
    },
    message: null,
    notes: [],
  };
}

test("comparison signs describe Logistra as cheaper or faster only when data supports it", () => {
  const result = comparisonSummary(scenario("currentWarehouse", 150, 120, 15_000, 7), scenario("logistraFulfilment", 140, 118, 14_000, 3));

  assert.equal(result.totalDifferencePerOrder, 10);
  assert.equal(result.monthlyDifference, 1_000);
  assert.equal(result.estimatedDaysDifference, 4);
  assert.equal(result.winner, "logistraFulfilment");
  assert.equal(result.status, "complete");
});

test("validation rejects malformed PIN codes and negative shipment values", () => {
  const result = validateComparisonRequest({
    currentWarehouse: { pickupPincode: "4000" },
    deliveryPincode: "800001",
    shipment: { weightKg: -0.5, paymentMode: "prepaid" },
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.fieldErrors["currentWarehouse.pickupPincode"]);
    assert.ok(result.fieldErrors["shipment.weightKg"]);
  }
});

test("normalization keeps provider courier details distinct", () => {
  const couriers = normalizeCourierRates({ data: { available_courier_companies: [
    { courier_company_id: 7, courier_name: "Documented courier", freight_charge: "65", cod: 0, estimated_delivery_days: "3", etd: "Oct 23, 2026", pickup_date: "2026-10-21", rating: "4.4" },
    { courier_company_id: 8, courier_name: "Another courier", freight_charge: "80", cod: 0, estimated_delivery_days: "5", etd: "Oct 25, 2026", pickup_date: "2026-10-21", rating: "4.1" },
  ] } });

  assert.equal(couriers.length, 2);
  assert.equal(couriers[0].freightCharge, 65);
  assert.equal(couriers[0].totalCharge, 65);
  assert.equal(couriers[0].codCharges, null);
  assert.equal(couriers[0].rtoCharges, null);
  assert.equal(couriers[0].pickupDate, "2026-10-21");
  assert.equal(couriers[0].rating, 4.4);
  assert.equal(couriers[0].etd, "Oct 23, 2026");
});

test("standard fallback produces a clearly bounded estimate without provider credentials", () => {
  const estimate = buildStandardCourierEstimate("400001", "800001", {
    weightKg: 0.5,
    paymentMode: "prepaid",
  });

  assert.equal(estimate.courierName, "Standard courier estimate");
  assert.equal(estimate.freightCharge, 150);
  assert.equal(estimate.totalCharge, 150);
  assert.equal(estimate.etd, "5–7 days (estimate)");
});
