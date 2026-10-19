import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import StructuredData from "@/components/structured-data";
import { canonicalUrl, defaultDescription, defaultKeywords, defaultTitle, siteName, siteUrl } from "@/lib/seo";
import { DM_Mono, Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-manrope",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
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
  alternates: { canonical: canonicalUrl("/") },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: canonicalUrl("/icon"), type: "image/png" }],
    apple: [{ url: canonicalUrl("/apple-icon"), type: "image/png", sizes: "180x180" }],
  },
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
    url: canonicalUrl("/"),
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [{ url: canonicalUrl("/opengraph-image"), width: 1200, height: 630, alt: defaultTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [canonicalUrl("/opengraph-image")],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${dmMono.variable}`}>
      <body>
        <StructuredData />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
