import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "38px", background: "#20221f", color: "#ed4b28", fontFamily: "Arial", fontSize: 122, fontWeight: 800 }}>
      L
    </div>,
    { ...size },
  );
}
