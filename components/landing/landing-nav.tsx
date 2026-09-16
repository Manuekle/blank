"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/icons/logo";
import { LandingNavAuth } from "@/components/landing/landing-nav-auth";
import { Button } from "@/components/ui/button";

const LINKS = [
  { id: "catalog", label: "Catalog", href: "/landing#catalog" },
  { id: "templates", label: "Templates", href: "/templates" },
] as const;

type LandingNavProps = {
  /** The section or page the current view belongs to. */
  current?: (typeof LINKS)[number]["id"];
};

export function LandingNav({ current }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <a className="lb-skip" href="#main">
        Skip to content
      </a>
      <div ref={sentinelRef} id="top" className="lb-nav-sentinel" aria-hidden="true" />
      <header className="lb-nav" data-scrolled={scrolled || undefined}>
        <nav className="lb-nav-bar" aria-label="Main">
          <div className="lb-nav-inner">
            <Link href="/landing" className="lb-nav-word" aria-label="Blank home">
              <Logo size={18} />
              blank
            </Link>

            <div className="lb-nav-right">
              <div className="lb-nav-links">
                {LINKS.map((link) => (
                  <Link
                    key={link.id}
                    href={link.href}
                    className="lb-nav-link"
                    aria-current={current === link.id ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <LandingNavAuth />
              <Link href="/">
                <Button size="sm" variant="primary">
                  Start creating
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
