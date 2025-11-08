/**
 * Helper utilities for order performance tests
 */
import { Page, expect } from "@playwright/test";
import { createAdminClient } from "../../supabase/admin";
import { format } from "date-fns";

export const TEST_CREDENTIALS = {
  email: "saladegg24@gmail.com",
  password: "123456",
};

/**
 * Login helper for tests
 */
export async function loginUser(page: Page) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");

  await page.fill('input[name="email"]', TEST_CREDENTIALS.email);
  await page.fill('input[name="password"]', TEST_CREDENTIALS.password);

  const navigationPromise = page.waitForURL((url) => {
    const urlStr = url.toString();
    return urlStr.includes("/reception") || urlStr.includes("/home");
  }, { timeout: 30000 });

  await page.click('button[type="submit"]');
  await navigationPromise;
}

/**
 * Load environment variables from .env.local
 */
export function loadEnvFile() {
  const fs = require("fs");
  const path = require("path");
  const envPath = path.resolve(process.cwd(), ".env.local");
  
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");
    envFile.split(/\r?\n/).forEach((line: string) => {
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
}

/**
 * Create test vehicles with admin client
 */
export async function createTestVehicles(count: number) {
  const supabase = createAdminClient();
  const vehicles: Array<any> = [];
  
  for (let i = 0; i < count; i++) {
    vehicles.push({
      license_plate: `PERF-${String(i + 1).padStart(4, "0")}`,
      brand: `Brand ${i % 10}`,
    });
  }

  const { data, error } = await supabase
    .from("vehicles")
    .insert(vehicles)
    .select("id");

  if (error && !error.message.includes("duplicate")) {
    console.warn("Warning: failed to insert vehicles:", error.message);
  }

  return data || [];
}

/**
 * Create test repair orders
 */
export async function createTestRepairOrders(vehicleIds: string[], count: number) {
  const supabase = createAdminClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const orders: Array<any> = [];
  
  for (let i = 0; i < count; i++) {
    orders.push({
      vehicle_id: vehicleIds[i % vehicleIds.length] || null,
      status: ["pending", "in-progress", "completed"][i % 3],
      reception_date: today,
      total_amount: 0,
      notes: `Performance test order #${i + 1}`,
    });
  }

  const { data, error } = await supabase
    .from("repair_orders")
    .insert(orders)
    .select("id");

  if (error) {
    console.warn("Warning: failed to insert repair orders:", error.message);
  }

  return data || [];
}

/**
 * Cleanup test data
 */
export async function cleanupTestData() {
  const supabase = createAdminClient();

  // Delete repair orders
  await supabase
    .from("repair_orders")
    .delete()
    .or('notes.like.Performance test order%,notes.like.Seeded test repair order%');

  // Delete vehicles
  await supabase
    .from("vehicles")
    .delete()
    .or('license_plate.like.PERF-%,license_plate.like.TEST-%');
}

/**
 * Calculate percentile from sorted array
 */
export function calculatePercentile(sortedValues: number[], percentile: number): number {
  const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, index)];
}

/**
 * Save test results to JSON file
 */
export function saveTestResults(testName: string, results: any) {
  const fs = require("fs");
  const path = require("path");
  const resultsDir = path.join(process.cwd(), "test-results");
  
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(resultsDir, `${testName}-results.json`),
    JSON.stringify(results, null, 2)
  );
}
