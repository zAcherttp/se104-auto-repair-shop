import { test, expect } from "@playwright/test";

/**
 * PERF-PROFILE-01: Navigate to Employees tab in Settings
 * 
 * Test Case: Measure page load and employee list render time
 * 
 * Steps:
 * 1. Login with admin credentials
 * 2. Navigate to /settings
 * 3. Wait for settings page load
 * 4. Click "Employees" tab
 * 5. Measure time until employee table renders
 * 6. Count displayed employees
 * 7. Repeat 5 times
 * 8. Calculate p50 and p95 percentiles
 * 
 * Success Criteria:
 * - p50 ≤ 1500ms
 * - p95 ≤ 2000ms
 * - Employee table renders completely
 * - All columns (Name, Role, Actions) visible
 */

interface PerformanceMetrics {
  attempt: number;
  duration: number;
  employeeCount: number;
  hasNameColumn: boolean;
  hasRoleColumn: boolean;
  hasActionsColumn: boolean;
  success: boolean;
  error?: string;
}

test.describe("PERF-PROFILE-01: Navigate to Employees Tab Performance", () => {
  // Increase the default test timeout for this suite to avoid flaky timeouts
  test.setTimeout(30000);
  const TEST_ITERATIONS = 5;
  const TEST_EMAIL = "saladegg24@gmail.com";
  const TEST_PASSWORD = "123456";
  
  const metrics: PerformanceMetrics[] = [];

  test.beforeEach(async ({ page, context }) => {
    // Clear cookies and storage before each test
    await context.clearCookies();
    await context.clearPermissions();
  });

  for (let i = 1; i <= TEST_ITERATIONS; i++) {
    test(`Attempt ${i}/${TEST_ITERATIONS}: Navigate to Employees tab`, async ({ page, context }) => {
      console.log(`\n⏱️ Attempt ${i}: Starting navigation test...`);
      
      try {
        // Step 1: Login with admin credentials
        await context.clearCookies();
        await page.goto("/login", { waitUntil: "networkidle" });
        
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
        
        // Wait for login form
        await page.waitForSelector('input[name="email"]', { state: "visible", timeout: 10000 });
        await page.waitForSelector('input[name="password"]', { state: "visible", timeout: 10000 });
        
        // Fill credentials and submit
        await page.locator('input[name="email"]').fill(TEST_EMAIL);
        await page.locator('input[name="password"]').fill(TEST_PASSWORD);
        
        console.log(`   ✓ Credentials filled, submitting...`);

        // Start a navigation waiter before clicking to reliably catch navigations
        const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 }).catch(() => null);

        // Click submit
        await page.locator('button[type="submit"]').first().click();

        // Wait for one of several indicators that login succeeded.
        // Use Promise.any so a single slow waiter doesn't reject the whole wait
        // if another indicator appears first. Each waiter has its own timeout.
        await Promise.any([
          navigationPromise,
          page.waitForSelector('header', { state: 'visible', timeout: 60000 }).catch(() => null),
          page.waitForSelector('a[href="/settings"]', { state: 'visible', timeout: 15000 }).catch(() => null),
        ]);
        
        console.log(`   ✓ Logged in successfully`);
        
        // Step 2: Navigate to /settings
        await page.goto("/settings", { waitUntil: "domcontentloaded" });
        console.log(`   ✓ Navigated to settings page`);
        
        // Step 3: Wait for settings page load
        await page.waitForLoadState("networkidle");
        
        // Step 4 & 5: Click Employees tab and measure render time
        const startTime = Date.now();
        
        // Find and click the Employees tab
        const employeesTab = page.locator('button:has-text("Nhân viên"), a:has-text("Employees"), [role="tab"]:has-text("Employees")').first();
        await employeesTab.click();
        
        console.log(`   ✓ Clicked Employees tab`);
        
        // Wait for employee table to render
        await page.waitForSelector('table, [role="table"]', { state: "visible", timeout: 10000 });
        
        // Wait for table rows to appear
        const tableRows = page.locator('table tbody tr, [role="row"]:not([role="rowheader"])');
        await tableRows.first().waitFor({ state: "visible", timeout: 10000 });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Step 6: Count displayed employees
        const employeeCount = await tableRows.count();
        
        // Verify all required columns are visible
        const tableHeaders = page.locator('table thead th, [role="columnheader"]');
        const headerText = await tableHeaders.allTextContents();
        
        const hasNameColumn = headerText.some(text => 
          text.toLowerCase().includes("name") || text.toLowerCase().includes("tên")
        );
        const hasRoleColumn = headerText.some(text => 
          text.toLowerCase().includes("role") || text.toLowerCase().includes("vai trò") || text.toLowerCase().includes("chức vụ")
        );
        const hasActionsColumn = headerText.some(text => 
          text.toLowerCase().includes("action") || text.toLowerCase().includes("hành động") || text.toLowerCase().includes("thao tác")
        );
        
        console.log(`✅ Attempt ${i}: Employee table rendered in ${duration}ms`);
        console.log(`   Employees displayed: ${employeeCount}`);
        console.log(`   Name column: ${hasNameColumn ? "✓" : "✗"}`);
        console.log(`   Role column: ${hasRoleColumn ? "✓" : "✗"}`);
        console.log(`   Actions column: ${hasActionsColumn ? "✓" : "✗"}`);
        
        // Record metrics
        metrics.push({
          attempt: i,
          duration,
          employeeCount,
          hasNameColumn,
          hasRoleColumn,
          hasActionsColumn,
          success: true,
        });
        
        // Take screenshot on first attempt for verification
        if (i === 1) {
          await page.screenshot({ 
            path: `test-results/PERF-PROFILE-01-employees-tab-${i}.png`, 
            fullPage: true 
          });
          console.log(`📸 Screenshot saved: PERF-PROFILE-01-employees-tab-${i}.png`);
        }
        
      } catch (error) {
        const duration = 0;
        
        // Take screenshot on failure
        try {
          if (!page.isClosed()) {
            await page.screenshot({ 
              path: `test-results/PERF-PROFILE-01-failure-${i}.png`, 
              fullPage: true 
            });
            console.log(`📸 Failure screenshot saved: PERF-PROFILE-01-failure-${i}.png`);
          }
        } catch (screenshotError) {
          console.log(`⚠️ Could not take failure screenshot: ${screenshotError}`);
        }
        
        metrics.push({
          attempt: i,
          duration,
          employeeCount: 0,
          hasNameColumn: false,
          hasRoleColumn: false,
          hasActionsColumn: false,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
        
        console.log(`✗ Attempt ${i}: Failed - ${error}`);
        throw error;
      }
    });
  }

  test.afterAll(async () => {
    // Step 8: Calculate statistics
    const successfulAttempts = metrics.filter((m) => m.success);
    const durations = successfulAttempts.map((m) => m.duration).sort((a, b) => a - b);
    
    if (durations.length === 0) {
      console.log("\n❌ No successful attempts to analyze!");
      return;
    }

    const successRate = (successfulAttempts.length / metrics.length) * 100;
    const p50Index = Math.floor(durations.length * 0.5);
    const p95Index = Math.floor(durations.length * 0.95);
    
    const p50 = durations[p50Index];
    const p95 = durations[p95Index];
    const min = durations[0];
    const max = durations[durations.length - 1];
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;

    // Verify columns visibility
    const allColumnsVisible = successfulAttempts.every(
      (m) => m.hasNameColumn && m.hasRoleColumn && m.hasActionsColumn
    );

    // Print detailed results
    console.log("\n" + "=".repeat(80));
    console.log("PERF-PROFILE-01: Performance Test Results");
    console.log("=".repeat(80));
    console.log("\n📊 Individual Attempts:");
    metrics.forEach((m) => {
      const status = m.success ? "✓" : "✗";
      const errorMsg = m.error ? ` (${m.error})` : "";
      const columns = m.success 
        ? ` - Employees: ${m.employeeCount}, Columns: Name=${m.hasNameColumn ? "✓" : "✗"} Role=${m.hasRoleColumn ? "✓" : "✗"} Actions=${m.hasActionsColumn ? "✓" : "✗"}`
        : "";
      console.log(`  ${status} Attempt ${m.attempt}: ${m.duration}ms${columns}${errorMsg}`);
    });

    console.log("\n📈 Statistical Analysis:");
    console.log(`  Total Attempts: ${metrics.length}`);
    console.log(`  Successful: ${successfulAttempts.length} (${successRate.toFixed(1)}%)`);
    console.log(`  Failed: ${metrics.length - successfulAttempts.length}`);
    console.log(`  Min: ${min}ms`);
    console.log(`  Max: ${max}ms`);
    console.log(`  Average: ${avg.toFixed(2)}ms`);
    console.log(`  p50 (Median): ${p50}ms`);
    console.log(`  p95: ${p95}ms`);

    console.log("\n✅ Success Criteria:");
    const p50Pass = p50 <= 1500;
    const p95Pass = p95 <= 2000;
    const tableRendersPass = successfulAttempts.every((m) => m.employeeCount > 0);
    const columnsVisiblePass = allColumnsVisible;
    
    console.log(`  ${p50Pass ? "✓" : "✗"} p50 ≤ 1500ms: ${p50}ms ${p50Pass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${p95Pass ? "✓" : "✗"} p95 ≤ 2000ms: ${p95}ms ${p95Pass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${tableRendersPass ? "✓" : "✗"} Employee table renders completely ${tableRendersPass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${columnsVisiblePass ? "✓" : "✗"} All columns (Name, Role, Actions) visible ${columnsVisiblePass ? "(PASS)" : "(FAIL)"}`);

    const allPassed = p50Pass && p95Pass && tableRendersPass && columnsVisiblePass;
    console.log(`\n${allPassed ? "🎉 ALL CRITERIA PASSED" : "❌ SOME CRITERIA FAILED"}`);
    console.log("=".repeat(80) + "\n");

    // Export results to JSON file
    const results = {
      testCase: "PERF-PROFILE-01",
      description: "Navigate to Employees tab in Settings - measure page load and employee list render time",
      timestamp: new Date().toISOString(),
      metrics: {
        totalAttempts: metrics.length,
        successfulAttempts: successfulAttempts.length,
        successRate: successRate,
        durations: {
          min,
          max,
          avg,
          p50,
          p95,
        },
      },
      successCriteria: {
        p50Threshold: 1500,
        p50Actual: p50,
        p50Pass,
        p95Threshold: 2000,
        p95Actual: p95,
        p95Pass,
        tableRendersPass,
        columnsVisiblePass,
        overallPass: allPassed,
      },
      individualAttempts: metrics,
    };

    const fs = require("fs");
    const path = require("path");
    const resultsDir = path.join(process.cwd(), "test-results");
    
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(resultsDir, "PERF-PROFILE-01-results.json"),
      JSON.stringify(results, null, 2)
    );

    console.log(`📄 Results exported to: test-results/PERF-PROFILE-01-results.json\n`);

    // Assert final results
    expect(p50, `p50 should be ≤ 1500ms, got ${p50}ms`).toBeLessThanOrEqual(1500);
    expect(p95, `p95 should be ≤ 2000ms, got ${p95}ms`).toBeLessThanOrEqual(2000);
    expect(tableRendersPass, "Employee table should render completely").toBe(true);
    expect(columnsVisiblePass, "All columns (Name, Role, Actions) should be visible").toBe(true);
  });
});
