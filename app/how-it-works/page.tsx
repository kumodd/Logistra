import Link from "next/link";
import type { Metadata } from "next";
import config from "@/config.json";
import { ArrowRight, ArrowUpRight, CheckIcon } from "@/components/icons";
import { PageIntro, SectionHeading } from "@/components/page-intro";
import WorkflowStrip from "@/components/workflow-strip";
import CtaBand from "@/components/cta-band";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "How E-commerce Fulfilment Works",
  description: config.pages.howItWorks.body,
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  const copy = config.pages.howItWorks;

  return (
    <>
      <section className="inner-hero"><div className="shell inner-hero-grid"><PageIntro eyebrow={copy.eyebrow} title={copy.title} body={copy.body} /><div className="page-stamp"><span>WORKFLOW</span><strong>01—06</strong><small>REPEATABLE<br />BY DESIGN</small></div></div></section>
      <section className="workflow-overview"><div className="shell"><WorkflowStrip /></div></section>
      <section className="process-detail section-padding"><div className="shell"><div className="section-kicker"><span className="eyebrow">The Logistra method</span><span>01 / 06</span></div><div className="process-list">{config.workflow.map((step, index) => <article className="process-row" key={step.number}><div className="process-number">{step.number}</div><div className="process-title"><span className="eyebrow">Step {step.number}</span><h2>{step.title}</h2><h3>{step.short}</h3></div><div className="process-body"><p>{step.body}</p><div className="detail-tags">{step.details.map((detail) => <span key={detail}><CheckIcon size={13} /> {detail}</span>)}</div></div></article>)}</div></div></section>
      <section className="return-callout section-padding"><div className="shell return-grid"><div><span className="eyebrow">{copy.returnEyebrow}</span><h2>{copy.returnTitle}</h2><p>{copy.returnBody}</p><Link className="button button-dark" href="/contact">Talk through your operation <ArrowUpRight size={15} /></Link></div><div className="return-flow"><div className="return-node active">RETURN<br /><small>ARRIVES</small></div><div className="return-connector" /><div className="return-node">INSPECT<br /><small>CLASSIFY</small></div><div className="return-branches"><span>RESTOCK</span><span>REPACK</span><span>QUARANTINE</span></div><div className="return-final">INVENTORY UPDATED <ArrowRight size={15} /></div></div></div></section>
      <CtaBand compact />
    </>
  );
}
