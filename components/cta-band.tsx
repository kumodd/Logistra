import Link from "next/link";
import { ArrowUpRight } from "./icons";

export default function CtaBand({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`cta-band ${compact ? "cta-band-compact" : ""}`}>
      <div className="shell cta-inner">
        <span className="eyebrow eyebrow-light">Ready when you are</span>
        <h2>Make fulfilment<br /><em>feel lighter.</em></h2>
        <div className="cta-copy">
          <p>Tell us what you are building, where fulfilment gets difficult, and where you want to go next.</p>
          <Link className="button button-light" href="/contact">Get my fulfilment assessment <ArrowUpRight size={16} /></Link>
        </div>
      </div>
      <div className="cta-grid-lines" aria-hidden="true" />
    </section>
  );
}
