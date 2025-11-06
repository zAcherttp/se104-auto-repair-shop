import { test, expect } from "@playwright/test";

/**
 * PERF-LOGIN-04: Login page initial load time
 * 
 * Test Case: Measure page load performance from empty cache
 * 
 * Success Criteria:
 * - p50 ≤ 1500ms
 * - p95 ≤ 2000ms
 * - All resources loaded without errors
 * 
 * Note: Cold page load from empty cache using Navigation Timing API
 */

interface LoadMetrics {
  attempt: number;
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  resourceErrors: number;
  success: boolean;
  error?: string;
}

test.describe("PERF-LOGIN-04: Login Page Initial Load Time", () => {
  const TEST_ITERATIONS = 5;
  
  // Store performance metrics
  const metrics: LoadMetrics[] = [];

  test.beforeEach(async ({ context }) => {
    // Clear all cookies and storage before each test
    await context.clearCookies();
    await context.clearPermissions();
  });

  for (let i = 1; i <= TEST_ITERATIONS; i++) {
    test(`Attempt ${i}/${TEST_ITERATIONS}: Cold page load measurement`, async ({ page, context }) => {
      // Clear browser cache and cookies for cold load
      await context.clearCookies();

      // Clear browser cache
      const client = await context.newCDPSession(page);
      await client.send("Network.clearBrowserCache");
      await client.send("Network.clearBrowserCookies");

      console.log(`\n⏱️ Attempt ${i}: Starting cold page load...`);

      try {
        // Track resource errors
        let resourceErrors = 0;
        page.on("pageerror", (error) => {
          console.log(`   ⚠️ Page error: ${error.message}`);
        });
        page.on("requestfailed", (request) => {
          console.log(`   ⚠️ Request failed: ${request.url()}`);
          resourceErrors++;
        });

        // Navigate and wait for load event
        const startTime = Date.now();
        await page.goto("/login", { waitUntil: "load", timeout: 30000 });
        
        // Clear storage after navigation to avoid SecurityError
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
        
        const endTime = Date.now();
        
        // Get Navigation Timing API metrics
        const performanceTiming = await page.evaluate(() => {
          const perfData = window.performance.timing;
          const navigationStart = perfData.navigationStart;
          
          return {
            loadEventEnd: perfData.loadEventEnd - navigationStart,
            domContentLoadedEventEnd: perfData.domContentLoadedEventEnd - navigationStart,
            responseEnd: perfData.responseEnd - navigationStart,
          };
        });

        // Get Paint Timing API metrics
        const paintTiming = await page.evaluate(() => {
          const paintEntries = performance.getEntriesByType("paint");
          const firstPaint = paintEntries.find((entry) => entry.name === "first-paint");
          return firstPaint ? firstPaint.startTime : 0;
        });

        const loadTime = endTime - startTime;
        
        console.log(`✅ Attempt ${i}: Page loaded in ${loadTime}ms`);
        console.log(`   Navigation Timing API loadEventEnd: ${performanceTiming.loadEventEnd}ms`);
        console.log(`   DOM Content Loaded: ${performanceTiming.domContentLoadedEventEnd}ms`);
        console.log(`   First Paint: ${paintTiming.toFixed(2)}ms`);
        console.log(`   Resource Errors: ${resourceErrors}`);

        // Record metrics
        metrics.push({
          attempt: i,
          loadTime: performanceTiming.loadEventEnd,
          domContentLoaded: performanceTiming.domContentLoadedEventEnd,
          firstPaint: paintTiming,
          resourceErrors,
          success: true,
        });

        console.log(`✓ Attempt ${i}: Metrics captured successfully`);

        // Take screenshot for first attempt
        if (i === 1) {
          await page.screenshot({ path: `test-results/PERF-LOGIN-04-loaded-${i}.png` });
          console.log(`📸 Screenshot saved: PERF-LOGIN-04-loaded-${i}.png`);
        }
      } catch (error) {
        const endTime = Date.now();
        const loadTime = endTime - 0; // Fallback
        
        console.log(`✗ Attempt ${i}: Failed to load page`);
        console.log(`   Error: ${error}`);
        
        // Take screenshot on failure
        await page.screenshot({ 
          path: `test-results/PERF-LOGIN-04-failure-${i}.png`, 
          fullPage: true 
        });
        
        metrics.push({
          attempt: i,
          loadTime,
          domContentLoaded: 0,
          firstPaint: 0,
          resourceErrors: 0,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
        
        throw error;
      }
    });
  }

  test.afterAll(async () => {
    // Calculate statistics
    const successfulAttempts = metrics.filter((m) => m.success);
    const loadTimes = successfulAttempts.map((m) => m.loadTime).sort((a, b) => a - b);
    
    if (loadTimes.length === 0) {
      console.log("\n❌ No successful attempts to analyze!");
      return;
    }

    const successRate = (successfulAttempts.length / metrics.length) * 100;
    const p50Index = Math.floor(loadTimes.length * 0.5);
    const p95Index = Math.floor(loadTimes.length * 0.95);
    
    const p50 = loadTimes[p50Index];
    const p95 = loadTimes[p95Index];
    const min = loadTimes[0];
    const max = loadTimes[loadTimes.length - 1];
    const avg = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;

    const totalResourceErrors = successfulAttempts.reduce((sum, m) => sum + m.resourceErrors, 0);
    const noResourceErrors = totalResourceErrors === 0;

    // Print detailed results
    console.log("\n" + "=".repeat(80));
    console.log("PERF-LOGIN-04: Initial Load Time Test Results");
    console.log("=".repeat(80));
    console.log("\n📊 Individual Attempts:");
    metrics.forEach((m) => {
      const status = m.success ? "✓" : "✗";
      const errorMsg = m.error ? ` (${m.error})` : "";
      console.log(`  ${status} Attempt ${m.attempt}: ${m.loadTime.toFixed(2)}ms - Resource Errors: ${m.resourceErrors}${errorMsg}`);
    });

    console.log("\n📈 Statistical Analysis:");
    console.log(`  Total Attempts: ${metrics.length}`);
    console.log(`  Successful: ${successfulAttempts.length} (${successRate.toFixed(1)}%)`);
    console.log(`  Failed: ${metrics.length - successfulAttempts.length}`);
    console.log(`  Min: ${min.toFixed(2)}ms`);
    console.log(`  Max: ${max.toFixed(2)}ms`);
    console.log(`  Average: ${avg.toFixed(2)}ms`);
    console.log(`  p50 (Median): ${p50.toFixed(2)}ms`);
    console.log(`  p95: ${p95.toFixed(2)}ms`);
    console.log(`  Total Resource Errors: ${totalResourceErrors}`);

    console.log("\n✅ Success Criteria:");
    const p50Pass = p50 <= 1500;
    const p95Pass = p95 <= 2000;
    const noErrorsPass = noResourceErrors;
    
    console.log(`  ${p50Pass ? "✓" : "✗"} p50 ≤ 1500ms: ${p50.toFixed(2)}ms ${p50Pass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${p95Pass ? "✓" : "✗"} p95 ≤ 2000ms: ${p95.toFixed(2)}ms ${p95Pass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${noErrorsPass ? "✓" : "✗"} All resources loaded without errors ${noErrorsPass ? "(PASS)" : "(FAIL)"}`);

    const allPassed = p50Pass && p95Pass && noErrorsPass;
    console.log(`\n${allPassed ? "🎉 ALL CRITERIA PASSED" : "❌ SOME CRITERIA FAILED"}`);
    console.log("=".repeat(80) + "\n");

    // Export results to JSON file
    const results = {
      testCase: "PERF-LOGIN-04",
      description: "Login page initial load time measurement",
      timestamp: new Date().toISOString(),
      metrics: {
        totalAttempts: metrics.length,
        successfulAttempts: successfulAttempts.length,
        successRate: successRate,
        loadTimes: {
          min,
          max,
          avg,
          p50,
          p95,
        },
        totalResourceErrors,
      },
      successCriteria: {
        p50Threshold: 1500,
        p50Actual: p50,
        p50Pass,
        p95Threshold: 2000,
        p95Actual: p95,
        p95Pass,
        noErrorsPass,
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
      path.join(resultsDir, "PERF-LOGIN-04-results.json"),
      JSON.stringify(results, null, 2)
    );

    // Assert final results
    expect(p50, `p50 should be ≤ 1500ms, got ${p50.toFixed(2)}ms`).toBeLessThanOrEqual(1500);
    expect(p95, `p95 should be ≤ 2000ms, got ${p95.toFixed(2)}ms`).toBeLessThanOrEqual(2000);
    expect(noResourceErrors, "All resources should load without errors").toBe(true);
  });
});
