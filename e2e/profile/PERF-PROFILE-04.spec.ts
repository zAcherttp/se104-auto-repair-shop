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

// Import admin client after envs loaded
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createAdminClient } = require("../../supabase/admin");

test.describe("PERF-PROFILE-04: Edit employee information - measure update operation speed", () => {
  test.setTimeout(120000);

  const ITERATIONS = 5;
  const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || "saladegg24@gmail.com";
  const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || "123456";

  type EmployeeRef = { id: string; full_name: string };
  let employeesToEdit: EmployeeRef[] = [];
  const metrics: Array<{ attempt: number; durationMs: number; success: boolean; dbMatch: boolean }> = [];

  async function loginAsAdmin(page: any) {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
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
      try { if ((await loc.count()) > 0) return loc.first(); } catch {}
    }
    const regex = page.locator('text=/nhan\\s*vien|nhân\\s*viên|employees/i').first();
    if ((await regex.count()) > 0) return regex;
    throw new Error("Employees tab not found");
  }

  test.beforeAll(async () => {
    const admin = createAdminClient();
    // grab a list of employees to edit; prefer most recently created
    const { data } = await admin.from('profiles').select('id,full_name').order('created_at', { ascending: false }).limit(ITERATIONS);
    if (!data || (Array.isArray(data) && data.length < ITERATIONS)) {
      throw new Error('Not enough employee profiles available for PERF-PROFILE-04; need at least ' + ITERATIONS);
    }
    employeesToEdit = (data as EmployeeRef[]).slice(0, ITERATIONS).map((r) => ({ id: r.id, full_name: r.full_name }));
  });

  test.beforeEach(async () => {
    const resultsDir = path.join(process.cwd(), "test-results");
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
  });

  for (let idx = 0; idx < ITERATIONS; idx++) {
    const attempt = idx + 1;
    test(`Attempt ${attempt}/${ITERATIONS}: edit employee ${attempt}`, async ({ page, context }) => {
      await context.clearCookies();
      await loginAsAdmin(page);

      await page.goto('/settings', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');

      const employeesTab = await findEmployeesTab(page);
      await employeesTab.waitFor({ state: 'visible', timeout: 10000 });
      await employeesTab.click();

      // Wait for table or list to render
      await page.waitForTimeout(500);

      const target = employeesToEdit[idx];
      // Find the row that contains the original full name
      let row = page.locator(`tr:has-text("${target.full_name}")`).first();
      if ((await row.count()) === 0) {
        // 1) Try UI search/filter inputs (English/Vietnamese)
        const searchSelectors = [
          'input[placeholder*="Search"]',
          'input[placeholder*="Tìm"]',
          'input[aria-label*="search" i]',
          'input[type="search"]',
          'input[name="search"]',
        ];
        let usedSearch = false;
        for (const sel of searchSelectors) {
          const input = page.locator(sel).first();
          try {
            if ((await input.count()) > 0) {
              await input.fill(target.full_name);
              // trigger search if needed
              await input.press('Enter').catch(() => null);
              await page.waitForTimeout(300);
              usedSearch = true;
              break;
            }
          } catch {}
        }

        if (usedSearch) {
          row = page.locator(`tr:has-text("${target.full_name}")`).first();
          if ((await row.count()) === 0) {
            // maybe the list is virtualized and the row isn't present yet; we'll try programmatic scroll below
          }
        }

        // 2) Try programmatic scroll within common scrollable containers to reveal virtualized rows
        if ((await row.count()) === 0) {
          const containerCandidates = ['div[role="table"]', 'div[class*="overflow-auto"]', 'tbody', 'div[class*="max-h" i]', 'div[class*="h-"]'];
          let foundInScroll = false;
          for (const sel of containerCandidates) {
            const container = page.locator(sel).first();
            if ((await container.count()) === 0) continue;
            // Scroll the container until the name appears or timeout
            const ok = await container.evaluate(async (el: HTMLElement, name: string) => {
              const start = Date.now();
              const max = 5000;
              const step = el.clientHeight || 200;
              while (Date.now() - start < max) {
                if (el.innerText && el.innerText.indexOf(name) !== -1) return true;
                el.scrollBy(0, step);
                // small delay
                // eslint-disable-next-line no-await-in-loop
                await new Promise((r) => setTimeout(r, 120));
              }
              return false;
            }, target.full_name).catch(() => false);
            if (ok) {
              // re-query the row now that it's likely present
              row = page.locator(`tr:has-text("${target.full_name}")`).first();
              if ((await row.count()) > 0) { foundInScroll = true; break; }
            }
          }
          if (!foundInScroll && (await row.count()) === 0) {
            // 3) Final fallback: try to find text anywhere and then the ancestor row; if still not, dump debug HTML
            const byText = page.locator(`text=${target.full_name}`).first();
            if ((await byText.count()) > 0) {
              try {
                const ancestor = byText.locator('xpath=ancestor::tr');
                if ((await ancestor.count()) > 0) row = ancestor.first();
              } catch (_) {}
            }
            if ((await row.count()) === 0) {
              const dump = await page.content();
              const dumpPath = path.join(process.cwd(), `test-results/debug-employee-${target.id}.html`);
              fs.writeFileSync(dumpPath, dump);
              throw new Error('Employee row for "' + target.full_name + '" not found in UI; debug HTML saved to ' + dumpPath);
            }
          }
        }
      }

      // Click edit / settings button inside that row (support Vietnamese/English and icon-only buttons).
      // Some buttons are icon-only and use utility classes (inline-flex ... h-8 rounded-md). Try multiple selectors.
      const editBtn = row.locator(
        'button:has-text("Edit"), button:has-text("Sửa"), button[aria-label*="edit" i], button[title*="edit" i], button:has-text("Chỉnh sửa"), button[class*="inline-flex"]:has(svg), button:has(svg[class*="size-" i])'
      ).first();
      if ((await editBtn.count()) === 0) {
        // Try a looser class-based match matching the utility class fragment provided by the user
        const loose = row.locator('button[class*="inline-flex"][class*="h-8"][class*="rounded-md"]').first();
        if ((await loose.count()) > 0) {
          await loose.click();
        } else {
          throw new Error('Edit button not found for employee: ' + target.full_name);
        }
      }
      else {
        await editBtn.click();
      }

      // Wait for dialog to appear and fullName input
      await page.waitForSelector('#fullName', { state: 'visible', timeout: 5000 });

      const updatedName = `Updated Name ${Date.now()}`;
      await page.locator('#fullName').fill(updatedName);

      // Attempt to change role if present using robust overlay approach
      try {
        const selectTrigger = page.locator('[role="combobox"], button:has-text("Select role"), button:has-text("Chọn vai trò"), button:has-text("Vai trò")').first();
        if ((await selectTrigger.count()) > 0) {
          const currentText = (await selectTrigger.textContent())?.trim() || '';
          await selectTrigger.click();
          await page.waitForTimeout(150);
          const overlay = page.locator('[data-state="open"], div[class*="bg-background"]');
          const options = overlay.locator('[role="option"]');
          const optCount = Math.max(0, await options.count());
          let changedRole = false;
          for (let k = 0; k < optCount; k++) {
            const opt = options.nth(k);
            const text = (await opt.textContent())?.trim() || '';
            if (text && text !== currentText) {
              await opt.click();
              changedRole = true;
              break;
            }
          }
          if (!changedRole && optCount > 0) {
            // click the first option as a fallback
            await options.first().click();
          }
        }
      } catch (e) {
        // non-fatal: role may not be editable
      }

      // Click Save / Update and measure until success toast
      const saveBtn = page.locator('button:has-text("Save"), button:has-text("Lưu"), button:has-text("Update"), button:has-text("Cập nhật")').first();
      if ((await saveBtn.count()) === 0) throw new Error('Save button not found in edit dialog');

      const start = Date.now();
      await Promise.all([
        page.waitForSelector('text=/updated|cập nhật|thành công|successfully/i', { timeout: 10000 }),
        saveBtn.click(),
      ]).catch(() => null);
      const duration = Date.now() - start;

      // Verify updated data visible in table (poll a few times)
      let visible = false;
      for (let t = 0; t < 10; t++) {
        const cnt = await page.locator(`text=${updatedName}`).count();
        if (cnt > 0) { visible = true; break; }
        await page.waitForTimeout(200);
      }

      // Verify DB record updated
      const admin = createAdminClient();
      const { data } = await admin.from('profiles').select('id,full_name').eq('id', target.id).limit(1).maybeSingle();
      const dbMatch = !!(data && data.full_name === updatedName);

      metrics.push({ attempt, durationMs: duration, success: visible, dbMatch });

      // Assertions per attempt
      expect(duration, `update latency for attempt ${attempt} should be ≤ 1500ms`).toBeLessThanOrEqual(1500);
      expect(visible, 'updated name visible in UI').toBeTruthy();
      expect(dbMatch, 'DB shows updated full_name').toBeTruthy();
    });
  }

  test.afterAll(async () => {
    const succDurations = metrics.filter(m => m.success && m.dbMatch).map(m => m.durationMs).sort((a, b) => a - b);
    if (succDurations.length === 0) {
      console.log('No successful update attempts');
      return;
    }
    const idx = Math.max(0, Math.floor(succDurations.length * 0.95) - 1);
    const p95 = succDurations[Math.min(idx, succDurations.length - 1)];

    const results = { testCase: 'PERF-PROFILE-04', metrics, p95 };
    fs.writeFileSync(path.join(process.cwd(), 'test-results', 'PERF-PROFILE-04-results.json'), JSON.stringify(results, null, 2));
    console.log('PERF-PROFILE-04 results:', results);

    expect(p95).toBeLessThanOrEqual(1500);
  });
});
