import config from "@/config.json";
import type { Metadata } from "next";
import { PinIcon } from "@/components/icons";
import { PageIntro } from "@/components/page-intro";
import ContactForm from "@/components/contact-form";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Partner with Logistra",
  description: config.contact.body,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <section className="contact-hero"><div className="shell"><PageIntro eyebrow={config.contact.eyebrow} title={config.contact.title} body={config.contact.body} /></div></section>
      <section className="contact-section section-padding"><div className="shell contact-grid"><div className="contact-aside"><span className="eyebrow">A useful first step</span><h2>Come with the messy version.</h2><p>You do not need to have all the answers. The more honestly you describe the current operation, the more useful our first conversation can be.</p><div className="contact-details"><div><span className="detail-icon">@</span><div><span className="footer-label">Email</span><a href={`mailto:${config.brand.email}`}>{config.brand.email}</a></div></div><div><span className="detail-icon">↗</span><div><span className="footer-label">Direct call</span><a href={`tel:+91${config.brand.phone}`}>{config.brand.phone}</a></div></div><div><span className="detail-icon"><PinIcon size={17} /></span><div><span className="footer-label">Find us</span><span>{config.brand.location}</span></div></div></div></div><div className="form-wrap"><ContactForm /></div></div></section>
    </>
  );
}
