import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  timeout: 60000,
  expect: { timeout: 10000 },
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3002",
    channel: "msedge",
    headless: true,
    viewport: { width: 1440, height: 960 },
  },
  webServer: {
    command: "node scripts/start-production.mjs",
    url: "http://127.0.0.1:3002",
    reuseExistingServer: true,
    timeout: 120000,
  },
  reporter: "list",
});
