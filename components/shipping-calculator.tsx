"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight } from "./icons";
import { formatPickupEstimate } from "@/lib/shipping/pickup-estimate";
import type { ComparisonResponse, CostLine, NormalizedCourierRate, ScenarioResult } from "@/lib/shipping/types";

type FormValues = {
  currentPincode: string;
  deliveryPincode: string;
  weightKg: string;
  lengthCm: string;
  breadthCm: string;
  heightCm: string;
  paymentMode: "prepaid" | "cod";
  declaredValue: string;
  monthlyOrderVolume: string;
  currentPickAndPack: string;
  currentPackaging: string;
  currentStorage: string;
  currentReturns: string;
  currentOther: string;
  currentFixedMonthly: string;
  currentTransferMonthly: string;
  currentGstTreatment: "" | "inclusive" | "exclusive" | "unknown";
};

const initialValues: FormValues = {
  currentPincode: "",
  deliveryPincode: "",
  weightKg: "",
  lengthCm: "",
  breadthCm: "",
  heightCm: "",
  paymentMode: "prepaid",
  declaredValue: "",
  monthlyOrderVolume: "",
  currentPickAndPack: "",
  currentPackaging: "",
  currentStorage: "",
  currentReturns: "",
  currentOther: "",
  currentFixedMonthly: "",
  currentTransferMonthly: "",
  currentGstTreatment: "",
};

function numberOrUndefined(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function rupees(value: number | null): string {
  if (value === null) return "Unavailable";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
}

function valueOrUnavailable(value: number | null, suffix = ""): string {
  return value === null ? "Unavailable" : `${value}${suffix}`;
}

function formatProviderDate(value: string | null): string {
  if (!value) return "Unavailable";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(year, month - 1, day));
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(parsed);
}

function pickupEstimateLabel(courier: NormalizedCourierRate): string {
  return formatPickupEstimate(courier.estimatedPickupDate);
}

function ratingLabel(value: number | null): string {
  return value === null ? "Not available" : `${value.toFixed(1)} / 5`;
}

function percentageLabel(value: number | null): string {
  if (value === null) return "Unavailable";
  if (value === 0) return "Same speed";
  const amount = Math.abs(value) % 1 === 0 ? Math.abs(value).toFixed(0) : Math.abs(value).toFixed(1);
  return `${amount}% ${value > 0 ? "faster" : "slower"} with Logistra`;
}

function deliveryDifferenceLabel(value: number | null): string {
  if (value === null) return "Unavailable";
  if (value === 0) return "Same delivery time";
  const days = Math.abs(value);
  return `${days} day${days === 1 ? "" : "s"} ${value > 0 ? "earlier" : "later"} with Logistra`;
}

function costDifferenceLabel(value: number | null): string {
  if (value === null) return "Unavailable";
  if (value === 0) return "Same cost";
  return `${rupees(Math.abs(value))} ${value > 0 ? "lower" : "higher"} with Logistra`;
}

function fieldError(values: FormValues, key: keyof FormValues): string | undefined {
  const value = values[key];
  if (typeof value !== "string" || !value.trim()) return undefined;
  if (key.toLowerCase().includes("pincode") && !/^\d{6}$/.test(value.trim())) return "Use six digits.";
  if (key === "weightKg" && (numberOrUndefined(value) ?? 0) <= 0) return "Enter a value above zero.";
  if (["lengthCm", "breadthCm", "heightCm"].includes(key) && (numberOrUndefined(value) ?? 0) <= 0) return "Enter a value above zero.";
  if (["declaredValue", "monthlyOrderVolume", "currentPickAndPack", "currentPackaging", "currentStorage", "currentReturns", "currentOther", "currentFixedMonthly", "currentTransferMonthly"].includes(key) && (numberOrUndefined(value) ?? -1) < 0) return "Use zero or a positive number.";
  return undefined;
}

function sourceLabel(line: CostLine): string {
  if (line.source === "shiprocket") return "Shiprocket quote";
  if (line.source === "standard-estimate") return "Temporary standard estimate";
  if (line.source === "approved-logistra-pricing") return "Approved Logistra pricing";
  if (line.source === "user-input") return "Your input";
  return "Not configured";
}

