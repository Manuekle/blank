import { build } from "esbuild";

const result = await build({
  stdin: {
    contents: `
import { ALERT_DIALOG_SPEC } from "./lib/components/alert-dialog";
import { createComponentFiles } from "./lib/component-model";
import { readContent } from "./lib/code-sync";
const spec = ALERT_DIALOG_SPEC;
const files = createComponentFiles(spec);
const css = files.css;
postcss.parse(css);
const start = css.indexOf("/* blank:generated:start */");
const end = css.indexOf("/* blank:generated:end */");
const base = "." + spec.className;
let count = 0;
postcss.parse(css.slice(start, end)).walkRules(rule => {
  if (!rule.selector.includes(base) || rule.selector.includes(base + "__") || rule.selector.includes("::")) return;
  const explicit = rule.selector.match(/data-theme="(light|dark)"/);
  const parent = rule.parent;
  const media = parent && parent.type === "atrule" && "params" in parent ? String(parent.params).match(/prefers-color-scheme\\s*:\\s*(light|dark)/) : null;
  if (!(explicit && explicit[1] || media && media[1])) return;
  count++;
});
const content = readContent(files.tsx, spec.contentProp);
console.log(JSON.stringify({
  tripledSelector: css.includes(".blank-alert-dialog.blank-alert-dialog.blank-alert-dialog"),
  themeRules: count,
  content,
  defaultContent: spec.defaultContent,
  contentMatches: content === spec.defaultContent,
  hasGridConflict: css.includes("display: grid") || css.includes("display:grid"),
}, null, 2));
`,
    sourcefile: "check.ts",
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
  external: ["postcss", "@babel/parser"],
  absWorkingDir: "/Users/manudev/Dev/blank-ui",
});

const dataUrl = "data:text/javascript;base64," + Buffer.from(result.outputFiles[0].text).toString("base64");
await import(dataUrl);
