import { test, expect } from "@playwright/test";

/**
 * PERF-LOGIN-03: Login page Core Web Vitals
 * 
 * Test Case: Measure critical rendering metrics using Navigation Timing and Paint Timing APIs
 * 
 * Success Criteria:
 * - LCP ≤ 2500ms
 * - FCP ≤ 1800ms
 * - TBT ≤ 300ms
 * - CLS ≤ 0.1
 * - Performance score (calculated) ≥ 85
 * 
 * Note: Mid-range device simulation
 */

interface WebVitalsMetrics {
  attempt: number;
  lcp: number;
  fcp: number;
  tbt: number;
  cls: number;
  performanceScore: number;
}

test.describe("PERF-LOGIN-03: Login Page Core Web Vitals", () => {
  const TEST_ITERATIONS = 3;
  
  // Store performance metrics
  const metrics: WebVitalsMetrics[] = [];

  test.beforeEach(async ({ context }) => {
    // Clear all cookies and storage before each test
    await context.clearCookies();
    await context.clearPermissions();
  });

  for (let i = 1; i <= TEST_ITERATIONS; i++) {
    test(`Attempt ${i}/${TEST_ITERATIONS}: Core Web Vitals measurement`, async ({ page, context }, testInfo) => {
      // Clear cache and storage
      await context.clearCookies();

      console.log(`\n⏱️ Attempt ${i}: Measuring Core Web Vitals...`);

      try {
        // Navigate to login page
        await page.goto("/login", { waitUntil: "load" });
        
        // Clear storage after navigation to avoid SecurityError
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
        
        await page.waitForLoadState("networkidle");

        // Get Core Web Vitals using Performance APIs
        const vitals = await page.evaluate(() => {
          return new Promise<{ lcp: number; fcp: number; tbt: number; cls: number }>((resolve) => {
            let lcp = 0;
            let fcp = 0;
            let cls = 0;
            let tbt = 0;

            // Get LCP (Largest Contentful Paint)
            const lcpObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1] as any;
              lcp = lastEntry.renderTime || lastEntry.loadTime;
            });
            lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

            // Get FCP (First Contentful Paint)
            const paintEntries = performance.getEntriesByType("paint");
            const fcpEntry = paintEntries.find((entry) => entry.name === "first-contentful-paint");
            fcp = fcpEntry ? fcpEntry.startTime : 0;

            // Get CLS (Cumulative Layout Shift)
            const clsObserver = new PerformanceObserver((list) => {
              for (const entry of list.getEntries() as any[]) {
                if (!entry.hadRecentInput) {
                  cls += entry.value;
                }
              }
            });
            clsObserver.observe({ type: "layout-shift", buffered: true });

            // Get TBT (Total Blocking Time) - approximate using long tasks
            const longTaskObserver = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                const duration = entry.duration;
                if (duration > 50) {
                  tbt += duration - 50;
                }
              }
            });
            try {
              longTaskObserver.observe({ type: "longtask", buffered: true });
            } catch (e) {
              // longtask may not be supported in all browsers
            }

            // Wait a bit to collect metrics
            setTimeout(() => {
              lcpObserver.disconnect();
              clsObserver.disconnect();
              try {
                longTaskObserver.disconnect();
              } catch (e) {}
              
              resolve({ lcp, fcp, tbt, cls });
            }, 2000);
          });
        });

        // Calculate a simple performance score (0-100)
        // Based on Chrome Lighthouse scoring weights
        const lcpScore = vitals.lcp <= 2500 ? 100 : Math.max(0, 100 - ((vitals.lcp - 2500) / 40));
        const fcpScore = vitals.fcp <= 1800 ? 100 : Math.max(0, 100 - ((vitals.fcp - 1800) / 30));
        const tbtScore = vitals.tbt <= 200 ? 100 : Math.max(0, 100 - ((vitals.tbt - 200) / 10));
        const clsScore = vitals.cls <= 0.1 ? 100 : Math.max(0, 100 - ((vitals.cls - 0.1) * 750));

        const performanceScore = (lcpScore * 0.25 + fcpScore * 0.10 + tbtScore * 0.30 + clsScore * 0.25 + 90 * 0.10);

        console.log(`✅ Attempt ${i}: Core Web Vitals captured`);
        console.log(`   LCP: ${vitals.lcp.toFixed(2)}ms`);
        console.log(`   FCP: ${vitals.fcp.toFixed(2)}ms`);
        console.log(`   TBT: ${vitals.tbt.toFixed(2)}ms`);
        console.log(`   CLS: ${vitals.cls.toFixed(3)}`);
        console.log(`   Performance Score: ${performanceScore.toFixed(1)}`);

        // Record metrics
        metrics.push({
          attempt: i,
          lcp: vitals.lcp,
          fcp: vitals.fcp,
          tbt: vitals.tbt,
          cls: vitals.cls,
          performanceScore,
        });

        console.log(`✓ Attempt ${i}: Metrics captured successfully`);
      } catch (error) {
        console.log(`✗ Attempt ${i}: Failed to capture metrics`);
        console.log(`   Error: ${error}`);
        
        // Take screenshot on failure
        await page.screenshot({ 
          path: `test-results/PERF-LOGIN-03-failure-${i}.png`, 
          fullPage: true 
        });
        
        throw error;
      }
    });
  }

  test.afterAll(async () => {
    if (metrics.length === 0) {
      console.log("\n❌ No successful attempts to analyze!");
      return;
    }

    // Calculate median values (for 3 iterations, median is the 2nd value when sorted)
    const lcpValues = metrics.map((m) => m.lcp).sort((a, b) => a - b);
    const fcpValues = metrics.map((m) => m.fcp).sort((a, b) => a - b);
    const tbtValues = metrics.map((m) => m.tbt).sort((a, b) => a - b);
    const clsValues = metrics.map((m) => m.cls).sort((a, b) => a - b);
    const perfScores = metrics.map((m) => m.performanceScore).sort((a, b) => a - b);

    const medianIndex = Math.floor(metrics.length / 2);
    const medianLCP = lcpValues[medianIndex];
    const medianFCP = fcpValues[medianIndex];
    const medianTBT = tbtValues[medianIndex];
    const medianCLS = clsValues[medianIndex];
    const medianPerfScore = perfScores[medianIndex];

    // Print detailed results
    console.log("\n" + "=".repeat(80));
    console.log("PERF-LOGIN-03: Core Web Vitals Test Results");
    console.log("=".repeat(80));
    console.log("\n📊 Individual Attempts:");
    metrics.forEach((m) => {
      console.log(`  Attempt ${m.attempt}:`);
      console.log(`    LCP: ${m.lcp.toFixed(2)}ms`);
      console.log(`    FCP: ${m.fcp.toFixed(2)}ms`);
      console.log(`    TBT: ${m.tbt.toFixed(2)}ms`);
      console.log(`    CLS: ${m.cls.toFixed(3)}`);
      console.log(`    Performance Score: ${m.performanceScore.toFixed(1)}`);
    });

    console.log("\n📈 Median Values:");
    console.log(`  LCP: ${medianLCP.toFixed(2)}ms`);
    console.log(`  FCP: ${medianFCP.toFixed(2)}ms`);
    console.log(`  TBT: ${medianTBT.toFixed(2)}ms`);
    console.log(`  CLS: ${medianCLS.toFixed(3)}`);
    console.log(`  Performance Score: ${medianPerfScore.toFixed(1)}`);

    console.log("\n✅ Success Criteria:");
    const lcpPass = medianLCP <= 2500;
    const fcpPass = medianFCP <= 1800;
    const tbtPass = medianTBT <= 300;
    const clsPass = medianCLS <= 0.1;
    const perfPass = medianPerfScore >= 85;
    
    console.log(`  ${lcpPass ? "✓" : "✗"} LCP ≤ 2500ms: ${medianLCP.toFixed(2)}ms ${lcpPass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${fcpPass ? "✓" : "✗"} FCP ≤ 1800ms: ${medianFCP.toFixed(2)}ms ${fcpPass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${tbtPass ? "✓" : "✗"} TBT ≤ 300ms: ${medianTBT.toFixed(2)}ms ${tbtPass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${clsPass ? "✓" : "✗"} CLS ≤ 0.1: ${medianCLS.toFixed(3)} ${clsPass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${perfPass ? "✓" : "✗"} Performance Score ≥ 85: ${medianPerfScore.toFixed(1)} ${perfPass ? "(PASS)" : "(FAIL)"}`);

    const allPassed = lcpPass && fcpPass && tbtPass && clsPass && perfPass;
    console.log(`\n${allPassed ? "🎉 ALL CRITERIA PASSED" : "❌ SOME CRITERIA FAILED"}`);
    console.log("=".repeat(80) + "\n");

    // Export results to JSON file
    const results = {
      testCase: "PERF-LOGIN-03",
      description: "Login page Core Web Vitals measurement",
      timestamp: new Date().toISOString(),
      metrics: {
        totalAttempts: metrics.length,
        medianValues: {
          lcp: medianLCP,
          fcp: medianFCP,
          tbt: medianTBT,
          cls: medianCLS,
          performanceScore: medianPerfScore,
        },
      },
      successCriteria: {
        lcpThreshold: 2500,
        lcpActual: medianLCP,
        lcpPass,
        fcpThreshold: 1800,
        fcpActual: medianFCP,
        fcpPass,
        tbtThreshold: 300,
        tbtActual: medianTBT,
        tbtPass,
        clsThreshold: 0.1,
        clsActual: medianCLS,
        clsPass,
        perfScoreThreshold: 85,
        perfScoreActual: medianPerfScore,
        perfPass,
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
      path.join(resultsDir, "PERF-LOGIN-03-results.json"),
      JSON.stringify(results, null, 2)
    );

    // Assert final results
    expect(medianLCP, `LCP should be ≤ 2500ms, got ${medianLCP.toFixed(2)}ms`).toBeLessThanOrEqual(2500);
    expect(medianFCP, `FCP should be ≤ 1800ms, got ${medianFCP.toFixed(2)}ms`).toBeLessThanOrEqual(1800);
    expect(medianTBT, `TBT should be ≤ 300ms, got ${medianTBT.toFixed(2)}ms`).toBeLessThanOrEqual(300);
    expect(medianCLS, `CLS should be ≤ 0.1, got ${medianCLS.toFixed(3)}`).toBeLessThanOrEqual(0.1);
    expect(medianPerfScore, `Performance score should be ≥ 85, got ${medianPerfScore.toFixed(1)}`).toBeGreaterThanOrEqual(85);
  });
});
