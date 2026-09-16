import Link from "next/link";
import { Logo } from "@/components/icons/logo";
import { SFSymbol } from "@/components/icons/sf-symbol";
import { kitGlow } from "@/components/site/kit-glow";
import { TEMPLATE_KITS } from "@/lib/templates";
import { Spotlight } from "./spotlight";

type FooterLink = { label: string; href: string; meta?: string; dot?: string };

const PRODUCT: FooterLink[] = [
  { label: "Open the editor", href: "/" },
  { label: "Playground", href: "/#playground" },
  { label: "Share & export", href: "/#share" },
  { label: "All templates", href: "/templates" },
];

const DEFAULT_NOTE = "Every kit is an original reconstruction of an era, not a copy of any product.";

export function SiteFooter({ note = DEFAULT_NOTE }: { note?: string }) {
  const eras = TEMPLATE_KITS.map((kit) => ({
    label: kit.name,
    href: `/templates/${kit.id}`,
    meta: kit.period.slice(0, 4),
    dot: kitGlow(kit)[0],
  }));
  const half = Math.ceil(eras.length / 2);
  /* Two columns so the era list does not run past the footer; each is titled by the span it covers. */
  const span = (slice: typeof eras) => `${slice[0].meta} – ${slice[slice.length - 1].meta}`;
  const early = eras.slice(0, half);
  const late = eras.slice(half);

  return (
    <footer className="site-footer">
      <div className="site-container site-footer-grid">
        <div className="site-footer-brand">
          <Link href="/" className="site-brand" aria-label="Blank home">
            <Logo size={22} className="site-brand-mark" />
            <span className="site-brand-word" aria-hidden="true">
              blank
            </span>
          </Link>
          <p>A workspace for components you design, code and ship yourself. Start blank. Make it yours.</p>
          <Link href="/edit" className="site-btn site-btn--sm">
            Open the editor <SFSymbol name="arrow.up.right" size={11} />
          </Link>
        </div>
        <FooterColumn title="Product" links={PRODUCT} />
        <FooterColumn title={span(early)} links={early} />
        <FooterColumn title={span(late)} links={late} />
      </div>

      <div className="site-container site-footer-base">
        <span>© {new Date().getFullYear()} Blank</span>
        <span>{note}</span>
        <a href="#top" className="site-footer-top">
          Back to top <SFSymbol name="arrow.down" size={11} />
        </a>
      </div>

      <Spotlight className="site-footer-mark-wrap">
        <p className="site-footer-mark" data-spotlight data-text="blank" aria-hidden="true">
          blank
        </p>
      </Spotlight>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav className="site-footer-col" aria-label={title}>
      <h2>{title}</h2>
      <ul>
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href} style={{ "--dot": link.dot } as React.CSSProperties}>
              {link.dot && <i aria-hidden="true" />}
              {link.label}
              {link.meta && <small>{link.meta}</small>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
