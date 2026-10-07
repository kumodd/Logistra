import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/how-it-works`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/services`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/technology`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about`, lastModified, changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}
