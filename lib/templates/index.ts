import { aqua } from "./kits/aqua";
import { bento } from "./kits/bento";
import { classicDesktop } from "./kits/classic-desktop";
import { flatMetro } from "./kits/flat-metro";
import { liquidGlass } from "./kits/liquid-glass";
import { skeuomorphic } from "./kits/skeuomorphic";
import { vhs } from "./kits/vhs";
import { web2 } from "./kits/web2";
import type { TemplateComponent, TemplateKit } from "./types";
import type { ComponentSpec } from "@/lib/component-model";

export type { TemplateComponent, TemplateKit };

/** One kit per era, listed chronologically. */
export const TEMPLATE_KITS: TemplateKit[] = [
  vhs,
  classicDesktop,
  aqua,
  web2,
  skeuomorphic,
  flatMetro,
  bento,
  liquidGlass,
];

export function getKit(id: string): TemplateKit | undefined {
  return TEMPLATE_KITS.find((kit) => kit.id === id);
}

export function kitCss(kit: TemplateKit): string {
  return [kit.baseCss, ...kit.components.map((component) => component.css)].join("\n\n");
}

const classesIn = (markup: string) =>
  new Set([...markup.matchAll(/class="([^"]+)"/g)].flatMap((match) => match[1].split(/\s+/)));

const defines = (source: string, className: string) =>
  new RegExp(`\\.${className.replace(/[-]/g, "\\-")}(?![\\w-])`).test(source);

/** Component CSS plus any sibling component CSS whose classes the markup borrows (e.g. a card using the button). */
export function componentCss(kit: TemplateKit, component: TemplateComponent): string {
  const classes = [...classesIn(component.html)].filter(
    (name) => name !== kit.root && !defines(kit.baseCss, name) && !defines(component.css, name),
  );
  const borrowed = kit.components.filter(
    (other) => other !== component && classes.some((name) => defines(other.css, name)),
  );
  return [kit.baseCss, ...borrowed.map((other) => other.css), component.css].join("\n\n");
}

const indent = (source: string, spaces: number) =>
  source
    .split("\n")
    .map((line) => (line ? " ".repeat(spaces) + line : line))
    .join("\n");

export function componentHtml(kit: TemplateKit, component: TemplateComponent): string {
  return `<div class="${kit.root}">\n${indent(component.html, 2)}\n</div>`;
}

const pascal = (value: string) =>
  value
    .replace(/&/g, " ")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join("");

function styleObject(declarations: string): string {
  let custom = false;
  const entries = declarations
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const colon = part.indexOf(":");
      const property = part.slice(0, colon).trim();
      const value = part.slice(colon + 1).trim().replace(/"/g, "'");
      if (property.startsWith("--")) {
        custom = true;
        return `"${property}": "${value}"`;
      }
      return `${property.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())}: "${value}"`;
    });
  const object = `{ ${entries.join(", ")} }`;
  return custom ? `${object} as React.CSSProperties` : object;
}

/** Converts a kit snippet to a React component. Covers the attributes the kits use. */
export function componentJsx(kit: TemplateKit, component: TemplateComponent): string {
  const markup = componentHtml(kit, component)
    .replace(/<(input|br|hr|img)\b([^>]*?)\s*\/?>/g, "<$1$2 />")
    .replace(/(<input\b[^>]*?)\schecked(?=[\s/>])/g, "$1 defaultChecked")
    .replace(/(<input\b[^>]*?)\svalue=/g, "$1 defaultValue=")
    .replace(/\sclass="/g, ' className="')
    .replace(/\sfor="/g, ' htmlFor="')
    .replace(/\stabindex="/g, ' tabIndex="')
    .replace(/\s(stroke|fill|clip)-([a-z])([a-z]*)=/g, (_, head: string, first: string, rest: string) => ` ${head}${first.toUpperCase()}${rest}=`)
    .replace(/\sstyle="([^"]*)"/g, (_, declarations: string) => ` style={${styleObject(declarations)}}`);

  const name = pascal(`${kit.name} ${component.name}`);
  return `import "./${kit.id}.css";\n\nexport function ${name}() {\n  return (\n${indent(markup, 4)}\n  );\n}`;
}

const firstComponentClass = (markup: string): string => {
  const match = markup.match(/class="([^"]+)"/);
  const name = match?.[1].split(/\s+/).find(Boolean) ?? "";
  return /^[\w-]+$/.test(name) ? name : "kit-component";
};

/**
 * A kit component as an editor spec: code-only (no managed CSS), so the fork
 * keeps the kit's design verbatim and the Code workspace stays authoritative.
 */
export function kitComponentSpec(kit: TemplateKit, component: TemplateComponent): ComponentSpec {
  const exportName = pascal(`${kit.name} ${component.name}`);

  return {
    id: `kit-${kit.id}-${component.id}`,
    // Kit-qualified, so "Button" from a kit never reads as the Button template.
    name: `${kit.name} ${component.name}`,
    fileName: `${exportName}.tsx`,
    exportName,
    className: firstComponentClass(component.html),
    vanillaTSX: componentJsx(kit, component).replace(`import "./${kit.id}.css";`, 'import "./styles.css";'),
    contentProp: null,
    contentLabel: "Content",
    defaultContent: component.name,
    subCSS: componentCss(kit, component),
    supportedStates: ["default"],
    visual: false,
  };
}
