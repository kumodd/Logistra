import Link from "next/link";
import config from "@/config.json";
import { ArrowUpRight } from "@/components/icons";
import { PageIntro, SectionHeading } from "@/components/page-intro";
import CtaBand from "@/components/cta-band";

export default function AboutPage() {
  const copy = config.pages.about;

  return (
    <>
      <section className="inner-hero"><div className="shell inner-hero-grid"><PageIntro eyebrow={copy.eyebrow} title={copy.title} body={copy.body} /><div className="page-stamp"><span>OUR VIEW</span><strong>HUMAN</strong><small>OPERATIONS<br />FIRST</small></div></div></section>
      <section className="about-statement section-padding"><div className="shell about-statement-grid"><div className="statement-mark">“</div><div><h2>{copy.statementTitle}<br /><em>{copy.statementEmphasis}</em></h2><p>{copy.statementBody}</p></div></div></section>
      <section className="principles-section section-padding section-rule-top"><div className="shell"><SectionHeading eyebrow={copy.principlesEyebrow} title={copy.principlesTitle} body={copy.principlesBody} /><div className="principles-grid">{copy.principles.map((item) => <article className="principle-card" key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></div></section>
      <section className="origin-section section-padding"><div className="shell origin-grid"><div className="origin-map"><span className="map-label">PATNA / BIHAR</span><div className="map-ring ring-a" /><div className="map-ring ring-b" /><div className="map-dot" /><div className="map-line" /><span className="map-caption">START CLOSE.<br />THINK WIDER.</span></div><div><span className="eyebrow">{copy.originEyebrow}</span><h2>{copy.originTitle}<br /><em>{copy.originEmphasis}</em></h2><p>{copy.originBody}</p><Link className="text-link" href="/contact">{copy.originLink} <ArrowUpRight size={16} /></Link></div></div></section>
      <CtaBand />
    </>
  );
}
