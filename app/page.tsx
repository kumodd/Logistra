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
            <h1>{config.home.hero.line1}<br />{config.home.hero.line2} <em>{config.home.hero.emphasis}</em><br />{config.home.hero.line3}</h1>
            <p>{config.home.body}</p>
            <div className="hero-actions">
              <Link className="button button-dark" href="/contact">Talk to a fulfilment expert <ArrowUpRight size={16} /></Link>
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

      <section className="workflow-section">
        <div className="shell">
          <div className="section-kicker"><span className="eyebrow">The full picture</span><span>01 / 04</span></div>
          <SectionHeading eyebrow={config.home.workflowIntro.eyebrow} title={config.home.workflowIntro.title} body={config.home.workflowIntro.body} />
          <WorkflowStrip />
        </div>
      </section>

      <section className="outcome-section section-padding">
        <div className="shell outcome-grid">
          <div className="outcome-copy">
            <span className="eyebrow">{config.home.outcome.eyebrow}</span>
            <h2>{config.home.outcome.title}<br /><em>{config.home.outcome.emphasis}</em></h2>
            <p>{config.home.outcome.body}</p>
            <Link className="text-link" href="/services">{config.home.outcome.link} <ArrowRight size={16} /></Link>
          </div>
          <div className="signal-card">
            <div className="signal-head"><span>OPERATIONAL SIGNAL</span><span>NOW</span></div>
            <div className="signal-main"><div className="signal-circle">L</div><div><strong>One source of truth</strong><span>Inventory, orders, returns</span></div></div>
            <div className="signal-bars"><i style={{ height: "42%" }} /><i style={{ height: "70%" }} /><i style={{ height: "55%" }} /><i style={{ height: "84%" }} /><i style={{ height: "64%" }} /><i style={{ height: "92%" }} /><i style={{ height: "78%" }} /><i style={{ height: "100%" }} /><i style={{ height: "90%" }} /><i style={{ height: "100%" }} /></div>
            <div className="signal-foot"><span>VISIBILITY</span><strong>↑ CLEARER</strong></div>
          </div>
        </div>
      </section>

      <section className="audience-section section-padding section-rule-top">
        <div className="shell">
          <div className="section-kicker"><span className="eyebrow">Who it is for</span><span>02 / 04</span></div>
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

      <CtaBand />
    </>
  );
}
