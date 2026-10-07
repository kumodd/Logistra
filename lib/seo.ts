import type { Metadata } from "next";
import config from "@/config.json";

export const siteUrl = config.brand.url;
export const siteName = config.brand.name;
export const defaultDescription = "Logistra helps growing D2C brands position best-selling inventory closer to demand for faster delivery, better customer experience, and approximately similar delivery cost.";
export const defaultKeywords = [
  "D2C fulfilment",
  "e-commerce fulfilment India",
  "faster delivery for D2C brands",
  "fulfilment centre Bihar",
  "inventory closer to customers",
  "pick and pack fulfilment",
  "returns and RTO fulfilment",
];

type PageSeo = {
  title: string;
  description: string;
  path: string;
};

export function createPageMetadata({ title, description, path }: PageSeo): Metadata {
  const url = new URL(path, siteUrl).toString();
  const image = new URL("/opengraph-image", siteUrl).toString();

  return {
    title,
    description,
    keywords: defaultKeywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      siteName,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: `${siteName} — ${title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
