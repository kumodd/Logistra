export type PaymentMode = "prepaid" | "cod";
export type GstTreatment = "inclusive" | "exclusive" | "unknown";
export type CostSource = "shiprocket" | "standard-estimate" | "user-input" | "approved-logistra-pricing" | "unavailable";

export type ShipmentInput = {
  weightKg: number;
  lengthCm?: number;
  breadthCm?: number;
  heightCm?: number;
  paymentMode: PaymentMode;
  declaredValue?: number;
  mode?: "Surface" | "Air";
};

export type OperationalCostInput = {
  pickAndPackPerOrder?: number;
  packagingPerOrder?: number;
  storagePerOrder?: number;
  receivingPerOrder?: number;
  putawayPerOrder?: number;
  returnsPerOrder?: number;
  otherPerOrder?: number;
  fixedMonthly?: number;
  inventoryTransferMonthly?: number;
  gstTreatment?: GstTreatment;
};

export type ComparisonRequest = {
  currentWarehouse: {
    pickupPincode: string;
    costs?: OperationalCostInput;
  };
  deliveryPincode: string;
  shipment: ShipmentInput;
  monthlyOrderVolume?: number;
};

export type ShippingRateRequest = {
  pickupPincode: string;
  deliveryPincode: string;
  shipment: ShipmentInput;
};

export type NormalizedCourierRate = {
  courierCompanyId: number | null;
  courierName: string;
  freightCharge: number | null;
  codCharges: number | null;
  additionalCharges: number | null;
  totalCharge: number | null;
  estimatedDeliveryDays: number | null;
  etd: string | null;
  pickupDate: string | null;
  cutoffTime: string | null;
  pickupDelayFrom: string | null;
  pickupDelayTo: string | null;
  suppressDate: string | null;
  suppressText: string | null;
  estimatedPickupDate: string | null;
  rating: number | null;
  codAvailable: boolean | null;
  chargeWeightKg: number | null;
  rtoCharges: number | null;
};

export type CostLine = {
  key: string;
  label: string;
  amount: number | null;
  unit: "per_order" | "per_month" | "per_return" | "unknown";
  source: CostSource;
  includedInTotal: boolean;
  note?: string;
};

export type ScenarioCosts = {
  shippingOnlyPerOrder: number | null;
  totalPerOrder: number | null;
  monthlyTotal: number | null;
  gstTreatment: GstTreatment;
  totalStatus: "complete" | "incomplete" | "unavailable";
  lines: CostLine[];
  missingCosts: string[];
  assumptions: string[];
};

export type ScenarioResult = {
  id: "currentWarehouse" | "logistraFulfilment";
  label: "Current Warehouse" | "Logistra Fulfilment";
  status: "available" | "unavailable";
  serviceability: "available" | "unavailable" | "not-configured" | "error";
  originPincode: string | null;
  destinationPincode: string;
  rateSource: string | null;
  quoteTimestamp: string | null;
  cachedQuote: boolean;
  couriers: NormalizedCourierRate[];
  bestCourier: NormalizedCourierRate | null;
  costs: ScenarioCosts;
  message: string | null;
  notes: string[];
};

export type ComparisonSummary = {
  status: "complete" | "partial" | "unavailable";
  shippingDifferencePerOrder: number | null;
  totalDifferencePerOrder: number | null;
  monthlyDifference: number | null;
  estimatedDaysDifference: number | null;
  deliverySpeedPercentage: number | null;
  destinationRegion: "easternIndia" | "outsideEasternIndia" | "unknown";
  winner: "currentWarehouse" | "logistraFulfilment" | "tie" | null;
  winnerBasis: "delivery" | "cost" | null;
  message: string;
};

export type ComparisonResponse = {
  quoteTimestamp: string;
  destinationPincode: string;
  shipment: ShipmentInput;
  monthlyOrderVolume: number | null;
  currentWarehouse: ScenarioResult;
  logistraFulfilment: ScenarioResult;
  comparison: ComparisonSummary;
};

export type ShippingRateResponse = {
  quoteTimestamp: string;
  request: ShippingRateRequest;
  scenario: ScenarioResult;
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string>;
    retryable?: boolean;
  };
};

export type ApprovedLogistraPricing = {
  version: string;
  effectiveDate: string;
  currency: "INR";
  gstTreatment: Exclude<GstTreatment, "unknown">;
  approvalStatus: "approved";
  publicDisplay: true;
  fees: {
    pickAndPackPerOrder?: number;
    packagingPerOrder?: number;
    storagePerOrder?: number;
    receivingPerOrder?: number;
    putawayPerOrder?: number;
    returnsPerOrder?: number;
    otherPerOrder?: number;
    fixedMonthly?: number;
    inventoryTransferMonthly?: number;
  };
};

export type ProviderLookupResult = {
  payload: unknown;
  quoteTimestamp: string;
  cached: boolean;
};
