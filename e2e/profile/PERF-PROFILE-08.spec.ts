import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

// Load .env.local into process.env if present
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return;
    const key = trimmed.substring(0, eq).trim();
    let value = trimmed.substring(eq + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    if (!(key in process.env)) process.env[key] = value;
  });
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createAdminClient } = require("../../supabase/admin");

/**
 * PERF-PROFILE-08: Employee table pagination/scrolling - measure large list performance
 *
 * Steps:
 * 1. Seed database with 100 test employees
 * 2. Navigate to Settings → Employees
 * 3. Measure initial render time
 * 4. Scroll to bottom of list
 * 5. Measure scroll smoothness (FPS)
 * 6. Measure time to render all rows
 * 7. Repeat 3 times
 *
 * Success Criteria:
 * - Initial render ≤ 3000ms
 * - Scroll FPS ≥ 30
 * - All 100 employees render without crash
 * - Memory usage stable (no leak)
 */

test.describe("PERF-PROFILE-08: Employee table pagination/scrolling performance", () => {
  test.setTimeout(180000);

  const TEST_ITERATIONS = 3;
  const MIN_EMPLOYEES = 100;
  const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || "saladegg24@gmail.com";
  const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || "123456";

  type ScrollMetrics = {
    attempt: number;
    initialRenderMs: number;
    scrollToBottomMs: number;
    employeeCount: number;
    avgFps: number;
    minFps: number;
    maxFps: number;
    layoutShiftCount: number;
    layoutShiftScore: number;
    memoryStable: boolean;
    success: boolean;
    error?: string;
  };

  const metrics: ScrollMetrics[] = [];

  async function ensureSeeded(minCount = MIN_EMPLOYEES) {
    const admin = createAdminClient();

    // Count existing profiles
    const { data: rows, error: countErr, count: exactCount } = await admin
      .from("profiles")
      .select("id", { count: "exact" });

    if (countErr) {
      throw new Error(`Failed to count profiles: ${countErr.message}`);
    }

    let count = typeof exactCount === "number" ? exactCount : (Array.isArray(rows) ? rows.length : 0);
    if (count >= minCount) {
      console.log(`✓ Database already has ${count} profiles (need ${minCount})`);
      return count;
    }

    let toInsert = minCount - count;
    console.log(`Seeding ${toInsert} profiles into DB...`);

    // Insert in batches to avoid overly large payloads
    const batchSize = 50;
    const cryptoLib = require("crypto");
    while (toInsert > 0) {
      const thisBatch = Math.min(batchSize, toInsert);
      const inserts: any[] = [];
      const ts = Date.now();
      for (let i = 0; i < thisBatch; i++) {
        inserts.push({
          id: cryptoLib.randomUUID(),
          email: `perf.emp.${ts}.${Math.floor(Math.random() * 100000)}@example.com`,
          full_name: `Performance Employee ${ts}-${i}`,
          role: "employee",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      const { data: inserted, error: insertError } = await admin.from("profiles").insert(inserts).select("id");
      if (insertError) {
        console.error("Error inserting seed profiles:", insertError);
        throw insertError;
      }

      toInsert -= thisBatch;

      // Small delay to let DB settle
      await new Promise((r) => setTimeout(r, 300));

      // Recount
      const { count: newCount } = await admin.from("profiles").select("id", { count: "exact" });
      count = typeof newCount === "number" ? newCount : count + (inserted ? inserted.length : 0);
      console.log(`   Seeded batch, total profiles now: ${count}`);
    }

    // Final confirmation
    const { count: finalCount } = await admin.from("profiles").select("id", { count: "exact" });
    const final = typeof finalCount === "number" ? finalCount : count;
    if (final < minCount) throw new Error(`Failed to seed required profiles; only ${final} present`);
    console.log(`✅ Successfully seeded database with ${final} employees`);
    return final;
  }

  async function loginAsAdmin(page: any) {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.waitForSelector('input[name="email"]', { state: "visible", timeout: 10000 });
    await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle", timeout: 60000 }).catch(() => null),
      page.locator('button[type="submit"]').first().click(),
    ]);
  }

  async function findEmployeesTab(page: any) {
    const candidates = [
      'button:has-text("Nhân viên")',
      'button:has-text("Nhan vien")',
      'a:has-text("Nhân viên")',
      'a:has-text("Nhan vien")',
      '[role="tab"]:has-text("Nhân viên")',
      '[role="tab"]:has-text("Nhan vien")',
      'button:has-text("Employees")',
      'a:has-text("Employees")',
      '[role="tab"]:has-text("Employees")',
    ];

    for (const sel of candidates) {
      const loc = page.locator(sel);
      try {
        if ((await loc.count()) > 0) return loc.first();
      } catch {}
    }

    const regex = page.locator('text=/nhan\\s*vien|nhân\\s*viên|employees/i').first();
    if ((await regex.count()) > 0) return regex;

    throw new Error("Employees tab not found");
  }

  // Measure scroll performance with detailed FPS tracking
  async function measureScrollPerformance(page: any, durationMs = 3000) {
    return await page.evaluate(async (dur: number) => {
      function findScroller() {
        const table = document.querySelector('table, [role="table"]');
        if (!table) return document.scrollingElement || document.documentElement;
        
        // Try to find nearest scrollable ancestor
        let el: any = table.parentElement;
        while (el && el !== document.body) {
          const style = getComputedStyle(el);
          if (/(auto|scroll)/.test(style.overflowY)) return el;
          el = el.parentElement;
        }
        return document.scrollingElement || document.documentElement;
      }

      const scroller = findScroller();

      // Setup PerformanceObserver for layout-shift
      let layoutCount = 0;
      let layoutScore = 0;
      try {
        // @ts-ignore
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // @ts-ignore
            if (!entry.hadRecentInput) {
              layoutCount++;
              // @ts-ignore
              layoutScore += entry.value || 0;
            }
          }
        });
        // @ts-ignore
        observer.observe({ type: "layout-shift", buffered: true });
      } catch (e) {
        // PerformanceObserver may not be available
      }

      // Track FPS with detailed measurements
      const fpsReadings: number[] = [];
      let frames = 0;
      let running = true;
      let lastFrameTime = performance.now();

      function raf(ts: number) {
        frames++;
        const delta = ts - lastFrameTime;
        if (delta > 0) {
          const fps = 1000 / delta;
          fpsReadings.push(fps);
        }
        lastFrameTime = ts;
        if (running) requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Programmatic scroll with multiple passes
      const start = performance.now();
      const maxScroll = Math.max(scroller.scrollHeight - scroller.clientHeight, 0);

      if (maxScroll <= 0) {
        // Nothing to scroll, just wait
        await new Promise((r) => setTimeout(r, dur));
      } else {
        // Perform smooth scrolling in multiple passes
        const passes = 4;
        for (let p = 0; p < passes; p++) {
          const targetScroll = p % 2 === 0 ? maxScroll : 0;
          const stepStart = performance.now();
          const stepDur = dur / passes;

          while (performance.now() - stepStart < stepDur) {
            const elapsed = performance.now() - stepStart;
            const progress = Math.min(elapsed / stepDur, 1);
            
            // Easing function for smooth scroll
            const eased = progress < 0.5 
              ? 2 * progress * progress 
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            const currentScroll = scroller.scrollTop || 0;
            scroller.scrollTop = currentScroll + (targetScroll - currentScroll) * eased * 0.1;

            // Small delay to allow rendering
            await new Promise((r) => setTimeout(r, 16)); // ~60fps target
          }
        }
      }

      // Stop frame counting
      running = false;
      await new Promise((r) => setTimeout(r, 100)); // Allow final frames to settle

      const totalDuration = (performance.now() - start) / 1000;
      const avgFps = frames / Math.max(totalDuration, 0.001);

      // Calculate min/max FPS from readings (exclude outliers)
      const validFps = fpsReadings.filter(fps => fps < 1000 && fps > 0);
      const minFps = validFps.length > 0 ? Math.min(...validFps) : 0;
      const maxFps = validFps.length > 0 ? Math.max(...validFps) : 0;

      return {
        avgFps: Math.round(avgFps * 10) / 10,
        minFps: Math.round(minFps * 10) / 10,
        maxFps: Math.round(maxFps * 10) / 10,
        layoutCount,
        layoutScore,
      };
    }, durationMs);
  }

  test.beforeAll(async () => {
    try {
      await ensureSeeded(MIN_EMPLOYEES);
    } catch (err) {
      console.warn("⚠️ Could not seed DB automatically:", err);
    }
  });

  for (let i = 1; i <= TEST_ITERATIONS; i++) {
    test(`Attempt ${i}/${TEST_ITERATIONS}: Load and scroll ${MIN_EMPLOYEES} employees`, async ({ page, context }) => {
      console.log(`\n⏱️ Attempt ${i}: starting large list performance test...`);

      try {
        await context.clearCookies();
        await loginAsAdmin(page);

        // Navigate to settings
        await page.goto("/settings", { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle");

        // Click the Employees tab
        const employeesTab = await findEmployeesTab(page);
        await employeesTab.waitFor({ state: "visible", timeout: 10000 });

        // Measure initial render time from tab click until rows appear
        const initialRenderStart = Date.now();
        await employeesTab.click();

        // Verify DB has enough rows
        try {
          const admin = createAdminClient();
          const { data: rows, count } = await admin.from("profiles").select("id", { count: "exact" });
          const dbCount = typeof count === "number" ? count : Array.isArray(rows) ? rows.length : 0;
          if (dbCount < MIN_EMPLOYEES) {
            console.warn(`DB has only ${dbCount} profiles (need ${MIN_EMPLOYEES}). Attempting to seed again.`);
            await ensureSeeded(MIN_EMPLOYEES);
          }
        } catch (dbErr) {
          console.warn("Could not verify DB count:", dbErr);
        }

        // Poll for employee rows with timeout
        const maxWait = 40000;
        const pollInterval = 500;
        let elapsed = 0;
        let found = 0;

        while (elapsed < maxWait) {
          found = await page.evaluate(() => {
            const rows = document.querySelectorAll('table tbody tr');
            return rows ? rows.length : 0;
          });

          if (found >= MIN_EMPLOYEES) break;

          if (elapsed % 2000 === 0 && elapsed > 0) {
            console.log(`   Waiting: ${found}/${MIN_EMPLOYEES} rows visible after ${elapsed}ms`);
          }
          await page.waitForTimeout(pollInterval);
          elapsed += pollInterval;
        }

        if (found < MIN_EMPLOYEES) {
          // Take a debug snapshot
          const snapshot = await page.content();
          fs.writeFileSync(
            path.join(process.cwd(), `test-results/PERF-PROFILE-08-debug-${Date.now()}.html`),
            snapshot
          );
          throw new Error(`Timed out waiting for ${MIN_EMPLOYEES} employee rows; only found ${found}`);
        }

        // Allow render to settle
        await page.waitForTimeout(200);
        const initialRenderMs = Date.now() - initialRenderStart;

        // Count final employee rows
        const employeeCount = await page.evaluate(() => {
          const rows = document.querySelectorAll('table tbody tr, [role="row"]');
          return rows ? rows.length : 0;
        });

        console.log(`   ✓ Initial render completed: ${employeeCount} rows in ${initialRenderMs}ms`);

        // Measure memory before scroll
        const memoryBefore = await page.evaluate(() => {
          // @ts-ignore
          if (performance.memory) {
            // @ts-ignore
            return performance.memory.usedJSHeapSize;
          }
          return 0;
        });

        // Measure scroll performance
        const scrollStart = Date.now();
        const scrollPerf = await measureScrollPerformance(page, 3000);
        const scrollToBottomMs = Date.now() - scrollStart;

        console.log(
          `   ✓ Scroll performance: ${scrollToBottomMs}ms, FPS avg: ${scrollPerf.avgFps} (min: ${scrollPerf.minFps}, max: ${scrollPerf.maxFps})`
        );

        // Measure memory after scroll
        const memoryAfter = await page.evaluate(() => {
          // @ts-ignore
          if (performance.memory) {
            // @ts-ignore
            return performance.memory.usedJSHeapSize;
          }
          return 0;
        });

        // Check memory stability (allow 50% growth max)
        const memoryGrowth = memoryBefore > 0 ? (memoryAfter - memoryBefore) / memoryBefore : 0;
        const memoryStable = memoryGrowth < 0.5;

        if (!memoryStable) {
          console.warn(
            `   ⚠️ Memory increased by ${(memoryGrowth * 100).toFixed(1)}% (${memoryBefore} → ${memoryAfter})`
          );
        }

        metrics.push({
          attempt: i,
          initialRenderMs,
          scrollToBottomMs,
          employeeCount,
          avgFps: scrollPerf.avgFps,
          minFps: scrollPerf.minFps,
          maxFps: scrollPerf.maxFps,
          layoutShiftCount: scrollPerf.layoutCount || 0,
          layoutShiftScore: scrollPerf.layoutScore || 0,
          memoryStable,
          success: true,
        });

        // Screenshot first attempt
        if (i === 1) {
          const resultsDir = path.join(process.cwd(), "test-results");
          if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
          await page.screenshot({
            path: `test-results/PERF-PROFILE-08-${i}.png`,
            fullPage: true,
          });
        }

        // Basic assertions per attempt
        expect(initialRenderMs, `initial render should be ≤ 3000ms`).toBeLessThanOrEqual(3000);
        expect(employeeCount, `should display at least ${MIN_EMPLOYEES} employees`).toBeGreaterThanOrEqual(
          MIN_EMPLOYEES
        );
        expect(scrollPerf.avgFps, `average scroll FPS should be ≥ 30`).toBeGreaterThanOrEqual(30);
        expect(memoryStable, `memory should remain stable (no leak)`).toBe(true);

      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        metrics.push({
          attempt: i,
          initialRenderMs: 0,
          scrollToBottomMs: 0,
          employeeCount: 0,
          avgFps: 0,
          minFps: 0,
          maxFps: 0,
          layoutShiftCount: 0,
          layoutShiftScore: 0,
          memoryStable: false,
          success: false,
          error: errMsg,
        });

        // Save failure screenshot
        try {
          await page.screenshot({
            path: `test-results/PERF-PROFILE-08-failure-${i}.png`,
            fullPage: true,
          });
        } catch {}

        throw error;
      }
    });
  }

  test.afterAll(async () => {
    const successful = metrics.filter((m) => m.success);

    if (successful.length === 0) {
      console.log("No successful attempts — skipping analysis");
      return;
    }

    const renderTimes = successful.map((m) => m.initialRenderMs).sort((a, b) => a - b);
    const scrollTimes = successful.map((m) => m.scrollToBottomMs).sort((a, b) => a - b);
    const fpsList = successful.map((m) => m.avgFps);

    const avgRenderTime = Math.round((renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length) * 10) / 10;
    const avgScrollTime = Math.round((scrollTimes.reduce((a, b) => a + b, 0) / scrollTimes.length) * 10) / 10;
    const avgFps = Math.round((fpsList.reduce((a, b) => a + b, 0) / fpsList.length) * 10) / 10;
    const minFps = Math.min(...successful.map((m) => m.minFps));

    const allMemoryStable = successful.every((m) => m.memoryStable);
    const anyLayoutShifts = successful.some((m) => m.layoutShiftCount > 0);

    const results = {
      testCase: "PERF-PROFILE-08",
      timestamp: new Date().toISOString(),
      iterations: metrics.length,
      successful: successful.length,
      performance: {
        avgInitialRenderMs: avgRenderTime,
        avgScrollTimeMs: avgScrollTime,
        avgFps,
        minFps,
      },
      allMemoryStable,
      anyLayoutShifts,
      attempts: metrics,
    };

    const resultsDir = path.join(process.cwd(), "test-results");
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
    fs.writeFileSync(
      path.join(resultsDir, "PERF-PROFILE-08-results.json"),
      JSON.stringify(results, null, 2)
    );

    console.log("\nPERF-PROFILE-08 results:\n", JSON.stringify(results, null, 2));

    // Final assertions
    expect(avgRenderTime, `average initial render should be ≤ 3000ms, got ${avgRenderTime}ms`).toBeLessThanOrEqual(
      3000
    );
    expect(avgFps, `average scroll FPS should be ≥ 30, got ${avgFps}`).toBeGreaterThanOrEqual(30);
    expect(allMemoryStable, "memory should remain stable across all attempts (no leak)").toBe(true);
    expect(successful.length, "at least one successful attempt").toBeGreaterThan(0);
  });
});
