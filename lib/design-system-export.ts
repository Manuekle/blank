import type {
  ButtonStyleDNA,
  ComponentDNA,
  ComponentSpec,
} from "./component-model";

export type DesignSystemDocument = {
  dna: ComponentDNA;
};

function mostCommon<T>(values: T[]): T | undefined {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  let best: T | undefined;
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

function token(name: string, value: string | number | undefined, fallback: string, unit = "") {
  if (value === undefined) return `  ${name}: ${fallback};`;
  if (typeof value === "number" && !Number.isFinite(value)) return `  ${name}: ${fallback};`;
  return `  ${name}: ${value}${unit};`;
}

function designSystemCSS(specs: ComponentSpec[], docs: Record<string, DesignSystemDocument>) {
  const base = specs.map((spec) => {
    const dna = docs[spec.id]?.dna;
    return (dna?.themes.dark.base ?? dna?.themes.light.base) as ButtonStyleDNA | undefined;
  }).filter((style): style is ButtonStyleDNA => Boolean(style));

  const colors = base
    .map((style) => style.background)
    .filter((value) => value !== "transparent");

  return `/*
 * Blank — design system tokens.
 *
 * These are the shared values across the components you exported. Each
 * component still ships its own \`styles.css\`, so a component renders
 * correctly even if this file is removed.
 */

:root {
${token("--blank-radius", mostCommon(base.map((style) => style.radius)), "0", "px")}
${token("--blank-font-size", mostCommon(base.map((style) => style.fontSize)), "14", "px")}
${token("--blank-font-weight", mostCommon(base.map((style) => style.fontWeight)), "400")}
${token("--blank-tracking", mostCommon(base.map((style) => style.letterSpacing)), "0", "em")}
${token("--blank-duration", mostCommon(base.map((style) => style.duration)), "180", "ms")}
${token("--blank-surface", mostCommon(colors), "transparent")}
${token("--blank-text", mostCommon(base.map((style) => style.color)), "#111111")}
${token("--blank-border", mostCommon(base.map((style) => style.borderColor)), "#111111")}
${token("--blank-border-width", mostCommon(base.map((style) => style.borderWidth)), "0", "px")}
}

/*
 * Components are exported inside \`@layer blank\`, which keeps them easy to
 * override from application CSS without specificity fights.
 */
`;
}

function readme(specs: ComponentSpec[]) {
  const list = specs
    .map((spec) => `- **${spec.name}** — \`components/${spec.id}/${spec.fileName}\``)
    .join("\n");

  return `# Blank — design system

Exported from Blank. ${specs.length} component${specs.length === 1 ? "" : "s"}, each with its own
self-contained stylesheet, plus the shared tokens you defined visually.

## Components

${list}

## Usage

\`\`\`tsx
import { Button } from "./index";

export function App() {
  return <Button>Save</Button>;
}
\`\`\`

Or import a single component directly:

\`\`\`tsx
import { Button } from "./components/button/Button";
\`\`\`

Every component imports its own \`./styles.css\`, so keep each folder intact.

## Tokens

\`design-system.css\` holds the values shared by the exported components. It is
optional: each \`styles.css\` already carries the values that component needs.

## Theming

Components read the theme from the DOM, in this order:

1. the system preference (\`prefers-color-scheme\`),
2. an explicit \`data-theme="light"\` or \`data-theme="dark"\` on any ancestor,
3. a \`.light\` / \`.dark\` class on any ancestor.

States (\`hover\`, \`active\`, \`focus-visible\`, \`disabled\`) are part of each
stylesheet, so a wrapper can also simulate one with \`data-preview-state\`.

## Notes

- Generated CSS lives inside \`@layer blank\`; your app CSS wins by default.
- Each stylesheet has a \`blank:custom\` block that Blank never overwrites.
`;
}

export function buildDesignSystemFiles(
  specs: ComponentSpec[],
  documents: Record<string, { dna: ComponentDNA; files: { tsx: string; css: string } }>,
): Record<string, string> {
  const files: Record<string, string> = {};

  for (const spec of specs) {
    const document = documents[spec.id];
    if (!document) continue;
    files[`components/${spec.id}/${spec.fileName}`] = document.files.tsx;
    files[`components/${spec.id}/styles.css`] = document.files.css;
  }

  files["index.ts"] = specs
    .filter((spec) => documents[spec.id])
    .map((spec) => `export { ${spec.exportName} } from "./components/${spec.id}/${spec.fileName.replace(/\.tsx$/, "")}";`)
    .join("\n") + "\n";

  files["design-system.css"] = designSystemCSS(specs, documents);
  files["README.md"] = readme(specs);

  return files;
}
