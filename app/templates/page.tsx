import type { Metadata } from "next";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";
import { TemplateCatalog, type CatalogKit } from "@/components/templates/template-catalog";
import { TEMPLATE_KITS, kitCss } from "@/lib/templates";
import "../landing/landing.css";
import "./templates.css";

export const metadata: Metadata = {
  title: "Templates — Blank",
  description:
    "Copy-ready component kits, one per era of interface design: 90s bevels, Aqua gel, Web 2.0 gloss, skeuomorphic mobile, flat and Metro, bento SaaS and liquid glass.",
};

export default function TemplatesPage() {
  const kits: CatalogKit[] = TEMPLATE_KITS.map((kit) => ({
    id: kit.id,
    name: kit.name,
    period: kit.period,
    tagline: kit.tagline,
    tags: kit.tags,
    root: kit.root,
    showcase: kit.showcase,
    palette: kit.palette,
    componentCount: kit.components.length,
  }));
  const componentTotal = TEMPLATE_KITS.reduce((sum, kit) => sum + kit.components.length, 0);

  return (
    <div className="lb-page tpl-page">
      <style dangerouslySetInnerHTML={{ __html: TEMPLATE_KITS.map(kitCss).join("\n\n") }} />
      <LandingNav current="templates" />

      <main id="main">
        <section className="tpl-hero lb-container" aria-labelledby="tpl-heading">
          <p className="tpl-hero-meta">
            {TEMPLATE_KITS.length} kits · {componentTotal} components
          </p>
          <h1 id="tpl-heading" className="tpl-h1">
            <span>One kit</span>
            <span className="tpl-h1-accent">per era.</span>
          </h1>
          <p className="tpl-lede">
            Grey 90s bevels, Aqua gel, Web 2.0 gloss, linen and leather, flat tiles, bento grids, liquid glass. Every
            control rebuilt from the era&rsquo;s own rules — plain HTML and CSS, or a React component. No dependencies.
          </p>
        </section>

        <TemplateCatalog kits={kits} />
      </main>

      <LandingFooter />
    </div>
  );
}
