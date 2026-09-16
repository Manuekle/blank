import { defineConfig } from '@playwright/test';
export default defineConfig({
  // One worker: the editor compiles previews through a single dev server, so
  // parallel pages starve each other and time out on unrelated assertions.
  testDir: './tests', fullyParallel: true, workers: 1, timeout: 30_000,
  use: { baseURL: 'http://localhost:3001', headless: true, viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure' },
  webServer: { command: 'NEXT_DIST_DIR=.next-check npm run dev -- --port 3001', url: 'http://localhost:3001', reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
