import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Logistra — Faster delivery for growing D2C brands";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "#f4f2ec", color: "#20221f", fontFamily: "Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22, letterSpacing: 2 }}>
        <span>LOGISTRA<span style={{ color: "#ed4b28" }}>.</span></span>
        <span style={{ color: "#ed4b28", fontSize: 16 }}>D2C FULFILMENT / INDIA</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ color: "#ed4b28", fontSize: 20, letterSpacing: 3 }}>CLOSER TO DEMAND</div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, lineHeight: 1.03, fontWeight: 700, letterSpacing: -4 }}>Deliver Faster.<br />Keep Your <span style={{ color: "#ed4b28" }}>Customers.</span></div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 18, color: "#5d6059" }}>
        <span>Inventory positioning · Storage · Pick &amp; pack · Dispatch</span>
        <span style={{ color: "#20221f" }}>logistra.in ↗</span>
      </div>
    </div>,
    { ...size },
  );
}
