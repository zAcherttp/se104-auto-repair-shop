import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

/**
 * PERF-LOGIN-07: Login page memory baseline
 * 
 * Test Case: Detect memory leaks and measure heap usage
 * 
 * Success Criteria:
 * - Average JS heap ≤ 8MB
 * - Max heap increase ≤ 10% between reloads
 * - No DOM node leaks detected
 * 
 * Dependency: PERF-LOGIN-03
 */

interface MemoryMetrics {
  attempt: number;
  heapSize: number;
  heapLimit: number;
  domNodes: number;
  jsEventListeners: number;
}

test.describe("PERF-LOGIN-07: Login Page Memory Baseline", () => {
  const TEST_ITERATIONS = 5;
  
  // Store performance metrics
  const metrics: MemoryMetrics[] = [];

  for (let i = 1; i <= TEST_ITERATIONS; i++) {
    test(`Attempt ${i}/${TEST_ITERATIONS}: Memory measurement`, async ({ page, context }) => {
      console.log(`\n⏱️ Attempt ${i}: Measuring memory usage...`);
      
      // Clear everything
      await context.clearCookies();
      
      // Navigate to login page
      await page.goto("/login", { waitUntil: "networkidle" });
      
      // Clear storage after navigation to avoid SecurityError
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      // Wait for page to be idle
      await page.waitForTimeout(2000);
      
      try {
        // Get memory metrics via Chrome DevTools Protocol
        const client = await context.newCDPSession(page);
        
        // Collect garbage to get accurate baseline
        await client.send("HeapProfiler.collectGarbage");
        
        // Get heap statistics
        const heapSnapshot = await client.send("Runtime.getHeapUsage");
        
        // Get performance.memory (if available)
        const memoryInfo = await page.evaluate(() => {
          if ('memory' in performance) {
            const mem = (performance as any).memory;
            return {
              usedJSHeapSize: mem.usedJSHeapSize,
              totalJSHeapSize: mem.totalJSHeapSize,
              jsHeapSizeLimit: mem.jsHeapSizeLimit,
            };
          }
          return null;
        });
        
        // Count DOM nodes
        const domNodeCount = await page.evaluate(() => {
          return document.querySelectorAll("*").length;
        });
        
        // Count event listeners (approximate)
        const eventListenerCount = await page.evaluate(() => {
          return (window as any).getEventListeners 
            ? Object.keys((window as any).getEventListeners(document)).length 
            : 0;
        });
        
        const heapSize = memoryInfo ? memoryInfo.usedJSHeapSize : heapSnapshot.usedSize;
        const heapLimit = memoryInfo ? memoryInfo.jsHeapSizeLimit : heapSnapshot.totalSize;
        
        console.log(`✅ Attempt ${i}: Memory captured`);
        console.log(`   JS Heap Used: ${(heapSize / 1024 / 1024).toFixed(2)}MB`);
        console.log(`   JS Heap Limit: ${(heapLimit / 1024 / 1024).toFixed(2)}MB`);
        console.log(`   DOM Nodes: ${domNodeCount}`);
        console.log(`   Event Listeners: ${eventListenerCount}`);
        
        // Record metrics
        metrics.push({
          attempt: i,
          heapSize,
          heapLimit,
          domNodes: domNodeCount,
          jsEventListeners: eventListenerCount,
        });
        
        console.log(`✓ Attempt ${i}: Metrics captured successfully`);
        
        // Take screenshot for first attempt
        if (i === 1) {
          await page.screenshot({ path: `test-results/PERF-LOGIN-07-memory-${i}.png` });
        }
      } catch (error) {
        console.log(`✗ Attempt ${i}: Failed to capture memory metrics`);
        console.log(`   Error: ${error}`);
        
        // Try to take screenshot only if page is still open
        try {
          if (!page.isClosed()) {
            await page.screenshot({ path: `test-results/PERF-LOGIN-07-failure-${i}.png`, fullPage: true });
          }
        } catch (screenshotError) {
          console.log(`⚠️ Could not take failure screenshot: ${screenshotError}`);
        }
        
        throw error;
      }
    });
  }

  test.afterAll(async () => {
    if (metrics.length === 0) {
      console.log("\n❌ No successful attempts to analyze!");
      return;
    }

    // Calculate statistics
    const heapSizes = metrics.map((m) => m.heapSize);
    const avgHeap = heapSizes.reduce((sum, val) => sum + val, 0) / heapSizes.length;
    const maxHeap = Math.max(...heapSizes);
    const minHeap = Math.min(...heapSizes);
    
    // Calculate max increase between consecutive reloads
    let maxIncrease = 0;
    for (let i = 1; i < metrics.length; i++) {
      const increase = ((metrics[i].heapSize - metrics[i - 1].heapSize) / metrics[i - 1].heapSize) * 100;
      if (increase > maxIncrease) {
        maxIncrease = increase;
      }
    }
    
    // Check for DOM node leaks (significant increase over iterations)
    const domNodeCounts = metrics.map((m) => m.domNodes);
    const domNodeIncrease = domNodeCounts[domNodeCounts.length - 1] - domNodeCounts[0];
    const domNodeIncreasePercent = (domNodeIncrease / domNodeCounts[0]) * 100;
    const noDomLeaks = domNodeIncreasePercent <= 10; // Allow up to 10% variance

    // Print detailed results
    console.log("\n" + "=".repeat(80));
    console.log("PERF-LOGIN-07: Memory Baseline Test Results");
    console.log("=".repeat(80));
    console.log("\n📊 Individual Attempts:");
    metrics.forEach((m) => {
      console.log(`  Attempt ${m.attempt}:`);
      console.log(`    JS Heap: ${(m.heapSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`    DOM Nodes: ${m.domNodes}`);
      console.log(`    Event Listeners: ${m.jsEventListeners}`);
    });

    console.log("\n📈 Statistical Analysis:");
    console.log(`  Average JS Heap: ${(avgHeap / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Min JS Heap: ${(minHeap / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Max JS Heap: ${(maxHeap / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Max Heap Increase: ${maxIncrease.toFixed(2)}%`);
    console.log(`  DOM Node Change: ${domNodeIncrease} (${domNodeIncreasePercent.toFixed(1)}%)`);

    console.log("\n✅ Success Criteria:");
    const avgHeapPass = avgHeap <= 8 * 1024 * 1024; // 8MB
    const maxIncreasePass = maxIncrease <= 10;
    const noDomLeaksPass = noDomLeaks;
    
    console.log(`  ${avgHeapPass ? "✓" : "✗"} Average JS heap ≤ 8MB: ${(avgHeap / 1024 / 1024).toFixed(2)}MB ${avgHeapPass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${maxIncreasePass ? "✓" : "✗"} Max heap increase ≤ 10%: ${maxIncrease.toFixed(2)}% ${maxIncreasePass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${noDomLeaksPass ? "✓" : "✗"} No DOM node leaks detected ${noDomLeaksPass ? "(PASS)" : "(FAIL)"}`);

    const allPassed = avgHeapPass && maxIncreasePass && noDomLeaksPass;
    console.log(`\n${allPassed ? "🎉 ALL CRITERIA PASSED" : "❌ SOME CRITERIA FAILED"}`);
    console.log("=".repeat(80) + "\n");

    // Export results to JSON file
    const results = {
      testCase: "PERF-LOGIN-07",
      description: "Login page memory baseline measurement",
      timestamp: new Date().toISOString(),
      metrics: {
        totalAttempts: metrics.length,
        avgHeap: avgHeap,
        minHeap: minHeap,
        maxHeap: maxHeap,
        maxIncrease: maxIncrease,
        domNodeChange: domNodeIncrease,
        domNodeIncreasePercent: domNodeIncreasePercent,
      },
      successCriteria: {
        avgHeapThreshold: 8 * 1024 * 1024,
        avgHeapActual: avgHeap,
        avgHeapPass,
        maxIncreaseThreshold: 10,
        maxIncreaseActual: maxIncrease,
        maxIncreasePass,
        noDomLeaksPass,
        overallPass: allPassed,
      },
      individualAttempts: metrics,
    };

    const resultsDir = path.join(process.cwd(), "test-results");
    
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(resultsDir, "PERF-LOGIN-07-results.json"),
      JSON.stringify(results, null, 2)
    );

    // Assert final results
    expect(avgHeap, `Average JS heap should be ≤ 8MB, got ${(avgHeap / 1024 / 1024).toFixed(2)}MB`).toBeLessThanOrEqual(8 * 1024 * 1024);
    expect(maxIncrease, `Max heap increase should be ≤ 10%, got ${maxIncrease.toFixed(2)}%`).toBeLessThanOrEqual(10);
    expect(noDomLeaks, "No DOM node leaks should be detected").toBe(true);
  });
});