function ScenarioCard({ scenario }: { scenario: ScenarioResult }) {
  return (
    <article className={`calculator-scenario calculator-scenario-${scenario.id}`}>
      <div className="calculator-scenario-head">
        <div><span className="eyebrow">Option {scenario.id === "currentWarehouse" ? "A" : "B"}</span><h3>{scenario.label}</h3></div>
        <span className={`calculator-status calculator-status-${scenario.status}`}>{scenario.status === "available" ? scenario.rateSource?.startsWith("Temporary") ? "Standard estimate" : "Data available" : "Unavailable / provisional"}</span>
      </div>
      <dl className="calculator-meta">
        <div><dt>Dispatch origin</dt><dd>{scenario.originPincode ?? "Not configured"}</dd></div>
        <div><dt>Destination</dt><dd>{scenario.destinationPincode}</dd></div>
        <div><dt>Rate source</dt><dd>{scenario.rateSource ?? "Not available"}</dd></div>
        <div><dt>Quote status</dt><dd>{scenario.quoteTimestamp ? scenario.cachedQuote ? "Short-lived cached quote" : "Fetched for this request" : "Not available"}</dd></div>
      </dl>

      {scenario.message && <p className="calculator-notice">{scenario.message}</p>}
      {scenario.couriers.length > 0 && (
        <>
          <div className="calculator-best-rate">
            <span className="eyebrow">Best comparable returned quote</span>
            <strong>{scenario.bestCourier ? rupees(scenario.bestCourier.totalCharge) : "Unavailable"}</strong>
            {scenario.bestCourier ? <div className="calculator-best-rate-grid">
              <div><span>Courier</span><strong>{scenario.bestCourier.courierName}</strong></div>
              <div><span>Rating</span><strong>{ratingLabel(scenario.bestCourier.rating)}</strong></div>
              <div><span>Pickup by</span><strong>{pickupEstimateLabel(scenario.bestCourier)}</strong></div>
              <div><span>Estimated delivery</span><strong>{formatProviderDate(scenario.bestCourier.etd)}</strong><small>{valueOrUnavailable(scenario.bestCourier.estimatedDeliveryDays, " days")}</small></div>
            </div> : <p>No courier with a usable charge</p>}
          </div>
          <div className="calculator-courier-list">
            <div className="calculator-list-heading"><span className="calculator-subhead">All returned courier options</span><span className="calculator-courier-count">{scenario.couriers.length} returned</span></div>
            <div className="calculator-courier-options" role="list">
              {scenario.couriers.map((courier, index) => <div className="calculator-courier-row" role="listitem" key={`${courier.courierCompanyId ?? "unknown"}-${courier.courierName}-${index}`}>
                <div className="calculator-courier-name"><strong>{courier.courierName}</strong><small>Rating {ratingLabel(courier.rating)}</small></div>
                <div className="calculator-courier-pickup-field"><span>Pickup by</span><strong>{pickupEstimateLabel(courier)}</strong></div>
                <div className="calculator-courier-delivery-field"><span>Estimated delivery</span><strong>{formatProviderDate(courier.etd)}</strong><small>{valueOrUnavailable(courier.estimatedDeliveryDays, " days")}</small></div>
                <strong className="calculator-courier-price">{rupees(courier.totalCharge)}</strong>
              </div>)}
            </div>
            <p className="calculator-pickup-disclaimer">Pickup date is estimated from courier cutoff and available delay information. Actual pickup may differ.</p>
          </div>
        </>
      )}

      <div className="calculator-costs">
        <span className="calculator-subhead">Cost breakdown</span>
        {scenario.costs.lines.filter((line) => line.amount !== null || line.source === "unavailable").map((line) => <div className="calculator-cost-row" key={line.key}><span>{line.label}<small>{sourceLabel(line)}</small></span><strong>{line.amount === null ? "Not available" : line.unit === "per_order" ? rupees(line.amount) : rupees(line.amount)}</strong></div>)}
        <div className="calculator-total-row"><span>Shipping only / order</span><strong>{rupees(scenario.costs.shippingOnlyPerOrder)}</strong></div>
        <div className="calculator-total-row"><span>Fully loaded / order</span><strong>{rupees(scenario.costs.totalPerOrder)}</strong></div>
        <div className="calculator-total-row"><span>Estimated monthly total</span><strong>{rupees(scenario.costs.monthlyTotal)}</strong></div>
      </div>

      {scenario.costs.missingCosts.length > 0 && <div className="calculator-missing"><strong>Not included in a complete total</strong><ul>{scenario.costs.missingCosts.map((item) => <li key={item}>{item}</li>)}</ul></div>}
      {scenario.notes.map((note) => <p className="calculator-footnote" key={note}>{note}</p>)}
    </article>
  );
}

