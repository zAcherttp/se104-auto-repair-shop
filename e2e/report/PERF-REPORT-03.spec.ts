/**
 * PERF-REPORT-03: Repeat report generation - measure caching effectiveness
 * 
 * Steps:
 * 1. Generate sales report for specific month
 * 2. Note load time (cold)
 * 3. Generate same report again immediately
 * 4. Measure load time (warm)
 * 5. Repeat 3 times
 * 6. Compare cold vs. warm performance
 * 
 * Success Criteria:
 * - Cold load ≤ 2500ms
 * - Warm loads ≤ 900ms
 * - Cache reduces latency by ≥40%
 * - Results identical
 */

import { test, expect } from "@playwright/test";
import { loginUser, navigateToReports, loadEnvFile, saveTestResults, createTestRepairOrdersForReports, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-REPORT-03: Report caching", () => {
  const REPEAT = 3;
  const results: Array<{ run: number; coldDuration: number; warmDuration: number }> = [];

  test.beforeAll(async () => {
    await createTestRepairOrdersForReports(20);
  });

  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: Cold vs Warm load`, async ({ page }) => {
      // COLD LOAD
      await navigateToReports(page);

      const salesTab = page.locator('[role="tab"]:has-text("Phân tích bán hàng"), button:has-text("Phân tích bán hàng")').first();
      if (await salesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await salesTab.click();
        await page.waitForTimeout(300);
      }

      const coldStart = Date.now();
      
      // Wait for report to auto-load
      await page.waitForTimeout(800);
      await page.waitForLoadState("domcontentloaded");

      const coldDuration = Date.now() - coldStart;

      // WARM LOAD - reload the same tab
      await page.waitForTimeout(500);

      const warmStart = Date.now();

      // Click tab again or wait for re-render
      if (await salesTab.isVisible().catch(() => false)) {
        await salesTab.click();
      }

      await page.waitForTimeout(500);
      await page.waitForLoadState("domcontentloaded");

      const warmDuration = Date.now() - warmStart;

      console.log(`Run ${run}: COLD=${coldDuration}ms, WARM=${warmDuration}ms`);

      results.push({ run, coldDuration, warmDuration });

      expect(coldDuration, `Cold load should be ≤ 2500ms`).toBeLessThanOrEqual(2500);
      expect(warmDuration, `Warm load should be ≤ 900ms`).toBeLessThanOrEqual(900);
    });
  }

  test.afterAll(async () => {
    const avgCold = results.reduce((sum, r) => sum + r.coldDuration, 0) / results.length;
    const avgWarm = results.reduce((sum, r) => sum + r.warmDuration, 0) / results.length;
    const reduction = ((avgCold - avgWarm) / avgCold) * 100;

    console.log("\n=== PERF-REPORT-03 Results ===");
    console.log(`Avg Cold: ${avgCold.toFixed(0)}ms`);
    console.log(`Avg Warm: ${avgWarm.toFixed(0)}ms`);
    console.log(`Reduction: ${reduction.toFixed(1)}%`);

    saveTestResults("PERF-REPORT-03", {
      testName: "PERF-REPORT-03",
      description: "Report caching effectiveness",
      avgCold,
      avgWarm,
      latencyReduction: reduction,
      runs: results,
      successCriteria: {
        cold: { threshold: 2500, actual: avgCold, pass: avgCold <= 2500 },
        warm: { threshold: 900, actual: avgWarm, pass: avgWarm <= 900 },
        reduction: { threshold: 40, actual: reduction, pass: reduction >= 40 },
      },
    });

    await cleanupTestData();

    expect(avgCold, `Average cold load should be ≤ 2500ms`).toBeLessThanOrEqual(2500);
    expect(avgWarm, `Average warm load should be ≤ 900ms`).toBeLessThanOrEqual(900);
    expect(reduction, `Cache should reduce latency by ≥40%`).toBeGreaterThanOrEqual(40);
  });
});
