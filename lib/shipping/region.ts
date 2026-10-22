export type DestinationRegion = "easternIndia" | "outsideEasternIndia" | "unknown";

/**
 * A broad postal-zone screening rule for the website's Eastern India focus.
 * It is not a carrier serviceability check and should not be treated as one.
 */
export function classifyDestinationRegion(pincode: string): DestinationRegion {
  if (!/^\d{6}$/.test(pincode)) return "unknown";
  const prefix = Number(pincode.slice(0, 2));
  return (prefix >= 70 && prefix <= 77) || (prefix >= 80 && prefix <= 85)
    ? "easternIndia"
    : "outsideEasternIndia";
}
