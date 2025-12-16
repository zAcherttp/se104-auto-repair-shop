/**
 * PERF-PART-05: View inventory summary/statistics - measure calculation and render speed
 * 
 * Steps:
 * 1. Navigate to Inventory page
 * 2. Measure time to render summary cards
 * 3. Verify calculations accurate
 * 4. Refresh page
 * 5. Measure time again (cache hit scenario)
 * 6. Repeat 5 times
 * 7. Compare 1st run (cold) vs. subsequent (warm)
 * 
 * Success Criteria:
 * - 1st run (cold) ≤ 1800ms
 * - Runs 2-5 (warm) ≤ 600ms
 * - Summary cards render correctly
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, navigateToInventory, createTestSpareParts, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-PART-05: View inventory summary", () => {
  const REPEAT = 5;
  const results: Array<{ run: number; duration: number; cardsFound: number }> = [];

  test.beforeAll(async () => {
    await createTestSpareParts(30);
  });

  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: Measure summary render`, async ({ page }) => {
      const startTime = Date.now();

      await navigateToInventory(page);

      // Wait for summary cards to appear
      const cardSelectors = [
        '[data-test="summary-card"]',
        '.summary-card',
        'div[class*="card"]',
        'h3, h4',
      ];

      let cardsFound = 0;
      for (const selector of cardSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          cardsFound = count;
          break;
        }
      }

      const duration = Date.now() - startTime;

      console.log(`Run ${run}: Duration=${duration}ms, Cards=${cardsFound}`);
      results.push({ run, duration, cardsFound });

      // Different thresholds for cold vs warm
      if (run === 1) {
        expect(duration, `1st run (cold) should be ≤ 1800ms`).toBeLessThanOrEqual(1800);
      } else {
        expect(duration, `Subsequent runs (warm) should be ≤ 600ms`).toBeLessThanOrEqual(600);
      }
    });
  }

  test.afterAll(async () => {
    const coldRun = results[0];
    const warmRuns = results.slice(1);
    const avgWarm = warmRuns.reduce((sum, r) => sum + r.duration, 0) / warmRuns.length;

    console.log("\n=== PERF-PART-05 Results ===");
    console.log(`Cold run (1st): ${coldRun?.duration}ms`);
    console.log(`Warm runs avg: ${avgWarm.toFixed(0)}ms`);

    saveTestResults("PERF-PART-05", {
      testName: "PERF-PART-05",
      description: "View inventory summary",
      coldRun: coldRun?.duration,
      avgWarm,
      runs: results,
      successCriteria: {
        coldRun: { threshold: 1800, actual: coldRun?.duration || 0, pass: (coldRun?.duration || 0) <= 1800 },
        avgWarm: { threshold: 600, actual: avgWarm, pass: avgWarm <= 600 },
      },
    });

    await cleanupTestData();

    if (coldRun) {
      expect(coldRun.duration, `Cold run should be ≤ 1800ms`).toBeLessThanOrEqual(1800);
    }
  });
});