function ComparisonSummary({ response }: { response: ComparisonResponse }) {
  const comparison = response.comparison;
  const winnerTitle = comparison.winner === "logistraFulfilment"
    ? "Logistra wins this comparison"
    : comparison.winner === "currentWarehouse"
      ? "Central warehouse wins this comparison"
      : comparison.winner === "tie"
        ? "The comparison is tied"
        : "No clear winner yet";
  const winnerReason = comparison.winnerBasis === "delivery"
    ? comparison.winner === "logistraFulfilment"
      ? comparison.estimatedDaysDifference === 0 ? "Logistra matches the central warehouse delivery estimate, with the delivery result treated as the deciding signal." : "Logistra reaches the customer sooner in the returned estimate, even when its cost is the same or higher."
      : "The Logistra delivery estimate is longer here; that is the only factor working against Logistra in this comparison."
    : "Delivery timing was unavailable, so the available cost data determines the result.";
  const outsideEasternIndia = comparison.destinationRegion === "outsideEasternIndia";
  const routingRecommendation = outsideEasternIndia && comparison.winner === "currentWarehouse"
    ? "This destination is outside Logistra’s Eastern India focus, and the central warehouse is faster in this quote. Serve this area from your central warehouse for the better delivery outcome."
    : outsideEasternIndia && comparison.winner === "logistraFulfilment"
      ? "This destination is outside Logistra’s Eastern India focus. The current quote is faster with Logistra, but confirm the regional operating model before moving inventory."
      : outsideEasternIndia
        ? "This destination is outside Logistra’s Eastern India focus. Keep fulfilment with your central warehouse unless a regional case is validated."
        : null;
  return (
    <section className={`calculator-summary calculator-summary-${comparison.winner ?? "pending"}`} aria-live="polite">
      <div className="calculator-summary-head"><div><span className="eyebrow">Comparison summary</span><h3>Delivery first. Commercial context alongside it.</h3></div><span className="calculator-quote-time">Quoted {new Date(response.quoteTimestamp).toLocaleString("en-IN")}</span></div>
      <div className={`calculator-winner calculator-winner-${comparison.winner ?? "pending"}`}>
        <div><span className="eyebrow">Result</span><strong>{winnerTitle}</strong><p>{winnerReason}</p></div>
        <div className="calculator-winner-signal"><span>Delivery speed vs central warehouse</span><strong>{percentageLabel(comparison.deliverySpeedPercentage)}</strong></div>
      </div>
      {routingRecommendation && <div className="calculator-routing-recommendation"><span className="eyebrow">Regional routing recommendation</span><strong>{comparison.winner === "currentWarehouse" ? "Serve this area from your central warehouse." : "Review the regional operating fit before moving inventory."}</strong><p>{routingRecommendation}</p></div>}
      <p>{comparison.message}</p>
      <div className="calculator-summary-grid">
        <div><span>Delivery speed</span><strong>{percentageLabel(comparison.deliverySpeedPercentage)}</strong><small>Relative to central warehouse delivery time</small></div>
        <div><span>Delivery timing</span><strong>{deliveryDifferenceLabel(comparison.estimatedDaysDifference)}</strong><small>Based on returned delivery-day estimates</small></div>
        <div><span>Shipping cost / order</span><strong>{costDifferenceLabel(comparison.shippingDifferencePerOrder)}</strong><small>Shiprocket quote comparison</small></div>
        <div><span>Fully loaded cost / order</span><strong>{costDifferenceLabel(comparison.totalDifferencePerOrder)}</strong><small>Shown when all required inputs are available</small></div>
        <div><span>Estimated monthly cost</span><strong>{costDifferenceLabel(comparison.monthlyDifference)}</strong><small>Based on supplied monthly order volume</small></div>
      </div>
      <p className="calculator-summary-note">When both delivery estimates are available, a faster or equal Logistra delivery wins the comparison. Costs remain visible so you can review the complete commercial picture.</p>
      <a className="button button-dark" href="/contact">Discuss the operating model <ArrowUpRight size={16} /></a>
    </section>
  );
}

