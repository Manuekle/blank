import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SFSymbol } from "@/components/icons/sf-symbol";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";
import { ComponentBlock } from "@/components/templates/component-block";
import { CopyButton } from "@/components/templates/copy-button";
import { kitComponentSpec, TEMPLATE_KITS, componentCss, componentHtml, componentJsx, getKit, kitCss } from "@/lib/templates";
import { createComponentFiles } from "@/lib/component-model";
import "../../landing/landing.css";
import "../templates.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return TEMPLATE_KITS.map((kit) => ({ kit: kit.id }));
}

export async function generateMetadata({ params }: PageProps<"/templates/[kit]">): Promise<Metadata> {
  const kit = getKit((await params).kit);
  if (!kit) return {};
  return { title: `${kit.name} templates — Blank`, description: kit.description };
}

export default async function KitPage({ params }: PageProps<"/templates/[kit]">) {
  const kit = getKit((await params).kit);
  if (!kit) notFound();

  const index = TEMPLATE_KITS.indexOf(kit);
  // The list is chronological, so the ends genuinely have no earlier/later kit.
  const previous = TEMPLATE_KITS[index - 1];
  const next = TEMPLATE_KITS[index + 1];
  const fullCss = kitCss(kit);

  return (
    <div className="lb-page tpl-page">
      <style dangerouslySetInnerHTML={{ __html: fullCss }} />
      <LandingNav current="templates" />
      <main id="main">
        <section className="tpl-kit-hero lb-container" aria-labelledby="tpl-kit-heading">
          <nav aria-label="Breadcrumb" className="tpl-breadcrumb">
            <Link href="/templates">Templates</Link>
            <span aria-hidden="true">/</span>
            <span>{kit.name}</span>
          </nav>
          <div className="tpl-kit-intro">
            <div>
              <p className="tpl-eyebrow">{kit.period}</p>
              <h1 id="tpl-kit-heading">{kit.name}</h1>
              <p className="tpl-lede">{kit.description}</p>
              <p className="tpl-context">{kit.context}</p>
              <ul className="tpl-tags" aria-label="Tags">
                {kit.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </div>
            <dl className="tpl-specs">
              <div>
                <dt>Palette</dt>
                <dd className="tpl-swatches">
                  {kit.palette.map((swatch) => (
                    <CopyButton key={swatch.name} text={swatch.value} label={swatch.value} className="tpl-swatch">
                      <span className="tpl-swatch-chip" style={{ background: swatch.value }} aria-hidden="true" />
                      <span className="tpl-swatch-name">{swatch.name}</span>
                    </CopyButton>
                  ))}
                </dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{kit.fonts}</dd>
              </div>
              <div>
                <dt>Root class</dt>
                <dd><code>.{kit.root}</code> holds tokens and the surface</dd>
              </div>
              <div className="tpl-specs-actions">
                <CopyButton text={fullCss} label="Copy full kit CSS" className="tpl-primary" />
              </div>
            </dl>
          </div>
        </section>

        <div className="tpl-kit-body lb-container">
          <nav className="tpl-toc" aria-label="Components">
            <p>{kit.components.length} components</p>
            <ol>
              {kit.components.map((component) => (
                <li key={component.id}>
                  <a href={`#${component.id}`}>{component.name}</a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="tpl-blocks">
            {kit.components.map((component) => {
              const forkSpec = kitComponentSpec(kit, component);
              return (
                <ComponentBlock
                  key={component.id}
                  id={component.id}
                  root={kit.root}
                  name={component.name}
                  description={component.description}
                  snippet={component.html}
                  code={{
                    html: componentHtml(kit, component),
                    css: componentCss(kit, component),
                    react: componentJsx(kit, component),
                  }}
                  fork={{ spec: forkSpec, files: createComponentFiles(forkSpec) }}
                />
              );
            })}
          </div>
        </div>

        <nav className="tpl-pager lb-container" aria-label="More eras">
          {previous ? (
            <Link href={`/templates/${previous.id}`}>
              <span>Earlier</span>
              {previous.name} <small>{previous.period}</small>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/templates/${next.id}`} className="tpl-pager-next">
              <span>Later</span>
              {next.name} <small>{next.period}</small>{" "}
              <SFSymbol name="arrow.up.right" size={14} aria-hidden="true" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>
      <LandingFooter note="Free to copy, change and ship." />
    </div>
  );
}
