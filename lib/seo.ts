import type { Metadata } from "next";
import config from "@/config.json";

export const siteUrl = new URL(config.brand.url).origin;
export const siteName = config.brand.name;
export const defaultTitle = "Logistra — Faster delivery for growing D2C brands";
export const defaultDescription = "Regional fulfilment for D2C brands: Logistra positions best-selling inventory closer to customers in Eastern India for faster delivery and practical operations.";
export const defaultKeywords = [
  "D2C fulfilment India",
  "shared fulfilment India",
  "regional fulfilment Eastern India",
  "e-commerce fulfilment Bihar",
  "inventory storage and dispatch",
  "pick and pack fulfilment",
  "e-commerce returns management",
  "marketplace order fulfilment",
];

type PageSeo = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

function normalizePath(path: string): string {
  const rawPath = path.startsWith("http") ? new URL(path).pathname : path.split(/[?#]/, 1)[0];
  const withLeadingSlash = rawPath.trim().startsWith("/") ? rawPath.trim() : `/${rawPath.trim()}`;

  if (withLeadingSlash === "/") return "/";
  return `/${withLeadingSlash.replace(/^\/+|\/+$/g, "")}`;
}

export function canonicalUrl(path = "/"): string {
  const normalizedPath = normalizePath(path);
  return normalizedPath === "/" ? siteUrl : new URL(normalizedPath, `${siteUrl}/`).toString();
}

function socialTitle(title: string): string {
  const normalizedTitle = title.trim();
  return normalizedTitle.toLowerCase().includes(siteName.toLowerCase())
    ? normalizedTitle
    : `${normalizedTitle} | ${siteName}`;
}

export function createPageMetadata({ title, description, path, keywords = defaultKeywords }: PageSeo): Metadata {
  const url = canonicalUrl(path);
  const image = canonicalUrl("/opengraph-image");
  const pageTitle = socialTitle(title);

  return {
    title: { absolute: pageTitle },
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      siteName,
      title: pageTitle,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: pageTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [image],
    },
  };
}
