import { build } from "esbuild";

export const runtime = "nodejs";

// Compile only. User code executes in an opaque-origin sandbox, never on the server.
export async function POST(request: Request) {
  try {
    const body = await request.text();
    if (body.length > 200_000) return Response.json({ error: "Component exceeds 200 KB." }, { status: 413 });
    const parsed = JSON.parse(body);
    const { tsx } = parsed;
    const exportName = typeof parsed.exportName === "string" && /^[A-Za-z_$][\w$]*$/.test(parsed.exportName) ? parsed.exportName : "Button";
    if (typeof tsx !== "string") return Response.json({ error: "Missing TSX source." }, { status: 400 });
    const result = await build({
      stdin: {
        contents: `import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Component from 'blank-component';
const report = (error) => parent.postMessage({ type: 'blank:error', message: String(error?.message || error) }, '*');
window.addEventListener('error', event => report(event.error || event.message));
window.addEventListener('unhandledrejection', event => report(event.reason));
class Boundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { report(error); }
  render() { return this.state.error ? React.createElement('pre', { role: 'alert' }, String(this.state.error.message)) : this.props.children; }
}
const Button = Component.${exportName} || Component.default;
if (!Button) throw new Error('Export ${exportName} or a default React component from the component file.');
const root = createRoot(document.getElementById('root'));
// Lucide icon nodes from the editor become inline SVG, sized by the component's managed CSS.
const shapes = new Set(['path', 'circle', 'ellipse', 'line', 'polygon', 'polyline', 'rect']);
const icon = (node) => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true', focusable: 'false' },
  node.filter(entry => Array.isArray(entry) && shapes.has(entry[0])).map(([tag, attributes], key) => React.createElement(tag, { ...attributes, key })));
window.renderPreview = (state, props = {}) => {
  const icons = {};
  for (const [name, node] of Object.entries(props?.icons || {})) if (Array.isArray(node)) icons[name] = icon(node);
  root.render(React.createElement(Boundary, null, React.createElement(Button, { 'data-preview-state': state, ...(state === 'disabled' ? { disabled: true } : {}), ...icons })));
};
window.renderPreview(window.previewState || 'default', window.previewProps);`,
        resolveDir: process.cwd(), loader: "tsx", sourcefile: "preview.tsx",
      },
      bundle: true, write: false, platform: "browser", format: "iife", jsx: "automatic",
      minify: true, define: { "process.env.NODE_ENV": '"production"' }, logLevel: "silent",
      plugins: [{ name: "component-files", setup(builder) {
        builder.onResolve({ filter: /^blank-component$/ }, () => ({ path: "Button.tsx", namespace: "component" }));
        builder.onLoad({ filter: /.*/, namespace: "component" }, () => ({ contents: tsx, loader: "tsx", resolveDir: process.cwd() }));
        builder.onResolve({ filter: /.*/, namespace: "component" }, args => {
          if (args.path === "./styles.css") return { path: "styles.css", namespace: "empty-css" };
          if (["react", "react/jsx-runtime", "react/jsx-dev-runtime"].includes(args.path)) return;
          return { errors: [{ text: `Unsupported import: ${args.path}. Preview supports React and ./styles.css.` }] };
        });
        builder.onLoad({ filter: /.*/, namespace: "empty-css" }, () => ({ contents: "", loader: "js" }));
      } }],
    });
    return Response.json({ code: result.outputFiles[0].text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to compile component.";
    return Response.json({ error: message }, { status: 400 });
  }
}
