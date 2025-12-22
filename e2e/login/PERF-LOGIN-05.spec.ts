import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

/**
 * PERF-LOGIN-05: Login page JavaScript bundle size
 * 
 * Test Case: Measure network transfer size of JavaScript resources
 * 
 * Success Criteria:
 * - Total JS transfer size ≤ 1MB (gzipped)
 * - Total JS parsed size ≤ 1MB (uncompressed)
 * - All JS served with Content-Encoding: gzip
 * 
 * Note: Bundle optimization check using Playwright CDP
 */

interface BundleMetrics {
  url: string;
  transferSize: number;
  resourceSize: number;
  compressed: boolean;
}

test.describe("PERF-LOGIN-05: JavaScript Bundle Size", () => {
  test("Measure JS bundle size and compression", async ({ page, context }) => {
    // Clear cache
    await context.clearCookies();

    // Clear browser cache
    const client = await context.newCDPSession(page);
    await client.send("Network.clearBrowserCache");
    await client.send("Network.clearBrowserCookies");

    console.log("\n⏱️ Starting JavaScript bundle size measurement...");

    const jsResources: BundleMetrics[] = [];

    // Listen to network responses
    page.on("response", async (response) => {
      const url = response.url();
      const contentType = response.headers()["content-type"] || "";
      
      // Filter for JavaScript resources
      if (contentType.includes("javascript") || contentType.includes("application/javascript") || url.endsWith(".js")) {
        try {
          const contentEncoding = response.headers()["content-encoding"] || "";
          const compressed = contentEncoding.includes("gzip") || contentEncoding.includes("br");
          
          // Get resource timing from Performance API
          const timing = await page.evaluate((resourceUrl) => {
            const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
            const entry = entries.find((e) => e.name === resourceUrl);
            return entry ? {
              transferSize: entry.transferSize,
              encodedBodySize: entry.encodedBodySize,
              decodedBodySize: entry.decodedBodySize,
            } : null;
          }, url);

          if (timing) {
            jsResources.push({
              url,
              transferSize: timing.transferSize,
              resourceSize: timing.decodedBodySize,
              compressed,
            });

            console.log(`📦 JS Resource: ${url.split("/").pop()}`);
            console.log(`   Transfer Size: ${(timing.transferSize / 1024).toFixed(2)}KB`);
            console.log(`   Uncompressed: ${(timing.decodedBodySize / 1024).toFixed(2)}KB`);
            console.log(`   Compressed: ${compressed ? "✓" : "✗"}`);
          }
        } catch (error) {
          console.log(`⚠️ Error processing resource ${url}: ${error}`);
        }
      }
    });

    // Navigate to login page
    await page.goto("/login", { waitUntil: "networkidle", timeout: 30000 });
    
    // Wait a bit to ensure all resources are captured
    await page.waitForTimeout(2000);

    // Calculate totals
    const totalTransferSize = jsResources.reduce((sum, r) => sum + r.transferSize, 0);
    const totalResourceSize = jsResources.reduce((sum, r) => sum + r.resourceSize, 0);
    const allCompressed = jsResources.every((r) => r.compressed);
    const compressionRate = totalResourceSize > 0 ? ((1 - totalTransferSize / totalResourceSize) * 100) : 0;

    console.log("\n" + "=".repeat(80));
    console.log("PERF-LOGIN-05: JavaScript Bundle Size Results");
    console.log("=".repeat(80));
    console.log("\n📦 JavaScript Resources:");
    jsResources.forEach((r, index) => {
      const filename = r.url.split("/").pop() || r.url;
      console.log(`  ${index + 1}. ${filename}`);
      console.log(`     Transfer: ${(r.transferSize / 1024).toFixed(2)}KB | Uncompressed: ${(r.resourceSize / 1024).toFixed(2)}KB | ${r.compressed ? "✓ Compressed" : "✗ Not Compressed"}`);
    });

    console.log("\n📈 Summary:");
    console.log(`  Total JS Files: ${jsResources.length}`);
    console.log(`  Total Transfer Size: ${(totalTransferSize / 1024).toFixed(2)}KB (gzipped)`);
    console.log(`  Total Uncompressed Size: ${(totalResourceSize / 1024).toFixed(2)}KB`);
    console.log(`  Compression Rate: ${compressionRate.toFixed(1)}%`);
    console.log(`  All Files Compressed: ${allCompressed ? "✓" : "✗"}`);

    console.log("\n✅ Success Criteria:");
    const transferSizePass = totalTransferSize <= 1 * 1024 * 1024; // 1MB
    const resourceSizePass = totalResourceSize <= 1 * 1024 * 1024; // 1MB
    const compressionPass = allCompressed;

    console.log(`  ${transferSizePass ? "✓" : "✗"} Total JS transfer size ≤ 1MB: ${(totalTransferSize / 1024).toFixed(2)}KB ${transferSizePass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${resourceSizePass ? "✓" : "✗"} Total JS parsed size ≤ 1MB: ${(totalResourceSize / 1024).toFixed(2)}KB ${resourceSizePass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${compressionPass ? "✓" : "✗"} All JS served with compression ${compressionPass ? "(PASS)" : "(FAIL)"}`);

    const allPassed = transferSizePass && resourceSizePass && compressionPass;
    console.log(`\n${allPassed ? "🎉 ALL CRITERIA PASSED" : "❌ SOME CRITERIA FAILED"}`);
    console.log("=".repeat(80) + "\n");

    // Export results to JSON file
    const results = {
      testCase: "PERF-LOGIN-05",
      description: "Login page JavaScript bundle size measurement",
      timestamp: new Date().toISOString(),
      metrics: {
        totalJsFiles: jsResources.length,
        totalTransferSize: totalTransferSize,
        totalResourceSize: totalResourceSize,
        compressionRate: compressionRate,
        allCompressed: allCompressed,
      },
      successCriteria: {
        transferSizeThreshold: 1024 * 1024,
        transferSizeActual: totalTransferSize,
        transferSizePass,
        resourceSizeThreshold: 1024 * 1024,
        resourceSizeActual: totalResourceSize,
        resourceSizePass,
        compressionPass,
        overallPass: allPassed,
      },
      resources: jsResources,
    };

    const resultsDir = path.join(process.cwd(), "test-results");
    
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(resultsDir, "PERF-LOGIN-05-results.json"),
      JSON.stringify(results, null, 2)
    );

    // Take screenshot
    await page.screenshot({ path: `test-results/PERF-LOGIN-05-page.png` });

    // Assert final results
    expect(totalTransferSize, `Total JS transfer size should be ≤ 1MB, got ${(totalTransferSize / 1024).toFixed(2)}KB`).toBeLessThanOrEqual(1 * 1024 * 1024);
    expect(totalResourceSize, `Total JS parsed size should be ≤ 1MB, got ${(totalResourceSize / 1024).toFixed(2)}KB`).toBeLessThanOrEqual(1 * 1024 * 1024);
    expect(allCompressed, "All JS resources should be served with compression").toBe(true);
  });
});
