import type { MetadataRoute } from "next";
import config from "@/config.json";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Logistra — Faster delivery for growing D2C brands",
    short_name: "Logistra",
    description: config.brand.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4f2ec",
    theme_color: "#20221f",
    lang: "en-IN",
    icons: [
      { src: "/icon", sizes: "any", type: "image/png", purpose: "any" },
    ],
  };
}
