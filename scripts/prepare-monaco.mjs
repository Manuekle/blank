import { build } from 'esbuild';
import { rmSync } from 'node:fs';
import { join } from 'node:path';

const monaco = join(process.cwd(), 'node_modules/monaco-editor/esm/vs');
rmSync('public/monaco', { recursive: true, force: true });
// Build from source so the patched DOMPurify also replaces Monaco's vendored copy.
await build({
  entryPoints: {
    index: join(monaco, 'index.js'),
    'editor.worker': join(monaco, 'editor/editor.worker.js'),
    'ts.worker': join(monaco, 'languages/features/typescript/ts.worker.js'),
    'css.worker': join(monaco, 'languages/features/css/css.worker.js'),
    'html.worker': join(monaco, 'languages/features/html/html.worker.js'),
    'json.worker': join(monaco, 'languages/features/json/json.worker.js'),
  },
  outdir: 'public/monaco', bundle: true, splitting: true, format: 'esm', minify: true,
  chunkNames: 'chunk-[hash]', assetNames: '[name]-[hash]', loader: { '.ttf': 'file' },
  plugins: [{ name: 'patched-dompurify', setup(builder) {
    builder.onResolve({ filter: /dompurify\/dompurify\.js$/ }, () => ({ path: join(process.cwd(), 'node_modules/dompurify/dist/purify.es.mjs') }));
  } }],
});
