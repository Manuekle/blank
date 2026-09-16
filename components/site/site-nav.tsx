"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FocusEvent, type PointerEvent } from "react";
import { Logo } from "@/components/icons/logo";
import { SFSymbol } from "@/components/icons/sf-symbol";

const LINKS = [
  { id: "playground", label: "Playground", href: "/#playground" },
  { id: "templates", label: "Templates", href: "/templates" },
  { id: "share", label: "Share", href: "/#share" },
] as const;

type SiteNavProps = {
  /** The section the current page belongs to. */
  current?: (typeof LINKS)[number]["id"];
};

export function SiteNav({ current }: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  // The bar turns into a floating glass panel once the page leaves the top.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Same measured pill as the editor's segmented tabs, following hover and focus.
  const showPill = (event: PointerEvent<HTMLAnchorElement> | FocusEvent<HTMLAnchorElement>) => {
    const pill = pillRef.current;
    if (!pill) return;
    const link = event.currentTarget;
    const visible = pill.dataset.visible === "true";
    if (!visible) pill.style.transition = "opacity 150ms ease-out";
    pill.style.transform = `translateX(${link.offsetLeft}px)`;
    pill.style.width = `${link.offsetWidth}px`;
    if (!visible) {
      void pill.offsetWidth;
      pill.style.transition = "";
    }
    pill.dataset.visible = "true";
  };

  const hidePill = () => {
    if (pillRef.current) pillRef.current.dataset.visible = "false";
  };

  return (
    <>
      <a className="site-skip" href="#main">
        Skip to content
      </a>
      <div ref={sentinelRef} id="top" className="site-nav-sentinel" aria-hidden="true" />
      <header className="site-nav" data-scrolled={scrolled || undefined}>
        <nav className="site-nav-bar" aria-label="Main">
          <Link href="/" className="site-brand" aria-label="Blank home">
            <Logo size={20} className="site-brand-mark" />
            <span className="site-brand-word" aria-hidden="true">
              blank
            </span>
          </Link>

          <div className="site-nav-links" onPointerLeave={hidePill}>
            <span ref={pillRef} className="site-nav-pill" aria-hidden="true" />
            {LINKS.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="site-nav-link"
                aria-current={current === link.id ? "page" : undefined}
                onPointerEnter={showPill}
                onFocus={showPill}
                onBlur={hidePill}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="site-nav-actions">
            <Link href="/edit" className="site-btn site-btn--primary site-btn--sm">
              Open editor <SFSymbol name="arrow.up.right" size={11} />
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}
