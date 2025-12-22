import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { createAdminClient } from "../../supabase/admin";

// Load environment variables so createAdminClient can read NEXT_PUBLIC_SUPABASE_* values
// Load .env.local into process.env if present (avoids adding dotenv dependency)
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
		// Remove surrounding quotes
		if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
			value = value.substring(1, value.length - 1);
		}
		if (!(key in process.env)) process.env[key] = value;
	});
}

/**
 * PERF-PROFILE-02: Load 50+ Employees
 *
 * Steps:
 * 1. Seed database with 50 test employees (via setup)
 * 2. Login as admin
 * 3. Navigate to Settings → Nhân viên (Employees) tab
 * 4. Measure time until all 50 rows render
 * 5. Verify scroll performance (≥30 FPS)
 * 6. Repeat 3 times
 * 7. Calculate p95 percentile
 *
 * Success Criteria:
 * - p95 ≤ 2500ms
 * - All 50 employees displayed
 * - Scroll performance ≥30 FPS
 * - No layout shifts during render
 */

test.describe("PERF-PROFILE-02: Load 50+ employees performance", () => {
	test.setTimeout(120000);

	const TEST_ITERATIONS = 3;
	const MIN_EMPLOYEES = 50;
	const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || "saladegg24@gmail.com";
	const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || "123456";

	type AttemptMetrics = {
		attempt: number;
		durationMs: number;
		employeeCount: number;
		avgFps: number;
		layoutShiftCount: number;
		layoutShiftScore: number;
		success: boolean;
		error?: string;
	};

	const metrics: AttemptMetrics[] = [];

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
			if (count >= minCount) return count;

			let toInsert = minCount - count;
			console.log(`Seeding ${toInsert} profiles into DB`);

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
						email: `perf.employee.${ts}.${Math.floor(Math.random() * 100000)}@example.com`,
						full_name: `Perf Test Employee ${ts} ${i}`,
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

				// Update counters
				toInsert -= thisBatch;

				// small delay to let DB settle
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
			return final;
	}

	// Page-level helpers
	async function loginAsAdmin(page: any) {
		await page.goto("/login", { waitUntil: "networkidle" });
		// Clear storages
		await page.evaluate(() => {
			localStorage.clear();
			sessionStorage.clear();
		});

		await page.waitForSelector('input[name="email"]', { state: "visible", timeout: 10000 });
		await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
		await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
		// Submit form
		await Promise.all([
			page.waitForNavigation({ waitUntil: "networkidle", timeout: 60000 }).catch(() => null),
			page.locator('button[type="submit"]').first().click(),
		]);
	}

	// Find the Employees / Nhân viên tab robustly (handles diacritics and English)
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
			} catch (e) {
				// ignore and try next
			}
		}

		// Fallback: regex text match (diacritics-insensitive fallback by matching base letters)
		const regexLoc = page.locator('text=/nhan\\s*vien|nhân\\s*viên|employees/i').first();
		if ((await regexLoc.count()) > 0) return regexLoc;

		throw new Error("Employees tab not found (tried Nhân viên / Nhan vien / Employees)");
	}

	// Measure FPS and layout shifts while programmatically scrolling the employee list
		async function measureScrollFpsAndLayoutShifts(page: any, durationMs = 2000) {
		// This script will try to find a scrollable container for the table.
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
						// Only consider layout shifts that are not recent user input
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
				// PerformanceObserver may not be available in some contexts
			}

			// Measure frames during a short scrolling routine
			let frames = 0;
			let running = true;
			let lastTime = performance.now();
					function raf(ts: number) {
						frames++;
						lastTime = ts;
						if (running) requestAnimationFrame(raf);
					}
			requestAnimationFrame(raf);

			// Programmatic scroll back and forth for dur ms
			const start = performance.now();
			const end = start + dur;
			const startScroll = scroller.scrollTop || 0;
			const maxScroll = Math.max(scroller.scrollHeight - scroller.clientHeight, 0);

			// If nothing to scroll, still wait to collect frames
			if (maxScroll <= 0) {
				// just wait dur ms
				await new Promise((r) => setTimeout(r, dur));
			} else {
				// perform several passes
				const passes = 3;
				for (let p = 0; p < passes; p++) {
					const to = p % 2 === 0 ? maxScroll : 0;
					// smooth-ish step animation
					const stepStart = performance.now();
					const stepDur = dur / passes;
					while (performance.now() - stepStart < stepDur) {
						const t = (performance.now() - stepStart) / stepDur;
						scroller.scrollTop = startScroll + (to - startScroll) * t;
						// yield to raf and next tick
						await new Promise((r) => setTimeout(r, 8));
					}
				}
			}

			// stop frame counting
			running = false;
			// allow one frame to settle
			await new Promise((r) => setTimeout(r, 50));

			const durationSeconds = (performance.now() - start) / 1000;
			const avgFps = Math.round((frames / Math.max(durationSeconds, 0.001)) * 10) / 10;

			// Try to flush observer entries if available
			try {
				// @ts-ignore
				if (window.performance && (window as any).PerformanceObserver) {
					await new Promise((r) => setTimeout(r, 20));
				}
			} catch {}

			return { avgFps, layoutCount, layoutScore };
		}, durationMs);
	}

	test.beforeAll(async () => {
		// Seed DB with at least MIN_EMPLOYEES
		try {
			await ensureSeeded(MIN_EMPLOYEES);
			console.log(`✅ DB seeded with at least ${MIN_EMPLOYEES} employees`);
		} catch (err) {
			console.warn("⚠️ Could not seed DB automatically:", err);
			// proceed — test will still attempt to run and fail if employees missing
		}
	});

	for (let i = 1; i <= TEST_ITERATIONS; i++) {
		test(`Attempt ${i}/${TEST_ITERATIONS}: Load ${MIN_EMPLOYEES} employees`, async ({ page, context }) => {
			console.log(`\n⏱️ Attempt ${i}: starting...`);

			try {
				await context.clearCookies();
				await loginAsAdmin(page);

				// Navigate to settings
				await page.goto("/settings", { waitUntil: "domcontentloaded" });
				await page.waitForLoadState("networkidle");

				// Click the Employees tab (Vietnamese: Nhân viên)
					const employeesTab = await findEmployeesTab(page);

					await employeesTab.waitFor({ state: "visible", timeout: 10000 });
					await employeesTab.click();

					// Start timing until all rows are visible
					const start = Date.now();

					// Before polling the UI, confirm DB has enough rows (helps early-fail when seeding missed)
					try {
						const admin = createAdminClient();
						const { data: rows, count } = await admin.from("profiles").select("id", { count: "exact" });
						const dbCount = typeof count === "number" ? count : Array.isArray(rows) ? rows.length : 0;
						if (dbCount < MIN_EMPLOYEES) {
							console.warn(`DB has only ${dbCount} profiles (need ${MIN_EMPLOYEES}). Attempting to seed again.`);
							await ensureSeeded(MIN_EMPLOYEES);
						}
					} catch (dbErr) {
						console.warn("Could not verify DB count before UI check:", dbErr);
					}

					// Poll the DOM for rows with a longer timeout and periodic logging
					const maxWait = 30000;
					const pollInterval = 500;
					let elapsed = 0;
					let found = 0;
					while (elapsed < maxWait) {
						// Count table body rows only to avoid counting headers
						found = await page.evaluate(() => {
							const rows = document.querySelectorAll('table tbody tr');
							return rows ? rows.length : 0;
						});

						if (found >= MIN_EMPLOYEES) break;

						if (elapsed === 0) console.log(`   Waiting for employee rows (need ${MIN_EMPLOYEES})...`);
						if (elapsed % 2000 === 0) console.log(`   Poll: ${found}/${MIN_EMPLOYEES} rows after ${elapsed}ms`);
						await page.waitForTimeout(pollInterval);
						elapsed += pollInterval;
					}

					if (found < MIN_EMPLOYEES) {
						// Give one final short wait then capture state and fail with helpful message
						await page.waitForTimeout(200);
						const snapshot = await page.content();
						fs.writeFileSync(path.join(process.cwd(), `test-results/PERF-PROFILE-02-debug-${Date.now()}.html`), snapshot);
						throw new Error(`Timed out waiting for ${MIN_EMPLOYEES} employee rows; only found ${found}`);
					}

					// Force a short wait to let rendering settle
					await page.waitForTimeout(120);
					const duration = Date.now() - start;

				// Count displayed employees
				const employeeCount = await page.evaluate(() => {
					const rows = document.querySelectorAll('table tbody tr, [role="row"]');
					return rows ? rows.length : 0;
				});

				// Measure FPS and layout shifts during a short scroll
				const perf = await measureScrollFpsAndLayoutShifts(page, 2000);

				metrics.push({
					attempt: i,
					durationMs: duration,
					employeeCount,
					avgFps: perf.avgFps,
					layoutShiftCount: perf.layoutCount || 0,
					layoutShiftScore: perf.layoutScore || 0,
					success: true,
				});

				console.log(`   ✓ Rendered ${employeeCount} rows in ${duration}ms — FPS: ${perf.avgFps}, layout shifts: ${perf.layoutCount} (score ${perf.layoutScore})`);

				// Screenshot first attempt for audit
				if (i === 1) {
					const resultsDir = path.join(process.cwd(), "test-results");
					if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
					await page.screenshot({ path: `test-results/PERF-PROFILE-02-${i}.png`, fullPage: true });
				}

				// Basic assertions per attempt
				expect(employeeCount, `should display at least ${MIN_EMPLOYEES} employees`).toBeGreaterThanOrEqual(MIN_EMPLOYEES);
				expect(perf.avgFps, `scroll FPS should be ≥ 30`).toBeGreaterThanOrEqual(30);
				expect(perf.layoutCount, `layout shifts during render should be 0`).toBeLessThanOrEqual(0);

			} catch (error) {
				const errMsg = error instanceof Error ? error.message : String(error);
				metrics.push({
					attempt: i,
					durationMs: 0,
					employeeCount: 0,
					avgFps: 0,
					layoutShiftCount: 0,
					layoutShiftScore: 0,
					success: false,
					error: errMsg,
				});

				// Save failure screenshot
				try {
					await page.screenshot({ path: `test-results/PERF-PROFILE-02-failure-${i}.png`, fullPage: true });
				} catch {}

				throw error;
			}
		});
	}

	test.afterAll(async () => {
		// Analyze results
		const successful = metrics.filter((m) => m.success);
		const durations = successful.map((m) => m.durationMs).sort((a, b) => a - b);

		if (durations.length === 0) {
			console.log("No successful attempts — skipping analysis");
			return;
		}

		const p95Index = Math.max(0, Math.floor(durations.length * 0.95) - 1);
		const p95 = durations[Math.min(p95Index, durations.length - 1)];

		const fpsAll = successful.map((m) => m.avgFps);
		const fpsAvg = Math.round((fpsAll.reduce((a, b) => a + b, 0) / fpsAll.length) * 10) / 10;

		const anyLayoutShifts = successful.some((m) => m.layoutShiftCount > 0 || m.layoutShiftScore > 0);

		const results = {
			testCase: "PERF-PROFILE-02",
			timestamp: new Date().toISOString(),
			iterations: metrics.length,
			successful: successful.length,
			durations: {
				p95,
				all: durations,
			},
			fps: {
				avg: fpsAvg,
				all: fpsAll,
			},
			anyLayoutShifts,
			attempts: metrics,
		};

		const resultsDir = path.join(process.cwd(), "test-results");
		if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
		fs.writeFileSync(path.join(resultsDir, "PERF-PROFILE-02-results.json"), JSON.stringify(results, null, 2));

		console.log("\nPERF-PROFILE-02 results:\n", JSON.stringify(results, null, 2));

		// Final assertions
		expect(p95, `p95 should be ≤ 2500ms, got ${p95}ms`).toBeLessThanOrEqual(2500);
		expect(successful.length, "at least one successful attempt").toBeGreaterThan(0);
		expect(fpsAvg, `average FPS across successful attempts should be ≥ 30`).toBeGreaterThanOrEqual(30);
		expect(anyLayoutShifts, "no layout shifts during render").toBe(false);
	});
});

