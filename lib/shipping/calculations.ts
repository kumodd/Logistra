import type { ApprovedLogistraPricing, CostLine, GstTreatment, NormalizedCourierRate, OperationalCostInput, ScenarioCosts, ScenarioResult } from "./types";
import { classifyDestinationRegion } from "./region.ts";

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

type CostBuildOptions = {
  bestCourier: NormalizedCourierRate | null;
  operationalCosts?: OperationalCostInput;
  operationalSource: "user-input" | "approved-logistra-pricing";
  shippingSource?: "shiprocket" | "standard-estimate";
  pricing?: ApprovedLogistraPricing | null;
  monthlyOrderVolume?: number;
};

const operationalFields = [
  ["pickAndPackPerOrder", "Pick-and-pack", "per_order"],
  ["packagingPerOrder", "Packaging", "per_order"],
  ["storagePerOrder", "Storage allocation", "per_order"],
  ["receivingPerOrder", "Receiving allocation", "per_order"],
  ["putawayPerOrder", "Putaway allocation", "per_order"],
  ["returnsPerOrder", "Returns / RTO allocation", "per_order"],
  ["otherPerOrder", "Other agreed fulfilment cost", "per_order"],
  ["fixedMonthly", "Fixed monthly fulfilment cost", "per_month"],
  ["inventoryTransferMonthly", "Inventory transfer / replenishment", "per_month"],
] as const;

function shippingLines(bestCourier: NormalizedCourierRate | null, source: "shiprocket" | "standard-estimate"): CostLine[] {
  if (!bestCourier) return [];
  const lines: CostLine[] = [
    {
      key: "freight",
      label: `Courier freight — ${bestCourier.courierName}`,
      amount: bestCourier.freightCharge,
      unit: "per_order",
      source,
      includedInTotal: bestCourier.freightCharge !== null,
      note: source === "standard-estimate"
        ? "Temporary standard estimate; replace with a live or approved quote before making commercial decisions."
        : "Returned by the Shiprocket serviceability response; not a final invoice guarantee.",
    },
  ];
  if (bestCourier.codCharges !== null) {
    lines.push({ key: "cod", label: "COD charge", amount: bestCourier.codCharges, unit: "per_order", source, includedInTotal: true });
  }
  if (bestCourier.additionalCharges !== null) {
    lines.push({ key: "additionalCarrierCharges", label: "Additional returned carrier charges", amount: bestCourier.additionalCharges, unit: "per_order", source, includedInTotal: true });
  }
  if (bestCourier.rtoCharges !== null) {
    lines.push({ key: "rto", label: "RTO / reverse charge", amount: bestCourier.rtoCharges, unit: "per_return", source, includedInTotal: false, note: "Displayed separately; no return probability was supplied." });
  }
  return lines;
}

function operationalValue(options: CostBuildOptions, key: (typeof operationalFields)[number][0]): number | undefined {
  if (options.operationalSource === "approved-logistra-pricing") return options.pricing?.fees[key];
  return options.operationalCosts?.[key];
}

function gstTreatment(options: CostBuildOptions): GstTreatment {
  if (options.operationalSource === "approved-logistra-pricing") return options.pricing?.gstTreatment ?? "unknown";
  return options.operationalCosts?.gstTreatment ?? "unknown";
}

export function buildScenarioCosts(options: CostBuildOptions): ScenarioCosts {
  const lines = shippingLines(options.bestCourier, options.shippingSource ?? "shiprocket");
  const missingCosts: string[] = [];
  const assumptions = ["Courier amounts are returned provider quotes, not guaranteed delivery or final invoice amounts."];
  const shippingOnlyPerOrder = options.bestCourier?.totalCharge ?? null;
  const operationalAmounts: number[] = [];
  const requiredPerOrderKeys = new Set(["pickAndPackPerOrder", "packagingPerOrder", "storagePerOrder", "returnsPerOrder"]);
  if (options.operationalSource === "approved-logistra-pricing") {
    requiredPerOrderKeys.add("receivingPerOrder");
    requiredPerOrderKeys.add("putawayPerOrder");
  }

  for (const [key, label, unit] of operationalFields) {
    const amount = operationalValue(options, key);
    const isRequired = requiredPerOrderKeys.has(key) || key === "fixedMonthly" || key === "inventoryTransferMonthly";
    lines.push({
      key,
      label,
      amount: amount ?? null,
      unit,
      source: amount === undefined ? "unavailable" : options.operationalSource,
      includedInTotal: amount !== undefined,
      note: amount === undefined ? "Not configured or supplied." : undefined,
    });
    if (amount !== undefined && unit === "per_order") operationalAmounts.push(amount);
    if (amount === undefined && isRequired) missingCosts.push(label);
  }

  const gst = gstTreatment(options);
  if (gst === "unknown") missingCosts.push("GST treatment");
  if (!options.bestCourier) missingCosts.push("Comparable courier quote");
  if (options.monthlyOrderVolume === undefined) missingCosts.push("Monthly order volume for fixed-cost allocation");

  const fixedMonthly = operationalValue(options, "fixedMonthly");
  const transferMonthly = operationalValue(options, "inventoryTransferMonthly");
  const monthlyAllocatedPerOrder = options.monthlyOrderVolume && fixedMonthly !== undefined && transferMonthly !== undefined
    ? (fixedMonthly + transferMonthly) / options.monthlyOrderVolume
    : null;

  if (options.monthlyOrderVolume !== undefined) {
    if (fixedMonthly === undefined) assumptions.push("Fixed monthly cost was not configured or supplied.");
    if (transferMonthly === undefined) assumptions.push("Inventory transfer or replenishment cost was not configured or supplied.");
  }

  const totalComplete = missingCosts.length === 0 && monthlyAllocatedPerOrder !== null && shippingOnlyPerOrder !== null;
  const totalPerOrder = totalComplete ? round(shippingOnlyPerOrder + operationalAmounts.reduce((sum, value) => sum + value, 0) + monthlyAllocatedPerOrder) : null;
  const monthlyTotal = totalPerOrder !== null && options.monthlyOrderVolume !== undefined
    ? round(totalPerOrder * options.monthlyOrderVolume)
    : null;

  if (gst !== "unknown") assumptions.push(`Configured cost figures are ${gst} of GST.`);
  else assumptions.push("GST treatment is not known, so a fully comparable total is not shown.");

  return {
    shippingOnlyPerOrder,
    totalPerOrder,
    monthlyTotal,
    gstTreatment: gst,
    totalStatus: totalComplete ? "complete" : shippingOnlyPerOrder === null ? "unavailable" : "incomplete",
    lines,
    missingCosts: [...new Set(missingCosts)],
    assumptions,
  };
}

