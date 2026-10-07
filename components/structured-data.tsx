import config from "@/config.json";

export default function StructuredData() {
  const organizationId = `${config.brand.url}/#organization`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: config.brand.name,
        url: config.brand.url,
        logo: `${config.brand.url}/apple-icon`,
        description: config.brand.description,
        email: config.brand.email,
        telephone: `+91 ${config.brand.phone}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Patna",
          addressRegion: "Bihar",
          addressCountry: "IN",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "sales",
          telephone: `+91 ${config.brand.phone}`,
          email: config.brand.email,
          areaServed: "IN",
          availableLanguage: ["en", "hi"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${config.brand.url}/#website`,
        url: config.brand.url,
        name: config.brand.name,
        description: config.brand.description,
        publisher: { "@id": organizationId },
        inLanguage: "en-IN",
      },
      {
        "@type": "Service",
        "@id": `${config.brand.url}/#fulfilment-service`,
        name: "E-commerce fulfilment for growing D2C brands",
        serviceType: "E-commerce fulfilment",
        provider: { "@id": organizationId },
        areaServed: { "@type": "Country", name: "India" },
        description: "Storage, pick and pack, dispatch, returns, RTO and operational visibility for growing brands.",
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />;
}
