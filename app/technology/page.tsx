import Link from "next/link";
import config from "@/config.json";
import { ArrowUpRight } from "@/components/icons";
import { PageIntro, SectionHeading } from "@/components/page-intro";
import CtaBand from "@/components/cta-band";

export default function TechnologyPage() {
  const copy = config.pages.technology;

  return (
    <>
      <section className="inner-hero"><div className="shell inner-hero-grid"><PageIntro eyebrow={copy.eyebrow} title={copy.title} body={copy.body} /><div className="page-stamp page-stamp-orange"><span>PLATFORM</span><strong>01</strong><small>PHYSICAL +<br />DIGITAL</small></div></div></section>
      <section className="platform-section section-padding"><div className="shell platform-grid"><div className="platform-copy"><span className="eyebrow">{copy.platformEyebrow}</span><h2>{copy.platformTitle}</h2><p>{copy.platformBody}</p><Link className="text-link" href="/contact">{copy.platformLink} <ArrowUpRight size={16} /></Link></div><div className="platform-board"><div className="board-label">LOGISTRA / OPERATIONS OS <span>CONNECTED</span></div><div className="board-grid">{["ORDERS", "INVENTORY", "PICKING", "SHIPPING", "RETURNS", "RTO"].map((item, index) => <div key={item} className={index === 1 ? "board-cell selected" : "board-cell"}><span>0{index + 1}</span><strong>{item}</strong><i /></div>)}</div><div className="board-foot"><span>↑ FROM THE FLOOR</span><strong>VISIBILITY THAT LEADS TO ACTION</strong></div></div></div></section>
      <section className="integration-section section-padding section-rule-top"><div className="shell"><SectionHeading eyebrow={copy.integrationEyebrow} title={copy.integrationTitle} body={copy.integrationBody} /><div className="integration-wrap"><div className="integration-list"><span className="integration-label">Available now</span><div>{config.integrations.available.map((item) => <span className="integration-chip" key={item}><i />{item}</span>)}</div></div><div className="integration-list planned"><span className="integration-label">Planned</span><div>{config.integrations.planned.map((item) => <span className="integration-chip" key={item}><i />{item}</span>)}</div></div></div></div></section>
      <section className="future-section section-padding"><div className="shell future-grid"><div><span className="eyebrow">{copy.futureEyebrow}</span><h2>{copy.futureTitle}</h2></div><div><p>{copy.futureBody}</p><div className="future-tags"><span>Demand forecasting</span><span>RTO prediction</span><span>Warehouse slotting</span><span>Courier recommendations</span></div></div></div></section>
      <CtaBand compact />
    </>
  );
}
