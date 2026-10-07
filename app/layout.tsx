import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import StructuredData from "@/components/structured-data";
import { defaultDescription, defaultKeywords, siteName, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Logistra — Faster delivery for growing D2C brands",
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: defaultKeywords,
  applicationName: siteName,
  authors: [{ name: "Logistra" }],
  creator: "Logistra",
  publisher: "Logistra",
  category: "E-commerce fulfilment",
  referrer: "origin-when-cross-origin",
  formatDetection: { email: true, address: false, telephone: true },
  alternates: { canonical: siteUrl },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName,
    title: "Logistra — Faster delivery for growing D2C brands",
    description: defaultDescription,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Logistra — Faster delivery for growing D2C brands" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Logistra — Faster delivery for growing D2C brands",
    description: defaultDescription,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StructuredData />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
