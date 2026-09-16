export type TemplateComponent = {
  id: string;
  name: string;
  description: string;
  html: string;
  css: string;
};

export type TemplateKit = {
  /** URL slug: /templates/[id] */
  id: string;
  name: string;
  /** e.g. "1995 – 2000", "2020 – 2024" */
  period: string;
  /** Short line shown on catalog cards. */
  tagline: string;
  description: string;
  /** What the era was reacting to, and what came next. One or two sentences. */
  context: string;
  tags: string[];
  /** Root class. Tokens, font and surface live here; every component class uses it as prefix. */
  root: string;
  palette: { name: string; value: string }[];
  fonts: string;
  /** Tokens, surface and shared rules for the root class. */
  baseCss: string;
  /** A small composition for the catalog card. Uses component classes. */
  showcase: string;
  components: TemplateComponent[];
};

/** Strips the common leading indentation so snippets copy cleanly. */
export function dedent(source: string): string {
  const lines = source.replace(/^\n+|\s+$/g, "").split("\n");
  const indent = Math.min(
    ...lines.filter((line) => line.trim()).map((line) => line.match(/^ */)![0].length),
  );
  return lines.map((line) => line.slice(indent)).join("\n");
}

export const html = (strings: TemplateStringsArray, ...values: unknown[]) =>
  dedent(String.raw(strings, ...values));

export const css = html;
