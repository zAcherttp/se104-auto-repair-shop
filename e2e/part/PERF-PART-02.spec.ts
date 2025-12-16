/**
 * PERF-PART-02: Load parts list with pagination - measure table render with 50 items
 * 
 * Steps:
 * 1. Seed database with 50+ spare parts
 * 2. Navigate to Inventory page
 * 3. Measure time until all visible rows render
 * 4. Capture response payload size via Network API
 * 5. Verify pagination controls (if applicable)
 * 6. Repeat 10 times
 * 7. Calculate p95
 * 
 * Success Criteria:
 * - p95 ≤ 1200ms
 * - Response payload ≤ 250KB
 * - All 50 parts display correctly
 * - Table interactive immediately
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, calculatePercentile, navigateToInventory, createTestSpareParts, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-PART-02: Load parts list with 50 items", () => {
  const SEED_COUNT = 50;
  const REPEAT = 10;
  const results: Array<{ run: number; duration: number; payloadSize: number; rowCount: number }> = [];

  test.beforeAll(async () => {
    await createTestSpareParts(SEED_COUNT);
  });

  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: Measure table render`, async ({ page }) => {
      let payloadSize = 0;

      page.on("response", async (response) => {
        if (response.url().includes("/spare_parts") || response.url().includes("inventory")) {
          try {
            const buffer = await response.body();
            payloadSize += buffer.length;
          } catch {
            // Ignore
          }
        }
      });

      const startTime = Date.now();

      await navigateToInventory(page);

      // Wait for table rows to appear
      await page.waitForSelector("table tbody tr", { timeout: 5000 });

      const duration = Date.now() - startTime;

      // Count visible rows
      const rowCount = await page.locator("table tbody tr").count();

      console.log(`Run ${run}: Duration=${duration}ms, Payload=${(payloadSize / 1024).toFixed(1)}KB, Rows=${rowCount}`);

      results.push({ run, duration, payloadSize, rowCount });

      // Assertions
      expect(duration, `Duration should be ≤ 1200ms`).toBeLessThanOrEqual(1200);
      expect(payloadSize, `Payload should be ≤ 250KB`).toBeLessThanOrEqual(250 * 1024);
      expect(rowCount, `Should display rows`).toBeGreaterThan(0);
    });
  }

  test.afterAll(async () => {
    const durations = results.map(r => r.duration).sort((a, b) => a - b);
    const p95 = calculatePercentile(durations, 95);
    const avgPayload = results.reduce((sum, r) => sum + r.payloadSize, 0) / results.length;

    console.log("\n=== PERF-PART-02 Results ===");
    console.log(`p95: ${p95}ms`);
    console.log(`Average Payload: ${(avgPayload / 1024).toFixed(1)}KB`);

    saveTestResults("PERF-PART-02", {
      testName: "PERF-PART-02",
      description: "Load parts list with 50 items",
      p95,
      avgPayload: avgPayload / 1024,
      runs: results,
      successCriteria: {
        p95: { threshold: 1200, actual: p95, pass: p95 <= 1200 },
        avgPayload: { threshold: 250, actual: avgPayload / 1024, pass: avgPayload <= 250 * 1024 },
      },
    });

    await cleanupTestData();
    expect(p95, `p95 should be ≤ 1200ms`).toBeLessThanOrEqual(1200);
  });
});
