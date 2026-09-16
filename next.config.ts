import type { NextConfig } from "next";
const config: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  serverExternalPackages: ["esbuild"],
  // Esbuild bundles React at runtime inside /api/preview, but the deploy's file tracing only
  // follows static imports. Ship react/react-dom into the function's node_modules explicitly.
  outputFileTracingIncludes: {
    "/api/preview": ["./node_modules/react/**", "./node_modules/react-dom/**"],
  },
};
export default config;
