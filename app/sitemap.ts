import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: canonicalUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: canonicalUrl("/how-it-works"), changeFrequency: "monthly", priority: 0.8 },
    { url: canonicalUrl("/services"), changeFrequency: "monthly", priority: 0.8 },
    { url: canonicalUrl("/technology"), changeFrequency: "monthly", priority: 0.7 },
    { url: canonicalUrl("/about"), changeFrequency: "yearly", priority: 0.6 },
    { url: canonicalUrl("/contact"), changeFrequency: "monthly", priority: 0.8 },
  ];
}
