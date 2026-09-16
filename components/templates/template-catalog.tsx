import Link from "next/link";
import { SFSymbol } from "@/components/icons/sf-symbol";
import { kitGlow } from "@/components/site/kit-glow";

export type CatalogKit = {
  id: string;
  name: string;
  period: string;
  tagline: string;
  tags: string[];
  root: string;
  showcase: string;
  palette: { name: string; value: string }[];
  componentCount: number;
};

/** One card per era, in the order the eras happened. */
export function TemplateCatalog({ kits }: { kits: CatalogKit[] }) {
  return (
    <section className="tpl-catalog lb-container" aria-labelledby="tpl-catalog-heading">
      <header className="tpl-catalog-header">
        <h2 id="tpl-catalog-heading">Thirty years of interface</h2>
        <p>
          {kits.length} kits, in the order they happened. Each one is self-contained: a single root class holds the
          tokens, the type and the surface.
        </p>
      </header>

      <ol className="tpl-grid">
        {kits.map((kit) => {
          const glow = kitGlow(kit);
          return (
            <li key={kit.id} className="tpl-card" style={{ "--tpl-card-accent": glow[0] } as React.CSSProperties}>
              <div
                className={`tpl-card-stage ${kit.root}`}
                inert
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: kit.showcase }}
              />
              <span className="tpl-card-fade" aria-hidden="true" />
              <div className="tpl-card-meta">
                <span className="tpl-card-period">
                  <i style={{ background: glow[0] }} aria-hidden="true" />
                  {kit.period}
                </span>
                <h3>
                  <Link href={`/templates/${kit.id}`} className="tpl-card-link">
                    {kit.name}
                  </Link>
                </h3>
                <p className="tpl-card-tagline">{kit.tagline}</p>
                <span className="tpl-card-foot">
                  {kit.componentCount} components
                  <SFSymbol name="arrow.up.right" size={12} aria-hidden="true" />
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