export function comparisonSummary(current: ScenarioResult, logistra: ScenarioResult) {
  const shippingDifferencePerOrder = current.costs.shippingOnlyPerOrder !== null && logistra.costs.shippingOnlyPerOrder !== null
    ? round(current.costs.shippingOnlyPerOrder - logistra.costs.shippingOnlyPerOrder)
    : null;
  const totalDifferencePerOrder = current.costs.totalPerOrder !== null && logistra.costs.totalPerOrder !== null
    ? round(current.costs.totalPerOrder - logistra.costs.totalPerOrder)
    : null;
  const monthlyDifference = current.costs.monthlyTotal !== null && logistra.costs.monthlyTotal !== null
    ? round(current.costs.monthlyTotal - logistra.costs.monthlyTotal)
    : null;
  const estimatedDaysDifference = current.bestCourier?.estimatedDeliveryDays !== null && current.bestCourier?.estimatedDeliveryDays !== undefined && logistra.bestCourier?.estimatedDeliveryDays !== null && logistra.bestCourier?.estimatedDeliveryDays !== undefined
    ? round(current.bestCourier.estimatedDeliveryDays - logistra.bestCourier.estimatedDeliveryDays)
    : null;
  const destinationRegion = classifyDestinationRegion(current.destinationPincode);
  const deliverySpeedPercentage = current.bestCourier?.estimatedDeliveryDays !== null && current.bestCourier?.estimatedDeliveryDays !== undefined && current.bestCourier.estimatedDeliveryDays > 0 && logistra.bestCourier?.estimatedDeliveryDays !== null && logistra.bestCourier?.estimatedDeliveryDays !== undefined
    ? round(((current.bestCourier.estimatedDeliveryDays - logistra.bestCourier.estimatedDeliveryDays) / current.bestCourier.estimatedDeliveryDays) * 100)
    : null;
  const costDifference = totalDifferencePerOrder ?? shippingDifferencePerOrder;
  const costWinner = costDifference === null
    ? null
    : costDifference > 0 ? "logistraFulfilment" : costDifference < 0 ? "currentWarehouse" : "tie";
  const winner = estimatedDaysDifference !== null
    ? estimatedDaysDifference >= 0 ? "logistraFulfilment" : "currentWarehouse"
    : costWinner;
  const winnerBasis = estimatedDaysDifference !== null ? "delivery" : costWinner !== null ? "cost" : null;

  const status = totalDifferencePerOrder !== null ? "complete" : shippingDifferencePerOrder !== null || estimatedDaysDifference !== null ? "partial" : "unavailable";
  const message = winnerBasis === "delivery" && winner === "logistraFulfilment"
    ? "Based on the returned delivery estimates, Logistra is faster or matches the central warehouse. Cost figures remain visible for commercial review."
    : winnerBasis === "delivery"
      ? "The central warehouse is faster in this result because the Logistra delivery estimate is longer."
      : status === "complete"
        ? "No delivery estimate was available, so the winner is based on the returned carrier quotes and configured or supplied cost inputs."
    : status === "partial"
      ? "Shipping or delivery indicators are available, but a complete fulfilment-cost comparison needs the missing cost inputs shown below."
      : "A comparable result is not available until both scenarios return usable data.";

  return { status, shippingDifferencePerOrder, totalDifferencePerOrder, monthlyDifference, estimatedDaysDifference, deliverySpeedPercentage, destinationRegion, winner, winnerBasis, message } as const;
}
