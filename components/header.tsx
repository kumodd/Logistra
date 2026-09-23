"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import config from "@/config.json";
import { ArrowUpRight, CloseIcon, MenuIcon } from "./icons";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="wordmark" href="/" onClick={() => setOpen(false)} aria-label="Logistra home">
          <span className="wordmark-mark">L</span>
          <span>{config.brand.name}<i>.</i></span>
        </Link>

        <nav className={`main-nav ${open ? "is-open" : ""}`} aria-label="Main navigation">
          <div className="mobile-nav-top">
            <span className="eyebrow">Navigate</span>
            <button className="icon-button" onClick={() => setOpen(false)} aria-label="Close navigation"><CloseIcon /></button>
          </div>
          {config.navigation.map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link className="button button-small button-dark mobile-cta" href="/contact" onClick={() => setOpen(false)}>
            Talk to us <ArrowUpRight size={15} />
          </Link>
        </nav>

        <Link className="button button-small button-dark header-cta" href="/contact">
          Talk to us <ArrowUpRight size={15} />
        </Link>
        <button className="menu-trigger" onClick={() => setOpen(true)} aria-label="Open navigation"><MenuIcon /></button>
      </div>
    </header>
  );
}
