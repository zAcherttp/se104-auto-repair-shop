/**
 * PERF-ORDER-01: Navigate to Vehicles page - measure page load and repair order list render
 * 
 * Steps:
 * 1. Login with valid credentials
 * 2. Click on "Vehicles" in sidebar
 * 3. Measure time from navigation to complete page render
 * 4. Verify vehicle/repair order table displays
 * 5. Repeat 3 times
 * 6. Calculate median LCP (Largest Contentful Paint)
 * 
 * Success Criteria:
 * - Median LCP ≤ 2500ms
 * - Page renders completely
 * - Table with columns visible
 * - No layout shifts
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, calculatePercentile } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-ORDER-01: Navigate to Vehicles page", () => {
  const REPEAT = 3;
  const results: Array<{ run: number; lcp: number; loadTime: number }> = [];

  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: Measure page load and LCP`, async ({ page }) => {
      const startTime = Date.now();

      // Navigate to vehicles page
      await page.goto("/vehicles", { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");

      const loadTime = Date.now() - startTime;

      // Get LCP metric
      const lcp = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            resolve(lastEntry.renderTime || lastEntry.loadTime);
          }).observe({ type: "largest-contentful-paint", buffered: true });

          // Fallback timeout
          setTimeout(() => resolve(0), 5000);
        });
      });

      // Verify table is visible
      const tableVisible = await page.locator("table").isVisible().catch(() => false);
      expect(tableVisible, "Table should be visible").toBe(true);

      // Check for layout shifts
      const cls = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let clsValue = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
          }).observe({ type: "layout-shift", buffered: true });

          setTimeout(() => resolve(clsValue), 2000);
        });
      });

      console.log(`Run ${run}: LCP=${lcp}ms, LoadTime=${loadTime}ms, CLS=${cls.toFixed(3)}`);

      results.push({ run, lcp, loadTime });

      // Basic assertions
      expect(lcp, `LCP should be ≤ 2500ms, got ${lcp}ms`).toBeLessThanOrEqual(2500);
      expect(cls, `CLS should be < 0.1, got ${cls}`).toBeLessThan(0.1);
    });
  }

  test.afterAll(async () => {
    const lcpValues = results.map(r => r.lcp).sort((a, b) => a - b);
    const medianLcp = lcpValues[Math.floor(lcpValues.length / 2)];

    console.log("\n=== PERF-ORDER-01 Results ===");
    console.log(`Median LCP: ${medianLcp}ms`);
    console.log(`All runs:`, results);

    saveTestResults("PERF-ORDER-01", {
      testName: "PERF-ORDER-01",
      description: "Navigate to Vehicles page",
      medianLcp,
      runs: results,
      successCriteria: {
        medianLcp: { threshold: 2500, actual: medianLcp, pass: medianLcp <= 2500 },
      },
    });

    expect(medianLcp, `Median LCP should be ≤ 2500ms`).toBeLessThanOrEqual(2500);
  });
});
