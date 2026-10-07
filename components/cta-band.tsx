import Link from "next/link";
import config from "@/config.json";
import { ArrowUpRight } from "./icons";

export default function CtaBand({ compact = false, home = false }: { compact?: boolean; home?: boolean }) {
  const copy = home ? config.home.finalCta : {
    eyebrow: "Ready when you are",
    title: "Make fulfilment",
    emphasis: "feel lighter.",
    body: "Tell us what you are building, where fulfilment gets difficult, and where you want to go next.",
    button: "Get my fulfilment assessment",
  };

  return (
    <section className={`cta-band ${compact ? "cta-band-compact" : ""}`}>
      <div className="shell cta-inner">
        <span className="eyebrow eyebrow-light">{copy.eyebrow}</span>
        <h2>{copy.title.includes("\n") ? copy.title.split("\n").map((line) => <span key={line}>{line}<br /></span>) : <>{copy.title}<br /></>}<em>{copy.emphasis}</em></h2>
        <div className="cta-copy">
          <p>{copy.body}</p>
          <Link className="button button-light" href="/contact">{copy.button} <ArrowUpRight size={16} /></Link>
        </div>
      </div>
      <div className="cta-grid-lines" aria-hidden="true" />
    </section>
  );
}
