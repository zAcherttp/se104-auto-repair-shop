#!/usr/bin/env node
/**
 * scripts/clear-test-data.js
 *
 * Safe, manual script to remove test data inserted by E2E performance tests.
 * It will delete:
 *  - repair_orders where notes LIKE 'Seeded test repair order%'
 *  - vehicles where license_plate LIKE 'TEST-%'
 *  - customers linked to those vehicles
 *
 * Usage:
 *   node scripts/clear-test-data.js
 */

const fs = require("fs");
const path = require("path");

// Load .env.local into process.env if present
try {
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
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      if (!(key in process.env)) process.env[key] = value;
    });
  }
} catch (e) {
  console.warn("Could not load .env.local:", e && e.message ? e.message : String(e));
}

const { createClient } = require("@supabase/supabase-js");

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE;
  if (!url || !serviceRole) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_SERVICE_ROLE in environment.");
    process.exit(1);
  }
  return createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

(async function main() {
  const admin = createAdminClient();
  console.log("Connected to Supabase admin client.");

  try {
    // Delete repair orders with seeded notes
    console.log("Deleting seeded repair_orders (notes LIKE 'Seeded test repair order%')...");
    const { error: delOrdersErr, data: delOrders } = await admin
      .from("repair_orders")
      .delete()
      .like("notes", "Seeded test repair order%");
    if (delOrdersErr) console.warn("Error deleting repair_orders:", delOrdersErr.message || delOrdersErr);
    else console.log(`Deleted ${Array.isArray(delOrders) ? delOrders.length : 0} repair_orders`);
  } catch (e) {
    console.warn("Exception deleting repair_orders:", e && e.message ? e.message : String(e));
  }

  let customerIds = [];
  try {
    // Find vehicles with TEST- license plates
    console.log("Querying vehicles with license_plate LIKE 'TEST-%'...");
    const { data: vehiclesFound, error: vehErr } = await admin
      .from("vehicles")
      .select("id,customer_id,license_plate")
      .like("license_plate", "TEST-%");

    if (vehErr) console.warn("Error querying vehicles:", vehErr.message || vehErr);
    else {
      const cnt = Array.isArray(vehiclesFound) ? vehiclesFound.length : 0;
      console.log(`Found ${cnt} test vehicles`);
      if (Array.isArray(vehiclesFound)) {
        customerIds = vehiclesFound.map((v) => v.customer_id).filter(Boolean);
      }
    }
  } catch (e) {
    console.warn("Exception querying vehicles:", e && e.message ? e.message : String(e));
  }

  try {
    // Delete vehicles with TEST- prefix
    console.log("Deleting vehicles with license_plate LIKE 'TEST-%'...");
    const { error: delVehErr, data: delVeh } = await admin
      .from("vehicles")
      .delete()
      .like("license_plate", "TEST-%");
    if (delVehErr) console.warn("Error deleting vehicles:", delVehErr.message || delVehErr);
    else console.log(`Deleted ${Array.isArray(delVeh) ? delVeh.length : 0} vehicles`);
  } catch (e) {
    console.warn("Exception deleting vehicles:", e && e.message ? e.message : String(e));
  }

  try {
    // Delete customers linked to those vehicles
    if (customerIds.length > 0) {
      console.log(`Deleting ${customerIds.length} customers linked to test vehicles...`);
      const { error: delCustErr, data: delCust } = await admin
        .from("customers")
        .delete()
        .in("id", customerIds);
      if (delCustErr) console.warn("Error deleting customers:", delCustErr.message || delCustErr);
      else console.log(`Deleted ${Array.isArray(delCust) ? delCust.length : 0} customers`);
    } else {
      console.log("No linked customers found to delete.");
    }
  } catch (e) {
    console.warn("Exception deleting customers:", e && e.message ? e.message : String(e));
  }

  console.log("Finished cleanup.");
  process.exit(0);
})();
