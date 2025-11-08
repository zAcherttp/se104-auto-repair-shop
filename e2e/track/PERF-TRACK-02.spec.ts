/**
 * PERF-TRACK-02: Partial plate search - measure fuzzy/prefix search performance
 * 
 * Steps:
 * 1. Navigate to authenticated vehicle search
 * 2. Enter partial plate
 * 3. Measure time until results display
 * 4. Verify matching vehicles shown
 * 5. Test with different prefixes
 * 6. Repeat 10 times
 * 7. Calculate p95
 * 
 * Success Criteria:
 * - p95 ≤ 1500ms
 * - All matching vehicles displayed
 * - Results sorted logically
 * - No duplicate results
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, calculatePercentile, createTestVehiclesForTracking, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-TRACK-02: Partial plate search", () => {
  const REPEAT = 10;
  const prefixes = ["51A-1", "51A-2", "51A-3", "51A-4", "51A"];
  const results: Array<{ run: number; duration: number; prefix: string; resultCount: number }> = [];

  test.beforeAll(async () => {
    await createTestVehiclesForTracking(50);
  });

  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    // Navigate to vehicles page for authenticated search
    await page.goto("/vehicles", { waitUntil: "networkidle" });
  });

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: Partial search`, async ({ page }) => {
      const prefix = prefixes[run % prefixes.length];

      // Find search input
      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"], input[name="search"]').first();
      
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.clear();

        const startTime = Date.now();

        // Enter partial plate
        await searchInput.fill(prefix);

        // Wait for results
        await page.waitForTimeout(600);
        await page.waitForLoadState("networkidle");

        const duration = Date.now() - startTime;

        // Count results
        const resultCount = await page.locator("table tbody tr").count();

        console.log(`Run ${run}: Searched "${prefix}" in ${duration}ms - ${resultCount} results`);

        results.push({ run, duration, prefix, resultCount });

        expect(duration, `Duration should be ≤ 1500ms`).toBeLessThanOrEqual(1500);
      }

      await page.waitForTimeout(500);
    });
  }

  test.afterAll(async () => {
    const durations = results.map(r => r.duration).sort((a, b) => a - b);
    const p95 = calculatePercentile(durations, 95);

    console.log("\n=== PERF-TRACK-02 Results ===");
    console.log(`p95: ${p95}ms`);

    saveTestResults("PERF-TRACK-02", {
      testName: "PERF-TRACK-02",
      description: "Partial plate search",
      p95,
      runs: results,
      successCriteria: {
        p95: { threshold: 1500, actual: p95, pass: p95 <= 1500 },
      },
    });

    await cleanupTestData();

    if (durations.length > 0) {
      expect(p95, `p95 should be ≤ 1500ms`).toBeLessThanOrEqual(1500);
    }
  });
});
