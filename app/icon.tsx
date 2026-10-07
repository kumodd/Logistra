import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "16px", background: "#20221f", color: "#ed4b28", fontFamily: "Arial", fontSize: 42, fontWeight: 800 }}>
      L
    </div>,
    { ...size },
  );
}
