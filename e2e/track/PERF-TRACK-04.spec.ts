/**
 * PERF-TRACK-04: Track Order page load - measure landing page performance
 * 
 * Steps:
 * 1. Navigate to /track-order page
 * 2. Measure time from navigation to interactive
 * 3. Verify search input responsive
 * 4. Measure input lag when typing
 * 5. Repeat 3 times
 * 6. Calculate median LCP and input delay
 * 
 * Success Criteria:
 * - Median LCP ≤ 2500ms
 * - Page fully interactive
 * - Input responsive within 100ms
 * - No layout shifts
 */

import { test, expect } from "@playwright/test";
import { loadEnvFile, saveTestResults } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-TRACK-04: Track Order page load", () => {
  const REPEAT = 3;
  const results: Array<{ run: number; lcp: number; loadTime: number; inputDelay: number; cls: number }> = [];

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: Measure page load`, async ({ page }) => {
      const startTime = Date.now();

      // Navigate to track order page
      await page.goto("/track-order", { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");

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

      // Measure input responsiveness
      const searchInput = page.locator('input[name="license_plate"], input[placeholder*="license"], input[type="search"]').first();
      
      let inputDelay = 0;
      if (await searchInput.isVisible().catch(() => false)) {
        const inputStart = Date.now();
        await searchInput.focus();
        await searchInput.type("51A");
        inputDelay = Date.now() - inputStart;
      }

      console.log(`Run ${run}: LCP=${lcp}ms, LoadTime=${loadTime}ms, InputDelay=${inputDelay}ms, CLS=${cls.toFixed(3)}`);

      results.push({ run, lcp, loadTime, inputDelay, cls });

      // Assertions
      expect(lcp, `LCP should be ≤ 2500ms`).toBeLessThanOrEqual(2500);
      expect(inputDelay, `Input delay should be ≤ 100ms`).toBeLessThanOrEqual(100);
      expect(cls, `CLS should be < 0.1`).toBeLessThan(0.1);
    });
  }

  test.afterAll(async () => {
    const lcpValues = results.map(r => r.lcp).sort((a, b) => a - b);
    const medianLcp = lcpValues[Math.floor(lcpValues.length / 2)];
    const avgInputDelay = results.reduce((sum, r) => sum + r.inputDelay, 0) / results.length;

    console.log("\n=== PERF-TRACK-04 Results ===");
    console.log(`Median LCP: ${medianLcp}ms`);
    console.log(`Average Input Delay: ${avgInputDelay.toFixed(0)}ms`);

    saveTestResults("PERF-TRACK-04", {
      testName: "PERF-TRACK-04",
      description: "Track Order page load",
      medianLcp,
      avgInputDelay,
      runs: results,
      successCriteria: {
        medianLcp: { threshold: 2500, actual: medianLcp, pass: medianLcp <= 2500 },
        avgInputDelay: { threshold: 100, actual: avgInputDelay, pass: avgInputDelay <= 100 },
      },
    });

    expect(medianLcp, `Median LCP should be ≤ 2500ms`).toBeLessThanOrEqual(2500);
    expect(avgInputDelay, `Average input delay should be ≤ 100ms`).toBeLessThanOrEqual(100);
  });
});
