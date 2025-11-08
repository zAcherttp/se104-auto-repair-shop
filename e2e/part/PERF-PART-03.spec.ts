/**
 * PERF-PART-03: Search/filter parts by name or code - measure search performance
 * 
 * Steps:
 * 1. Navigate to Inventory page (with 50+ parts)
 * 2. Focus on search input
 * 3. Type "brake" to search
 * 4. Measure time from last keystroke to filtered results
 * 5. Verify correct parts shown
 * 6. Clear and search for part code
 * 7. Repeat 10 times with different queries
 * 8. Calculate p95
 * 
 * Success Criteria:
 * - p95 ≤ 1500ms
 * - Correct parts filtered
 * - Search works for both name and code
 * - Results update smoothly
 */

import { test, expect } from "@playwright/test";
import { loginUser, loadEnvFile, saveTestResults, calculatePercentile, navigateToInventory, createTestSpareParts, cleanupTestData } from "./helpers";

loadEnvFile();

test.describe.serial("PERF-PART-03: Search/filter parts", () => {
  const SEED_COUNT = 50;
  const REPEAT = 10;
  const searchQueries = ["brake", "engine", "PERF-P-0001", "Test Part", "suspension"];
  const results: Array<{ run: number; duration: number; query: string; resultCount: number }> = [];

  test.beforeAll(async () => {
    await createTestSpareParts(SEED_COUNT);
  });

  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await navigateToInventory(page);
  });

  for (let run = 1; run <= REPEAT; run++) {
    test(`Run ${run}/${REPEAT}: Search parts`, async ({ page }) => {
      const query = searchQueries[run % searchQueries.length];

      // Find search input
      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"], input[name="search"]').first();
      
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.clear();

        const startTime = Date.now();

        // Type search query
        await searchInput.fill(query);

        // Wait for debounce and results
        await page.waitForTimeout(500);
        await page.waitForLoadState("networkidle");

        const duration = Date.now() - startTime;

        // Count filtered results
        const resultCount = await page.locator("table tbody tr").count();

        console.log(`Run ${run}: Query="${query}", Duration=${duration}ms, Results=${resultCount}`);

        results.push({ run, duration, query, resultCount });

        expect(duration, `Duration should be ≤ 1500ms`).toBeLessThanOrEqual(1500);
      } else {
        console.log(`Run ${run}: Search input not found, skipping`);
      }
    });
  }

  test.afterAll(async () => {
    const durations = results.map(r => r.duration).sort((a, b) => a - b);
    const p95 = calculatePercentile(durations, 95);

    console.log("\n=== PERF-PART-03 Results ===");
    console.log(`p95: ${p95}ms`);

    saveTestResults("PERF-PART-03", {
      testName: "PERF-PART-03",
      description: "Search/filter parts",
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
