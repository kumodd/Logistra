import Link from "next/link";
import config from "@/config.json";
import { ArrowRight, ArrowUpRight, CheckIcon } from "@/components/icons";
import WorkflowStrip from "@/components/workflow-strip";
import CtaBand from "@/components/cta-band";
import { SectionHeading } from "@/components/page-intro";

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
          <SectionHeading eyebrow={config.home.comparison.eyebrow} title={config.home.comparison.title} body={config.home.comparison.body} />
          <div className="d2c-comparison-grid">
            <article className="d2c-comparison-card without"><span className="comparison-label">01</span><h3>{config.home.comparison.withoutTitle}</h3><ul>{config.home.comparison.without.map((item) => <li key={item}><span className="comparison-mark">—</span>{item}</li>)}</ul></article>
            <article className="d2c-comparison-card with"><span className="comparison-label">02</span><h3>{config.home.comparison.withTitle}</h3><ul>{config.home.comparison.with.map((item) => <li key={item}><CheckIcon size={15} />{item}</li>)}</ul></article>
          </div>
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
