import Link from "next/link";
import { Logo } from "@/components/icons/logo";
import { SFSymbol } from "@/components/icons/sf-symbol";
import { TEMPLATE_KITS } from "@/lib/templates";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Open the editor", href: "/" },
      { label: "Component catalog", href: "/landing#catalog" },
      { label: "Templates", href: "/templates" },
    ],
  },
  {
    title: "Eras",
    links: TEMPLATE_KITS.map((kit) => ({ label: kit.name, href: `/templates/${kit.id}` })),
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

/**
 * Blue brand footer. Product links on top, giant closing wordmark.
 */
export function LandingFooter({ note }: { note?: string }) {
  return (
    <footer className="lb-footer">
      <div className="lb-container">
        <div className="lb-footer-top">
          <div className="lb-footer-brand">
            <Link href="/landing" className="lb-nav-word" aria-label="Blank home">
              <Logo size={20} />
              blank
            </Link>
            <p>Design, code, remix and ship components. Start blank. Make it yours.</p>
            <Link href="/" className="lb-footer-cta">
              Start creating
              <SFSymbol name="arrow.up.right" size={12} aria-hidden="true" />
            </Link>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} className="lb-footer-col" aria-label={column.title}>
              <b>{column.title}</b>
              {column.links.map((link) => (
                <Link key={link.label} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="lb-footer-word">
          <Link href="/" aria-label="Blank — open the editor">
            blank<span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="lb-footer-base">
          <span>© {new Date().getFullYear()} Blank</span>
          <span>Vanilla components. Real code. No lock-in.</span>
          <span className="lb-footer-base-end">{note ?? "Built with Blank."}</span>
        </div>
      </div>
    </footer>
  );
}
