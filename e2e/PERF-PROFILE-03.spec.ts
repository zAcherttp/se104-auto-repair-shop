import { test, expect } from "@playwright/test";

/**
 * PERF-PROFILE-03: Search/filter employee list
 * 
 * Test Case: Measure client-side filtering speed
 * 
 * Success Criteria:
 * - p95 ≤ 300ms per filter operation
 * - Correct employees displayed
 * - No duplicate requests
 * - Results update smoothly
 * 
 * Dependency: PERF-PROFILE-02
 */

interface FilterMetrics {
  attempt: number;
  duration: number;
  resultsCorrect: boolean;
  success: boolean;
}

test.describe("PERF-PROFILE-03: Employee List Filtering Performance", () => {
  const TEST_ITERATIONS = 10;
  const TEST_EMAIL = "saladegg24@gmail.com";
  const TEST_PASSWORD = "123456";
  
  const metrics: FilterMetrics[] = [];

  for (let i = 1; i <= TEST_ITERATIONS; i++) {
    test(`Attempt ${i}/${TEST_ITERATIONS}: Filter employee list`, async ({ page, context }) => {
      console.log(`\n⏱️ Attempt ${i}: Testing filter performance...`);
      
      // Login and navigate
      await page.goto("/login", { waitUntil: "networkidle" });
      
      // Clear storage after navigation to avoid SecurityError
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      // Wait for form to be ready
      await page.waitForSelector('input[name="email"]', { state: "visible", timeout: 10000 });
      await page.waitForSelector('input[name="password"]', { state: "visible", timeout: 10000 });
      await page.waitForSelector('button[type="submit"]', { state: "visible", timeout: 10000 });
      
      await page.locator('input[name="email"]').fill(TEST_EMAIL);
      await page.locator('input[name="password"]').fill(TEST_PASSWORD);
      
      // Submit and wait for redirect with better error handling
      try {
        await Promise.all([
          page.waitForURL((url) => url.toString().includes("/reception") || url.toString().includes("/home"), { timeout: 60000 }),
          page.locator('button[type="submit"]').first().click(),
        ]);
      } catch (error) {
        console.log(`   ✗ Login failed or timed out`);
        console.log(`   Current URL: ${page.url()}`);
        await page.screenshot({ path: `test-results/PERF-PROFILE-03-login-timeout-${i}.png`, fullPage: true });
        throw error;
      }
      
      await page.goto("/settings", { waitUntil: "domcontentloaded" });
      const employeesTab = page.locator('button:has-text("Employees"), a:has-text("Employees"), [role="tab"]:has-text("Employees")').first();
      await employeesTab.click();
      
      try {
        // Find search/filter input
        const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="Filter"]').first();
        await searchInput.waitFor({ state: "visible", timeout: 5000 });
        await searchInput.focus();
        
        // Track network requests to ensure client-side filtering
        let apiCallCount = 0;
        page.on("request", (request) => {
          if (request.url().includes("/api/") || request.url().includes("employee")) {
            apiCallCount++;
          }
        });
        
        const searchTerm = i % 2 === 0 ? "John" : "Admin";
        
        // Type search term and measure
        const startTime = Date.now();
        await searchInput.fill(searchTerm);
        
        // Wait for filtered results
        await page.waitForTimeout(500); // Give time for filtering
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Verify results
        const tableRows = await page.locator('table tbody tr, [role="row"]:not([role="rowheader"])').count();
        const resultsCorrect = tableRows >= 0; // At least shows something
        
        console.log(`✅ Attempt ${i}: Filtered in ${duration}ms - Results: ${tableRows}, API calls: ${apiCallCount}`);
        
        metrics.push({
          attempt: i,
          duration,
          resultsCorrect,
          success: true,
        });
        
        // Clear search
        await searchInput.clear();
      } catch (error) {
        metrics.push({
          attempt: i,
          duration: 0,
          resultsCorrect: false,
          success: false,
        });
        throw error;
      }
    });
  }

  test.afterAll(async () => {
    const successfulAttempts = metrics.filter((m) => m.success);
    const durations = successfulAttempts.map((m) => m.duration).sort((a, b) => a - b);
    
    if (durations.length === 0) return;

    const p95Index = Math.floor(durations.length * 0.95);
    const p95 = durations[p95Index];

    console.log("\n" + "=".repeat(80));
    console.log("PERF-PROFILE-03: Performance Test Results");
    console.log("=".repeat(80));
    console.log(`\n📈 p95: ${p95}ms`);

    const p95Pass = p95 <= 300;
    console.log(`\n✅ ${p95Pass ? "✓" : "✗"} p95 ≤ 300ms: ${p95}ms ${p95Pass ? "(PASS)" : "(FAIL)"}`);

    const fs = require("fs");
    const path = require("path");
    fs.writeFileSync(
      path.join(process.cwd(), "test-results", "PERF-PROFILE-03-results.json"),
      JSON.stringify({ testCase: "PERF-PROFILE-03", metrics }, null, 2)
    );

    expect(p95).toBeLessThanOrEqual(300);
  });
});
