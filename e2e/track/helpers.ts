/**
 * Helper utilities for track order performance tests
 */
import { Page } from "@playwright/test";
import { createAdminClient } from "../../supabase/admin";
import fs from "fs";
import path from "path";

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
 * Create test vehicles with repair orders for tracking
 */
export async function createTestVehiclesForTracking(count: number) {
  const supabase = createAdminClient();
  const vehicles: Array<any> = [];
  
  for (let i = 0; i < count; i++) {
    const plateNumber = String(10000 + i).substring(1);
    vehicles.push({
      license_plate: `51A-${plateNumber}`,
      brand: `Track Test Brand ${i % 10}`,
    });
  }

  const { data, error } = await supabase
    .from("vehicles")
    .insert(vehicles)
    .select("id, license_plate");

  if (error && !error.message.includes("duplicate")) {
    console.warn("Warning: failed to insert vehicles:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Create repair orders for test vehicles
 */
export async function createTestRepairOrders(vehicleIds: string[]) {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split('T')[0];
  const orders: Array<any> = [];
  
  for (let i = 0; i < vehicleIds.length; i++) {
    orders.push({
      vehicle_id: vehicleIds[i],
      status: ["pending", "in-progress", "completed"][i % 3],
      reception_date: today,
      total_amount: 1000 + (i * 100),
      notes: `Track test order #${i + 1}`,
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
    .like("notes", "Track test order%");

  // Delete vehicles
  await supabase
    .from("vehicles")
    .delete()
    .like("license_plate", "51A-%");
}

/**
 * Calculate percentile from sorted array
 */
export function calculatePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, index)];
}

/**
 * Save test results to JSON file
 */
export function saveTestResults(testName: string, results: any) {
  const resultsDir = path.join(process.cwd(), "test-results");
  
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(resultsDir, `${testName}-results.json`),
    JSON.stringify(results, null, 2)
  );
}
