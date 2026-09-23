import Link from "next/link";
import config from "@/config.json";
import { ArrowUpRight, PinIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div>
          <Link className="wordmark wordmark-light" href="/">
            <span className="wordmark-mark">L</span>
            <span>{config.brand.name}<i>.</i></span>
          </Link>
          <p className="footer-note">The operating system behind your next stage of growth.</p>
        </div>
        <div className="footer-links">
          <div>
            <span className="footer-label">Explore</span>
            {config.navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          </div>
          <div>
            <span className="footer-label">Start here</span>
            <Link href="/contact">Talk to a fulfilment expert <ArrowUpRight size={14} /></Link>
            <a href={`mailto:${config.brand.email}`}>{config.brand.email}</a>
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Logistra. All rights reserved.</span>
        <span className="location"><PinIcon size={15} /> {config.brand.location}</span>
      </div>
    </footer>
  );
}
