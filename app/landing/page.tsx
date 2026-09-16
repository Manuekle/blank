import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SFSymbol } from "@/components/icons/sf-symbol";
import { ComponentCatalog } from "@/components/landing/catalog";
import { ComponentMarquee } from "@/components/landing/component-marquee";
import { FinalCta } from "@/components/landing/final-cta";
import { HeroEditor } from "@/components/landing/hero-editor";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";
import { Reveal } from "@/components/landing/reveal";
import { TEMPLATE_KITS } from "@/lib/templates";
import "./landing.css";

export const metadata: Metadata = {
  title: "Blank — Start blank. Make it yours.",
  description:
    "Design, code, remix and share production-ready UI components. A visual editor that writes real TSX and CSS.",
};

export default function LandingPage() {
  const primitives = [...new Set(TEMPLATE_KITS.flatMap((kit) => kit.components.map((component) => component.name)))].length;
  const components = TEMPLATE_KITS.reduce((sum, kit) => sum + kit.components.length, 0);

  return (
    <div className="lb-page">
      <LandingNav />

      <main id="main">
        {/* hero */}
        <section className="lb-hero lb-container">
          <div className="lb-hero-lead">
            <p className="lb-hero-eyebrow">
              <b>
                <i aria-hidden="true" />
                v0.4.0
              </b>
              {TEMPLATE_KITS.length} kits · {components} components · zero dependencies
            </p>

            {/*
              The second line is framed as a selected canvas object:
              this is an editor, and the headline behaves like anything
              else you can click and change.
            */}
            <h1 className="lb-hero-h1">
              <span className="lb-hero-h1-line">Start blank.</span>
              <span className="lb-hero-h1-object">
                <span className="lb-hero-h1-plate" aria-hidden="true" />
                <span className="lb-hero-h1-grad">Make it yours.</span>
                <span className="lb-hero-h1-handles" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <span className="lb-hero-h1-tag" aria-hidden="true">
                  Editable
                </span>
              </span>
            </h1>

            <p className="lb-sub">
              Design, code, remix and share components built your way. Vanilla base, real files, nothing in between.
            </p>

            <div className="lb-hero-ctas">
              <Link href="/">
                <Button size="md" variant="primary" rightIcon={<SFSymbol name="arrow.up.right" size={13} />}>
                  Start creating
                </Button>
              </Link>
              <Link href="/landing#catalog">
                <Button size="md" variant="outline" leftIcon={<SFSymbol name="square.grid.2x2" size={13} />}>
                  Explore components
                </Button>
              </Link>
            </div>
          </div>

          <HeroEditor />

          <dl className="lb-hero-specs">
            <div>
              <dt>Vanilla base</dt>
              <dd>Real TSX + CSS files</dd>
            </div>
            <div>
              <dt>{TEMPLATE_KITS.length} kits</dt>
              <dd>Ready to remix</dd>
            </div>
            <div>
              <dt>Blank AI</dt>
              <dd>Edits you can revert</dd>
            </div>
            <div>
              <dt>GitHub</dt>
              <dd>Your repo, your rules</dd>
            </div>
          </dl>
        </section>

        {/* marquee */}
        <ComponentMarquee />

        {/* catalog */}
        <section className="lb-sec lb-container" id="catalog" aria-labelledby="lb-catalog-heading">
          <Reveal className="lb-sec-head">
            <p className="lb-kicker">
              <i />
              Catalog
            </p>
            <h2 className="lb-h lb-h--lg" id="lb-catalog-heading">
              {primitives} primitives. Infinite outcomes.
            </h2>
            <p className="lb-sub">
              Every primitive ships in each kit, restyled to that era. Pick one, open it in the editor, and take the
              files with you.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <ComponentCatalog />
          </Reveal>
        </section>

        {/* final cta */}
        <FinalCta />
      </main>

      <LandingFooter />
    </div>
  );
}
