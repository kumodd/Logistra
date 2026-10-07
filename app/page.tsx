import Link from "next/link";
import type { Metadata } from "next";
import config from "@/config.json";
import { ArrowRight, ArrowUpRight, CheckIcon } from "@/components/icons";
import WorkflowStrip from "@/components/workflow-strip";
import CtaBand from "@/components/cta-band";
import { SectionHeading } from "@/components/page-intro";
import DistanceMap from "@/components/distance-map";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Deliver Faster. Keep Your Customers.",
  description: config.home.body,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">{config.home.eyebrow}</span>
            <h1>{config.home.hero.line1}<br />{config.home.hero.line2} <em>{config.home.hero.emphasis}</em></h1>
            <p>{config.home.body}</p>
            <div className="hero-actions">
              <Link className="button button-dark" href="/contact">Partner with Logistra <ArrowUpRight size={16} /></Link>
              <Link className="text-link" href="/how-it-works">See how it works <ArrowRight size={16} /></Link>
            </div>
            <p className="audience-note">{config.home.audience}</p>
          </div>
          <div className="hero-visual" aria-label="Logistra fulfilment workflow illustration">
            <div className="hero-visual-top"><span>OPERATION / 01</span><span>IN MOTION</span></div>
            <div className="warehouse-card">
              <div className="warehouse-card-head"><span>LOGISTRA / FLOW</span><span className="live-dot">LIVE</span></div>
              <div className="route-line route-one"><span>01</span><b>INBOUND</b><i>RECEIVING</i></div>
              <div className="route-line route-two"><span>02</span><b>INVENTORY</b><i>STORED</i></div>
              <div className="route-line route-three"><span>03</span><b>OUTBOUND</b><i>DISPATCH</i></div>
              <div className="warehouse-rack rack-one"><span>SKU</span><b>A-01</b></div>
              <div className="warehouse-rack rack-two"><span>SKU</span><b>B-14</b></div>
              <div className="warehouse-rack rack-three"><span>SKU</span><b>C-08</b></div>
              <div className="warehouse-floor"><span>YOUR INVENTORY</span><strong>↘</strong></div>
            </div>
            <div className="hero-visual-foot"><span>RECEIVE → STORE → SHIP</span><span>01—06</span></div>
          </div>
        </div>
      </section>

      <section className="d2c-problem section-padding">
        <div className="shell">
          <div className="section-kicker"><span className="eyebrow">{config.home.problem.eyebrow}</span><span>01 / 05</span></div>
          <div className="d2c-problem-intro">
            <div className="section-heading"><span className="eyebrow">{config.home.problem.operatorEyebrow}</span><h2>{config.home.problem.title}</h2><p>{config.home.problem.body}</p></div>
            <blockquote>{config.home.problem.quote}</blockquote>
          </div>
          <div className="d2c-pain-grid">
            {config.home.problem.points.map((point) => <article className="d2c-pain-card" key={point.number}><span>{point.number}</span><h3>{point.title}</h3><p>{point.body}</p></article>)}
          </div>
          <p className="d2c-problem-close">{config.home.problem.close}</p>
        </div>
      </section>

      <section className="d2c-solution section-padding">
        <div className="shell">
          <div className="section-kicker"><span className="eyebrow">{config.home.solution.eyebrow}</span><span>02 / 05</span></div>
          <div className="d2c-solution-intro"><SectionHeading eyebrow={config.home.solution.eyebrow} title={config.home.solution.title} body={config.home.solution.body} /><p className="d2c-solution-note">{config.home.solution.note}</p></div>
          <div className="d2c-solution-flow">
            {config.home.solution.steps.map((step, index) => <div className="d2c-solution-step" key={step.number}><div className="d2c-step-top"><span>{step.number}</span>{index < config.home.solution.steps.length - 1 && <ArrowRight size={16} />}</div><h3>{step.title}</h3><p>{step.body}</p></div>)}
          </div>
          <div className="d2c-solution-highlight"><span className="eyebrow eyebrow-light">{config.home.solution.highlightEyebrow}</span><strong>{config.home.solution.highlight}</strong></div>
        </div>
      </section>

      <section className="workflow-section">
        <div className="shell">
          <div className="section-kicker"><span className="eyebrow">The full picture</span><span>03 / 05</span></div>
          <SectionHeading eyebrow={config.home.workflowIntro.eyebrow} title={config.home.workflowIntro.title} body={config.home.workflowIntro.body} />
          <WorkflowStrip />
        </div>
      </section>

      <section className="d2c-comparison section-padding">
        <div className="shell">
          <div className="section-kicker"><span className="eyebrow">{config.home.comparison.eyebrow}</span><span>04 / 05</span></div>
          <div className="d2c-comparison-heading"><SectionHeading eyebrow={config.home.comparison.eyebrow} title={config.home.comparison.title} body={config.home.comparison.subtitle} /><span className="illustrative-badge">{config.home.comparison.badge}</span></div>
          <p className="d2c-comparison-context">{config.home.comparison.body}</p>
          <div className="d2c-comparison-grid">
            <article className="d2c-comparison-card before-panel">
              <div className="comparison-panel-head"><span>BEFORE LOGISTRA</span><small>LONG-DISTANCE FULFILMENT</small></div>
              <DistanceMap scenario="before" inventoryLabels={config.home.comparison.beforeInventory} demandLabels={config.home.comparison.beforeDemand} />
              <div className="comparison-metrics">{config.home.comparison.beforeMetrics.map((metric) => <div className="comparison-metric" key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}</div>
              <div className="comparison-panel-copy"><p>{config.home.comparison.beforeDescription}</p><strong>{config.home.comparison.beforeFootnote}</strong></div>
              <ul className="compare-points">{config.home.comparison.without.map((item) => <li key={item}><span className="comparison-mark">—</span>{item}</li>)}</ul>
            </article>
            <article className="d2c-comparison-card with-panel">
              <div className="comparison-panel-head"><span>WITH LOGISTRA</span><small>CLOSER TO DEMAND</small></div>
              <DistanceMap scenario="with" inventoryLabels={config.home.comparison.withInventory} demandLabels={config.home.comparison.withDemand} />
              <div className="comparison-metrics">{config.home.comparison.withMetrics.map((metric) => <div className="comparison-metric" key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}</div>
              <div className="comparison-panel-copy"><p>{config.home.comparison.withDescription}</p><strong>{config.home.comparison.withFootnote}</strong></div>
              <ul className="compare-points">{config.home.comparison.with.map((item) => <li key={item}><CheckIcon size={15} />{item}</li>)}</ul>
            </article>
          </div>
          <div className="transformation-bridge"><span className="eyebrow">The shift</span><strong>Move inventory closer to demand.</strong><p>Faster delivery. Without a major increase in delivery cost.</p></div>
          <div className="theoretical-impact"><div className="impact-heading"><span className="eyebrow">{config.home.comparison.impactEyebrow}</span><p>{config.home.comparison.impactCaption}</p></div><div className="impact-grid">{config.home.comparison.impact.map((item) => <article className="impact-card" key={item.label}><strong>{item.before}</strong><span className="impact-arrow">↓</span><strong className="impact-after">{item.after}</strong><small>{item.label}</small></article>)}</div></div>
          <div className="comparison-benefits">{config.home.comparison.benefits.map((benefit) => <article className="comparison-benefit" key={benefit.number}><span>{benefit.number}</span><div><h3>{benefit.title}</h3><p>{benefit.body}</p></div><CheckIcon size={16} /></article>)}</div>
          <div className="comparison-closing"><span className="eyebrow eyebrow-light">A better delivery story</span><h2>{config.home.comparison.closingTitle}<br /><em>{config.home.comparison.closingEmphasis}</em></h2><p>{config.home.comparison.closingBody}</p><Link className="button button-light" href="/contact">{config.home.comparison.closingButton} <ArrowUpRight size={16} /></Link></div>
        </div>
      </section>

      <section className="audience-section section-padding section-rule-top">
        <div className="shell">
          <div className="section-kicker"><span className="eyebrow">Who it is for</span><span>05 / 05</span></div>
          <SectionHeading eyebrow={config.home.audienceIntro.eyebrow} title={config.home.audienceIntro.title} body={config.home.audienceIntro.body} />
          <div className="audience-grid">
            {config.home.audiences.map((item) => <article className="audience-card" key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.body}</p><Link href="/contact" aria-label={`Learn more about ${item.title}`}><ArrowUpRight size={17} /></Link></article>)}
          </div>
        </div>
      </section>

      <section className="proof-section section-padding">
        <div className="shell proof-grid">
          <div className="proof-title"><span className="eyebrow">{config.home.proofIntro.eyebrow}</span><h2>{config.home.proofIntro.title}<br /><em>{config.home.proofIntro.emphasis}</em></h2></div>
          <div className="proof-list">{config.why.map((item, index) => <div className="proof-item" key={item.title}><span>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.body}</p></div><CheckIcon size={17} /></div>)}</div>
        </div>
      </section>

      <CtaBand home />
    </>
  );
}
