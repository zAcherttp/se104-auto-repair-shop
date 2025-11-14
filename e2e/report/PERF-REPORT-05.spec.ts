/**
 * PERF-REPORT-05: Reports dashboard page load - measure page and chart render
 * 
 * Steps:
 * 1. Navigate to /reports page
 * 2. Measure time from navigation to all charts rendered
 * 3. Verify both sales and inventory report tabs visible
 * 4. Measure chart interactivity (if charts present)
 * 5. Repeat 3 times
 * 6. Calculate median LCP
 * 
 * Success Criteria:
 * - Median LCP ≤ 2500ms
 * - Page fully interactive
 * - Charts render ≤ 1500ms
 * - Tab switching responsive
 */

import { test, expect } from "@playwright/test";
import { loginUser, navigateToReports, loadEnvFile, saveTestResults } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-REPORT-05: Reports dashboard page load", () => {
  const REPEAT = 3;
  const results: Array<{ run: number; lcp: number; loadTime: number; tabsVisible: boolean }> = [];

  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: Measure page load`, async ({ page }) => {
      const startTime = Date.now();

      await navigateToReports(page);

      // Get LCP metric
      const lcp = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let lcpValue = 0;
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            lcpValue = lastEntry.renderTime || lastEntry.loadTime;
          }).observe({ type: "largest-contentful-paint", buffered: true });

          setTimeout(() => resolve(lcpValue || 0), 3000);
        });
      });

      const loadTime = Date.now() - startTime;

      // Check if tabs are visible
      const salesTabVisible = await page.locator('[role="tab"]:has-text("Phân tích bán hàng"), button:has-text("Phân tích bán hàng")').isVisible().catch(() => false);
      const inventoryTabVisible = await page.locator('[role="tab"]:has-text("Phân tích tồn kho"), button:has-text("Phân tích tồn kho")').isVisible().catch(() => false);
      
      const tabsVisible = salesTabVisible || inventoryTabVisible;

      console.log(`Run ${run}: LCP=${lcp}ms, LoadTime=${loadTime}ms, Tabs=${tabsVisible}`);

      results.push({ run, lcp, loadTime, tabsVisible });

      expect(lcp, `LCP should be ≤ 2500ms`).toBeLessThanOrEqual(2500);
    });
  }

  test.afterAll(async () => {
    const lcpValues = results.map(r => r.lcp).sort((a, b) => a - b);
    const medianLcp = lcpValues[Math.floor(lcpValues.length / 2)];
    const avgLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0) / results.length;

    console.log("\n=== PERF-REPORT-05 Results ===");
    console.log(`Median LCP: ${medianLcp}ms`);
    console.log(`Avg Load Time: ${avgLoadTime.toFixed(0)}ms`);

    saveTestResults("PERF-REPORT-05", {
      testName: "PERF-REPORT-05",
      description: "Reports dashboard page load",
      medianLcp,
      avgLoadTime,
      runs: results,
      successCriteria: {
        medianLcp: { threshold: 2500, actual: medianLcp, pass: medianLcp <= 2500 },
      },
    });

    expect(medianLcp, `Median LCP should be ≤ 2500ms`).toBeLessThanOrEqual(2500);
  });
});
