/**
 * PERF-PART-01: Navigate to Inventory page - measure page load and parts list render
 * 
 * Steps:
 * 1. Login with valid credentials
 * 2. Click "Inventory" in sidebar
 * 3. Measure time from navigation to complete page render
 * 4. Count network requests via DevTools
 * 5. Verify parts table displays
 * 6. Repeat 3 times
 * 7. Calculate median LCP
 * 
 * Success Criteria:
 * - Median LCP ≤ 2500ms
 * - Total network requests ≤ 30
 * - Parts table renders with all columns
 * - No layout shifts
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, calculatePercentile, navigateToInventory } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-PART-01: Navigate to Inventory page", () => {
  const REPEAT = 3;
  const results: Array<{ run: number; lcp: number; loadTime: number; requestCount: number; cls: number }> = [];

  test.setTimeout(30000);

  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: Measure page load and LCP`, async ({ page }) => {
      // Track network requests
      let requestCount = 0;
      page.on("request", () => requestCount++);

      const startTime = Date.now();

      // Navigate to inventory with retry
      let navigated = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await navigateToInventory(page);
          navigated = true;
          break;
        } catch (e) {
          console.log(`Navigation attempt ${attempt + 1} failed:`, e);
          if (attempt === 2) throw e;
          await page.waitForTimeout(1000);
        }
      }
      
      if (!navigated) {
        throw new Error('Failed to navigate to inventory page after 3 attempts');
      }

      const loadTime = Date.now() - startTime;

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

      // Verify table is visible
      const tableVisible = await page.locator("table").isVisible().catch(() => false);
      expect(tableVisible, "Parts table should be visible").toBe(true);

      console.log(`Run ${run}: LCP=${lcp}ms, LoadTime=${loadTime}ms, Requests=${requestCount}, CLS=${cls.toFixed(3)}`);

      results.push({ run, lcp, loadTime, requestCount, cls });

      // Assertions
      expect(lcp, `LCP should be ≤ 2500ms`).toBeLessThanOrEqual(2500);
      expect(requestCount, `Request count should be ≤ 30`).toBeLessThanOrEqual(30);
      expect(cls, `CLS should be < 0.1`).toBeLessThan(0.1);
    });
  }

  test.afterAll(async () => {
    if (results.length === 0) {
      console.log('No test results collected - all tests may have failed');
      return;
    }

    const lcpValues = results.map(r => r.lcp).sort((a, b) => a - b);
    const medianLcp = lcpValues.length > 0 ? lcpValues[Math.floor(lcpValues.length / 2)] : 0;
    const avgRequests = results.length > 0 ? results.reduce((sum, r) => sum + r.requestCount, 0) / results.length : 0;

    console.log("\n=== PERF-PART-01 Results ===");
    console.log(`Median LCP: ${medianLcp}ms`);
    console.log(`Average Requests: ${avgRequests.toFixed(0)}`);
    console.log(`All runs:`, results);

    saveTestResults("PERF-PART-01", {
      testName: "PERF-PART-01",
      description: "Navigate to Inventory page",
      medianLcp,
      avgRequests,
      runs: results,
      successCriteria: {
        medianLcp: { threshold: 2500, actual: medianLcp, pass: medianLcp <= 2500 },
        avgRequests: { threshold: 30, actual: avgRequests, pass: avgRequests <= 30 },
      },
    });

    if (results.length > 0) {
      expect(medianLcp, `Median LCP should be ≤ 2500ms`).toBeLessThanOrEqual(2500);
    }
  });
});