export default function ShippingCalculator() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function update(name: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setError(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors: string[] = [];
    for (const key of ["currentPincode", "deliveryPincode", "weightKg"] as const) if (!values[key].trim()) errors.push(`${key} is required.`);
    for (const key of Object.keys(values) as (keyof FormValues)[]) {
      const message = fieldError(values, key);
      if (message) errors.push(`${key}: ${message}`);
    }
    if (errors.length) {
      setError("Please correct the shipment details before requesting a comparison.");
      return;
    }

    const currentCosts = {
      pickAndPackPerOrder: numberOrUndefined(values.currentPickAndPack),
      packagingPerOrder: numberOrUndefined(values.currentPackaging),
      storagePerOrder: numberOrUndefined(values.currentStorage),
      returnsPerOrder: numberOrUndefined(values.currentReturns),
      otherPerOrder: numberOrUndefined(values.currentOther),
      fixedMonthly: numberOrUndefined(values.currentFixedMonthly),
      inventoryTransferMonthly: numberOrUndefined(values.currentTransferMonthly),
      ...(values.currentGstTreatment ? { gstTreatment: values.currentGstTreatment } : {}),
    };
    const hasCurrentCosts = Object.values(currentCosts).some((value) => value !== undefined);
    const body = {
      currentWarehouse: { pickupPincode: values.currentPincode.trim(), ...(hasCurrentCosts ? { costs: currentCosts } : {}) },
      deliveryPincode: values.deliveryPincode.trim(),
      shipment: {
        weightKg: numberOrUndefined(values.weightKg),
        ...(numberOrUndefined(values.lengthCm) === undefined ? {} : { lengthCm: numberOrUndefined(values.lengthCm) }),
        ...(numberOrUndefined(values.breadthCm) === undefined ? {} : { breadthCm: numberOrUndefined(values.breadthCm) }),
        ...(numberOrUndefined(values.heightCm) === undefined ? {} : { heightCm: numberOrUndefined(values.heightCm) }),
        paymentMode: values.paymentMode,
        ...(numberOrUndefined(values.declaredValue) === undefined ? {} : { declaredValue: numberOrUndefined(values.declaredValue) }),
      },
      ...(numberOrUndefined(values.monthlyOrderVolume) === undefined ? {} : { monthlyOrderVolume: numberOrUndefined(values.monthlyOrderVolume) }),
    };

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/fulfilment-comparison", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json() as ComparisonResponse & { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "The comparison could not be completed.");
      setResult(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The comparison could not be completed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="shipping-calculator" className="calculator-section section-padding">
      <div className="shell">
        <div className="section-kicker"><span className="eyebrow">Shipping rate & fulfilment comparison</span><span>Live quote when configured · standard estimate otherwise</span></div>
        <div className="calculator-intro"><div><span className="eyebrow">Use your own shipment profile</span><h2>Compare shipping from your warehouse vs Logistra fulfilment.</h2><p>Compare courier availability, returned delivery estimates, and fulfilment costs for the same shipment from two dispatch locations. Logistra is not assumed to be faster or cheaper.</p></div><p className="calculator-disclaimer">With verified credentials, both scenarios use the same Shiprocket serviceability account: your entered pickup PIN for the current warehouse and the configured Logistra origin PIN for Logistra. If live credentials are unavailable, the calculator uses a temporary standard estimate for testing.</p></div>
        <form className="calculator-form" onSubmit={submit} noValidate>
          <fieldset><legend>Shipment details</legend><div className="calculator-fields calculator-fields-three">
            <label>Current warehouse PIN code<input value={values.currentPincode} onChange={(event) => update("currentPincode", event.target.value)} inputMode="numeric" autoComplete="postal-code" maxLength={6} placeholder="e.g. 400001" aria-invalid={Boolean(fieldError(values, "currentPincode"))} required /><small>Your actual dispatch origin</small></label>
            <label>Customer delivery PIN code<input value={values.deliveryPincode} onChange={(event) => update("deliveryPincode", event.target.value)} inputMode="numeric" autoComplete="postal-code" maxLength={6} placeholder="e.g. 800001" aria-invalid={Boolean(fieldError(values, "deliveryPincode"))} required /><small>The same destination is used for both scenarios</small></label>
            <label>Weight (kg)<input value={values.weightKg} onChange={(event) => update("weightKg", event.target.value)} type="number" min="0.01" step="0.01" placeholder="0.5" aria-invalid={Boolean(fieldError(values, "weightKg"))} required /></label>
            <label>Length (cm)<input value={values.lengthCm} onChange={(event) => update("lengthCm", event.target.value)} type="number" min="1" step="0.1" placeholder="Optional" /></label>
            <label>Breadth (cm)<input value={values.breadthCm} onChange={(event) => update("breadthCm", event.target.value)} type="number" min="1" step="0.1" placeholder="Optional" /></label>
            <label>Height (cm)<input value={values.heightCm} onChange={(event) => update("heightCm", event.target.value)} type="number" min="1" step="0.1" placeholder="Optional" /></label>
            <label>Payment mode<select value={values.paymentMode} onChange={(event) => update("paymentMode", event.target.value as FormValues["paymentMode"])}><option value="prepaid">Prepaid</option><option value="cod">Cash on delivery</option></select></label>
            <label>Declared value (₹)<input value={values.declaredValue} onChange={(event) => update("declaredValue", event.target.value)} type="number" min="0" step="1" placeholder="Optional" /><small>Used where the provider needs it</small></label>
            <label>Monthly eligible orders<input value={values.monthlyOrderVolume} onChange={(event) => update("monthlyOrderVolume", event.target.value)} type="number" min="1" step="1" placeholder="Optional" /><small>Needed to allocate monthly costs</small></label>
          </div></fieldset>
          <details className="calculator-advanced"><summary>Optional current-warehouse operating costs</summary><p>Leave these blank if you only want a shipping-only comparison. Enter known figures as amounts per order unless marked monthly; no default rates are assumed.</p><div className="calculator-fields calculator-fields-three">
            <label>Pick-and-pack / order<input value={values.currentPickAndPack} onChange={(event) => update("currentPickAndPack", event.target.value)} type="number" min="0" step="0.01" placeholder="Optional" /></label>
            <label>Packaging / order<input value={values.currentPackaging} onChange={(event) => update("currentPackaging", event.target.value)} type="number" min="0" step="0.01" placeholder="Optional" /></label>
            <label>Storage allocation / order<input value={values.currentStorage} onChange={(event) => update("currentStorage", event.target.value)} type="number" min="0" step="0.01" placeholder="Optional" /></label>
            <label>Returns / RTO allocation / order<input value={values.currentReturns} onChange={(event) => update("currentReturns", event.target.value)} type="number" min="0" step="0.01" placeholder="Optional" /></label>
            <label>Other cost / order<input value={values.currentOther} onChange={(event) => update("currentOther", event.target.value)} type="number" min="0" step="0.01" placeholder="Optional" /></label>
            <label>Fixed costs / month<input value={values.currentFixedMonthly} onChange={(event) => update("currentFixedMonthly", event.target.value)} type="number" min="0" step="0.01" placeholder="Optional" /></label>
            <label>Inventory transfer / month<input value={values.currentTransferMonthly} onChange={(event) => update("currentTransferMonthly", event.target.value)} type="number" min="0" step="0.01" placeholder="Optional" /></label>
            <label>GST treatment<select value={values.currentGstTreatment} onChange={(event) => update("currentGstTreatment", event.target.value as FormValues["currentGstTreatment"])}><option value="">Not specified</option><option value="inclusive">Amounts include GST</option><option value="exclusive">Amounts exclude GST</option><option value="unknown">Unknown</option></select></label>
          </div></details>
          <div className="calculator-submit"><button className="button button-dark" type="submit" disabled={isLoading}>{isLoading ? "Requesting rates…" : "Compare both scenarios"} {!isLoading && <ArrowRight size={16} />}</button><p>Logistra’s origin and any approved Logistra fees are resolved on the server. They are not accepted from this form.</p></div>
          {error && <p className="calculator-error" role="alert">{error}</p>}
        </form>
        {result && <div className="calculator-results"><div className="calculator-results-heading"><span className="eyebrow">Results</span><p>Review the quote source and missing cost inputs before treating any figure as a business case.</p></div><div className="calculator-scenarios"><ScenarioCard scenario={result.currentWarehouse} /><ScenarioCard scenario={result.logistraFulfilment} /></div><ComparisonSummary response={result} /></div>}
      </div>
    </section>
  );
}
