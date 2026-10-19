import config from "@/config.json";
import { canonicalUrl } from "@/lib/seo";

type FaqItem = { question: string; answer: string };

function JsonLd({ data }: { data: unknown }) {
  const serialized = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialized }} />;
}

export default function StructuredData() {
  const organizationId = `${canonicalUrl("/")}#organization`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: config.brand.name,
        url: canonicalUrl("/"),
        logo: canonicalUrl("/apple-icon"),
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
          areaServed: { "@type": "Place", name: "Eastern India" },
        },
      },
      {
        "@type": "WebSite",
        "@id": `${canonicalUrl("/")}#website`,
        url: canonicalUrl("/"),
        name: config.brand.name,
        description: config.brand.description,
        publisher: { "@id": organizationId },
        inLanguage: "en-IN",
      },
      {
        "@type": "Service",
        "@id": `${canonicalUrl("/")}#fulfilment-service`,
        name: "E-commerce fulfilment for growing D2C brands",
        serviceType: "E-commerce fulfilment",
        provider: { "@id": organizationId },
        areaServed: { "@type": "Place", name: "Eastern India" },
        description: "Regional e-commerce fulfilment assessment and agreed receiving, storage, pick and pack, dispatch, and returns workflows for growing brands.",
      },
    ],
  };

  return <JsonLd data={jsonLd} />;
}

export function FaqStructuredData({ items }: { items: FaqItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${canonicalUrl("/")}#faq`,
        url: canonicalUrl("/"),
        mainEntity: items.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }}
    />
  );
}
