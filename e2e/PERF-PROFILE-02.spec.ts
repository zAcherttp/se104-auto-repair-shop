import { test, expect } from "@playwright/test";

/**
 * PERF-PROFILE-02: Load Employees list with 50+ records
 * 
 * Test Case: Measure rendering performance with large dataset
 * 
 * Success Criteria:
 * - p95 ≤ 2500ms
 * - All 50 employees displayed
 * - Scroll performance ≥30 FPS
 * - No layout shifts during render
 * 
 * Dependency: PERF-PROFILE-01
 * Note: Requires database seeded with 50+ employees
 */

interface PerformanceMetrics {
  attempt: number;
  duration: number;
  employeeCount: number;
  scrollFPS: number;
  layoutShift: number;
  success: boolean;
  error?: string;
}

test.describe("PERF-PROFILE-02: Large Employee List Performance", () => {
  const TEST_ITERATIONS = 3;
  const TEST_EMAIL = "saladegg24@gmail.com";
  const TEST_PASSWORD = "123456";
  const EXPECTED_EMPLOYEE_COUNT = 50;
  
  const metrics: PerformanceMetrics[] = [];

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await context.clearPermissions();
  });

  for (let i = 1; i <= TEST_ITERATIONS; i++) {
    test(`Attempt ${i}/${TEST_ITERATIONS}: Load 50+ employees`, async ({ page, context }) => {
      console.log(`\n⏱️ Attempt ${i}: Loading large employee list...`);
      
      // Login
      await context.clearCookies();
      
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
      
      console.log(`   ✓ Form filled, submitting...`);
      
      // Submit and wait for redirect with better error handling
      try {
        await Promise.all([
          page.waitForURL((url) => url.toString().includes("/reception") || url.toString().includes("/home"), { timeout: 60000 }),
          page.locator('button[type="submit"]').first().click(),
        ]);
      } catch (error) {
        console.log(`   ✗ Login failed or timed out`);
        console.log(`   Current URL: ${page.url()}`);
        await page.screenshot({ path: `test-results/PERF-PROFILE-02-login-timeout-${i}.png`, fullPage: true });
        throw error;
      }
      
      console.log(`   ✓ Logged in`);
      
      try {
        // Navigate to settings and employees tab
        await page.goto("/settings", { waitUntil: "domcontentloaded" });
        const employeesTab = page.locator('button:has-text("Employees"), a:has-text("Employees"), [role="tab"]:has-text("Employees")').first();
        await employeesTab.click();
        
        // Start timing and layout shift monitoring
        const startTime = Date.now();
        
        // Set up CLS (Cumulative Layout Shift) monitoring
        const clsPromise = page.evaluate(() => {
          return new Promise<number>((resolve) => {
            let cls = 0;
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries() as any[]) {
                if (!entry.hadRecentInput) {
                  cls += entry.value;
                }
              }
            });
            observer.observe({ type: "layout-shift", buffered: true });
            
            setTimeout(() => {
              observer.disconnect();
              resolve(cls);
            }, 3000);
          });
        });
        
        // Wait for all 50 employees to render
        const tableRows = page.locator('table tbody tr, [role="row"]:not([role="rowheader"])');
        await page.waitForFunction(
          (expectedCount) => {
            const rows = document.querySelectorAll('table tbody tr, [role="row"]:not([role="rowheader"])');
            return rows.length >= expectedCount;
          },
          EXPECTED_EMPLOYEE_COUNT,
          { timeout: 10000 }
        );
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Count employees
        const employeeCount = await tableRows.count();
        
        // Measure scroll performance (FPS)
        const scrollFPS = await page.evaluate(() => {
          return new Promise<number>((resolve) => {
            let frames = 0;
            let lastTime = performance.now();
            const duration = 1000; // Measure for 1 second
            
            const measureFrame = () => {
              const currentTime = performance.now();
              if (currentTime - lastTime < duration) {
                frames++;
                requestAnimationFrame(measureFrame);
              } else {
                const fps = Math.round((frames / duration) * 1000);
                resolve(fps);
              }
            };
            
            // Start scrolling
            const container = document.querySelector('table, [role="table"]')?.parentElement;
            if (container) {
              let scrollTop = 0;
              const scrollInterval = setInterval(() => {
                scrollTop += 10;
                container.scrollTop = scrollTop;
                if (scrollTop >= container.scrollHeight - container.clientHeight) {
                  clearInterval(scrollInterval);
                }
              }, 16); // ~60fps
            }
            
            requestAnimationFrame(measureFrame);
          });
        });
        
        const layoutShift = await clsPromise;
        
        console.log(`✅ Attempt ${i}: Loaded ${employeeCount} employees in ${duration}ms`);
        console.log(`   Scroll FPS: ${scrollFPS}`);
        console.log(`   Layout Shift (CLS): ${layoutShift.toFixed(4)}`);
        
        metrics.push({
          attempt: i,
          duration,
          employeeCount,
          scrollFPS,
          layoutShift,
          success: true,
        });
        
        console.log(`✓ Attempt ${i}: ${duration}ms - Success`);
        
        if (i === 1) {
          await page.screenshot({ path: `test-results/PERF-PROFILE-02-large-list-${i}.png`, fullPage: true });
        }
      } catch (error) {
        const duration = 0;
        
        // Try to take screenshot only if page is still open
        try {
          if (!page.isClosed()) {
            await page.screenshot({ path: `test-results/PERF-PROFILE-02-failure-${i}.png`, fullPage: true });
          }
        } catch (screenshotError) {
          console.log(`⚠️ Could not take failure screenshot: ${screenshotError}`);
        }
        
        metrics.push({
          attempt: i,
          duration,
          employeeCount: 0,
          scrollFPS: 0,
          layoutShift: 0,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
        
        console.log(`✗ Attempt ${i}: Failed - ${error}`);
        throw error;
      }
    });
  }

  test.afterAll(async () => {
    const successfulAttempts = metrics.filter((m) => m.success);
    const durations = successfulAttempts.map((m) => m.duration).sort((a, b) => a - b);
    
    if (durations.length === 0) {
      console.log("\n❌ No successful attempts to analyze!");
      return;
    }

    const p95Index = Math.floor(durations.length * 0.95);
    const p95 = durations[p95Index];
    const avgFPS = successfulAttempts.reduce((sum, m) => sum + m.scrollFPS, 0) / successfulAttempts.length;
    const allEmployeesDisplayed = successfulAttempts.every((m) => m.employeeCount >= EXPECTED_EMPLOYEE_COUNT);
    const noLayoutShifts = successfulAttempts.every((m) => m.layoutShift <= 0.1);

    console.log("\n" + "=".repeat(80));
    console.log("PERF-PROFILE-02: Performance Test Results");
    console.log("=".repeat(80));
    console.log("\n📊 Individual Attempts:");
    metrics.forEach((m) => {
      const status = m.success ? "✓" : "✗";
      console.log(`  ${status} Attempt ${m.attempt}: ${m.duration}ms - Employees: ${m.employeeCount}, FPS: ${m.scrollFPS}, CLS: ${m.layoutShift.toFixed(4)}`);
    });

    console.log("\n📈 Statistical Analysis:");
    console.log(`  p95: ${p95}ms`);
    console.log(`  Average Scroll FPS: ${avgFPS.toFixed(1)}`);

    console.log("\n✅ Success Criteria:");
    const p95Pass = p95 <= 2500;
    const employeesPass = allEmployeesDisplayed;
    const fpsPass = avgFPS >= 30;
    const clsPass = noLayoutShifts;
    
    console.log(`  ${p95Pass ? "✓" : "✗"} p95 ≤ 2500ms: ${p95}ms ${p95Pass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${employeesPass ? "✓" : "✗"} All 50 employees displayed ${employeesPass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${fpsPass ? "✓" : "✗"} Scroll performance ≥30 FPS: ${avgFPS.toFixed(1)} FPS ${fpsPass ? "(PASS)" : "(FAIL)"}`);
    console.log(`  ${clsPass ? "✓" : "✗"} No layout shifts during render ${clsPass ? "(PASS)" : "(FAIL)"}`);

    const allPassed = p95Pass && employeesPass && fpsPass && clsPass;
    console.log(`\n${allPassed ? "🎉 ALL CRITERIA PASSED" : "❌ SOME CRITERIA FAILED"}`);
    console.log("=".repeat(80) + "\n");

    const fs = require("fs");
    const path = require("path");
    fs.writeFileSync(
      path.join(process.cwd(), "test-results", "PERF-PROFILE-02-results.json"),
      JSON.stringify({
        testCase: "PERF-PROFILE-02",
        timestamp: new Date().toISOString(),
        metrics,
        successCriteria: { p95Pass, employeesPass, fpsPass, clsPass, overallPass: allPassed },
      }, null, 2)
    );

    expect(p95).toBeLessThanOrEqual(2500);
    expect(allEmployeesDisplayed).toBe(true);
    expect(avgFPS).toBeGreaterThanOrEqual(30);
    expect(noLayoutShifts).toBe(true);
  });
});
