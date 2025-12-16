import { test, expect } from "@playwright/test";

/**
 * PERF-LOGIN-01: Login form submission timing with valid credentials
 * 
 * Test Case: Measure end-to-end latency from form submit to successful redirect
 * 
 * Success Criteria:
 * - p50 ≤ 2000ms
 * - p95 ≤ 3000ms
 * - Success rate: 100%
 * - All 10 attempts redirect to /reception
 * 
 * Note: Includes Supabase auth latency
 */

interface PerformanceMetrics {
  attempt: number;
  duration: number;
  success: boolean;
  error?: string;
}

test.describe("PERF-LOGIN-01: Login Form Performance", () => {
  const TEST_ITERATIONS = 10;
  const TEST_EMAIL = "saladegg24@gmail.com";
  const TEST_PASSWORD = "123456";
  
  // Store performance metrics
  const metrics: PerformanceMetrics[] = [];

  test.beforeEach(async ({ page, context }) => {
    // Clear all cookies and storage before each test to ensure clean state
    await context.clearCookies();
    await context.clearPermissions();
    
    // Navigate to login page
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");
  });

  for (let i = 1; i <= TEST_ITERATIONS; i++) {
    test(`Attempt ${i}/${TEST_ITERATIONS}: Login performance measurement`, async ({ page, context }) => {
      // Double-check we're logged out
      await context.clearCookies();
      
      // Reload the login page to ensure fresh state
      await page.goto("/login", { waitUntil: "domcontentloaded" });
      
      // Clear storage after navigation to avoid SecurityError
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      await page.waitForLoadState("networkidle");

      // Wait for form to be ready with explicit timeout
      try {
        await page.waitForSelector('input[name="email"]', { state: "visible", timeout: 10000 });
        await page.waitForSelector('input[name="password"]', { state: "visible", timeout: 10000 });
      } catch (error) {
        console.log(`⚠️ Attempt ${i}: Form not visible, current URL: ${page.url()}`);
        await page.screenshot({ path: `test-results/form-not-visible-${i}.png` });
        throw new Error(`Form elements not found: ${error}`);
      }
      
      // Fill email field using name attribute
      const emailInput = page.locator('input[name="email"]');
      await emailInput.clear();
      await emailInput.fill(TEST_EMAIL);
      
      // Verify email was filled
      const emailValue = await emailInput.inputValue();
      console.log(`🔍 Attempt ${i}: Email filled: ${emailValue}`);
      
      // Fill password field using name attribute
      const passwordInput = page.locator('input[name="password"]');
      await passwordInput.clear();
      await passwordInput.fill(TEST_PASSWORD);

      // Find submit button with multiple strategies
      let submitButton = page.locator('button[type="submit"]').first();
      
      // Verify button is visible and enabled
      const isVisible = await submitButton.isVisible();
      const isEnabled = await submitButton.isEnabled();
      console.log(`🔍 Attempt ${i}: Submit button - Visible: ${isVisible}, Enabled: ${isEnabled}`);
      
      if (!isVisible || !isEnabled) {
        await page.screenshot({ path: `test-results/button-issue-${i}.png` });
        throw new Error(`Submit button not ready - Visible: ${isVisible}, Enabled: ${isEnabled}`);
      }

      // Start timing
      const startTime = Date.now();
      console.log(`⏱️ Attempt ${i}: Starting timer at ${startTime}`);

      try {
        // Set up navigation promise before clicking
        const navigationPromise = page.waitForURL((url) => {
          const urlStr = url.toString();
          return urlStr.includes("/reception") || urlStr.includes("/home");
        }, { timeout: 30000 });
        
        // Click submit button
        await submitButton.click();
        console.log(`🖱️ Attempt ${i}: Button clicked`);
        
        // Wait for navigation
        await navigationPromise;

        // End timing
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Verify we successfully navigated
        const currentUrl = page.url();
        console.log(`✅ Attempt ${i}: Navigated to ${currentUrl} in ${duration}ms`);
        
        if (currentUrl.includes("/reception") || currentUrl.includes("/home")) {
          // Record metrics
          metrics.push({
            attempt: i,
            duration,
            success: true,
          });

          console.log(`✓ Attempt ${i}: ${duration}ms - Success`);
        } else {
          throw new Error(`Unexpected URL after login: ${currentUrl}`);
        }
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Take screenshot on failure
        await page.screenshot({ path: `test-results/login-failure-${i}.png`, fullPage: true });
        console.log(`📸 Failure screenshot saved: login-failure-${i}.png`);
        
        // Try to get any error messages from the page
        const pageContent = await page.content();
        const hasErrorToast = pageContent.includes('role="status"') || pageContent.includes('toast');
        console.log(`🔍 Page has error indicators: ${hasErrorToast}`);
        
        metrics.push({
          attempt: i,
          duration,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });

        console.log(`✗ Attempt ${i}: ${duration}ms - Failed`);
        console.log(`   Error: ${error}`);
        console.log(`   Current URL: ${page.url()}`);
        
        throw error;
      }
    });
  }

  test.afterAll(async () => {
    // Calculate statistics
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

    // Print detailed results
    console.log("\n" + "=".repeat(80));
    console.log("PERF-LOGIN-01: Performance Test Results");
    console.log("=".repeat(80));
    console.log("\n📊 Individual Attempts:");
    metrics.forEach((m) => {
      const status = m.success ? "✓" : "✗";
      const errorMsg = m.error ? ` (${m.error})` : "";
      console.log(`  ${status} Attempt ${m.attempt}: ${m.duration}ms${errorMsg}`);
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
    const p50Pass = p50 <= 2000;
    const p95Pass = p95 <= 3000;
    const successRatePass = successRate === 100;
    
    console.log(`  ${p50Pass ? "✓" : "✗"} p50 ≤ 2000ms: ${p50}ms ${p50Pass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${p95Pass ? "✓" : "✗"} p95 ≤ 3000ms: ${p95}ms ${p95Pass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${successRatePass ? "✓" : "✗"} Success rate: ${successRate.toFixed(1)}% ${successRatePass ? "(PASS)" : "(FAIL)"}`);

    const allPassed = p50Pass && p95Pass && successRatePass;
    console.log(`\n${allPassed ? "🎉 ALL CRITERIA PASSED" : "❌ SOME CRITERIA FAILED"}`);
    console.log("=".repeat(80) + "\n");

    // Export results to JSON file
    const results = {
      testCase: "PERF-LOGIN-01",
      description: "Login form submission timing with valid credentials",
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
        p50Threshold: 2000,
        p50Actual: p50,
        p50Pass,
        p95Threshold: 3000,
        p95Actual: p95,
        p95Pass,
        successRateThreshold: 100,
        successRateActual: successRate,
        successRatePass,
        overallPass: allPassed,
      },
      individualAttempts: metrics,
    };

    // Write to file using Playwright's built-in file system
    const fs = require("fs");
    const path = require("path");
    const resultsDir = path.join(process.cwd(), "test-results");
    
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(resultsDir, "PERF-LOGIN-01-results.json"),
      JSON.stringify(results, null, 2)
    );

    // Assert final results
    expect(p50, `p50 should be ≤ 2000ms, got ${p50}ms`).toBeLessThanOrEqual(2000);
    expect(p95, `p95 should be ≤ 3000ms, got ${p95}ms`).toBeLessThanOrEqual(3000);
    expect(successRate, `Success rate should be 100%, got ${successRate.toFixed(1)}%`).toBe(100);
  });
});
