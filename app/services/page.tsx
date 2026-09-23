import Link from "next/link";
import config from "@/config.json";
import { ArrowUpRight, CheckIcon } from "@/components/icons";
import { PageIntro, SectionHeading } from "@/components/page-intro";
import CtaBand from "@/components/cta-band";

export default function ServicesPage() {
  const copy = config.pages.services;

  return (
    <>
      <section className="inner-hero"><div className="shell inner-hero-grid"><PageIntro eyebrow={copy.eyebrow} title={copy.title} body={copy.body} /><div className="page-stamp page-stamp-orange"><span>SERVICE MAP</span><strong>07</strong><small>CONNECTED<br />CAPABILITIES</small></div></div></section>
      <section className="service-list-section section-padding"><div className="shell"><div className="service-intro"><SectionHeading eyebrow={copy.introEyebrow} title={copy.introTitle} body={copy.introBody} /><Link className="text-link" href="/contact">{copy.introLink} <ArrowUpRight size={16} /></Link></div><div className="service-grid">{config.services.map((service) => <article className="service-card" key={service.number}><span className="service-number">{service.number}</span><div className="service-icon"><span /></div><h3>{service.name}</h3><p>{service.description}</p><Link href="/contact" aria-label={`Discuss ${service.name}`}><ArrowUpRight size={17} /></Link></article>)}</div></div></section>
      <section className="service-value section-padding section-rule-top"><div className="shell service-value-grid"><div><span className="eyebrow">{copy.valueEyebrow}</span><h2>{copy.valueTitle}<br /><em>{copy.valueEmphasis}</em></h2></div><div className="value-points">{copy.valuePoints.map((point) => <div key={point.title}><CheckIcon size={17} /><span><strong>{point.title}</strong> {point.body}</span></div>)}</div></div></section>
      <CtaBand />
    </>
  );
}
