#!/usr/bin/env node

/**
 * Database Seeding Script (JavaScript version)
 *
 * Seeds the database with random test data for all tables.
 * Run with: pnpm db:seed
 */

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error(
    "Missing Supabase credentials in .env file. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE are set.",
  );
}

const client = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Utility functions for generating random data
const randomId = () => Math.random().toString(36).substring(2, 9);
const randomPhone = () =>
  `090${Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, "0")}`;
const randomEmail = () => `user-${randomId()}@garage.test`;
const randomString = (length) =>
  Math.random().toString(36).substring(2, length);
const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomBrand = () => {
  const brands = [
    "Toyota",
    "Honda",
    "BMW",
    "Mercedes",
    "Audi",
    "Ford",
    "Chevrolet",
    "Nissan",
    "Volkswagen",
    "Hyundai",
  ];
  return brands[Math.floor(Math.random() * brands.length)];
};
const randomLicensePlate = () =>
  `${randomString(3).toUpperCase()}-${randomNumber(100, 999)}`;
const randomDate = (daysBack = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - randomNumber(0, daysBack));
  return date.toISOString().split("T")[0];
};

async function seedDatabase() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // Clean up existing auth users to avoid duplicates (profiles untouched directly)
    console.log("🧹 Cleaning up existing auth users...");
    try {
      const { data: users } = await client.auth.admin.listUsers();
      if (users && users.users.length > 0) {
        for (const user of users.users) {
          try {
            await client.auth.admin.deleteUser(user.id);
          } catch (_err) {
            // Ignore individual deletion failures to keep seeding moving
          }
        }
        console.log(`  ✅ Cleaned up ${users.users.length} users\n`);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (cleanupError) {
      console.warn(
        `  ⚠️  Could not clean existing users: ${cleanupError.message}\n`,
      );
    }

    // Create one default auth user + profile
    console.log("👤 Creating default profile...");
    const defaultEmail = "saladegg24@gmail.com";
    const defaultPassword = "123456";

    try {
      const { data: authUser, error: authError } =
        await client.auth.admin.createUser({
          email: defaultEmail,
          password: defaultPassword,
          email_confirm: true,
          user_metadata: { is_garage_admin: true },
        });

      if (authError) {
        console.warn(
          `  ⚠️  Could not create default auth user: ${authError.message}`,
        );
      } else if (authUser?.user) {
        // Ensure no leftover profile with the same id
        await client.from("profiles").delete().eq("id", authUser.user.id);

        const { error: profileError } = await client.from("profiles").insert({
          id: authUser.user.id,
          email: defaultEmail,
          full_name: "Default User",
          role: "admin",
        });

        if (profileError) {
          console.warn(
            `  ⚠️  Could not create default profile: ${profileError.message}`,
          );
        } else {
          console.log("  ✅ Default profile created\n");
        }
      }
    } catch (err) {
      console.warn(`  ⚠️  Could not create default profile: ${err.message}\n`);
    }

    // 0. Create customers
    console.log("👥 Creating customers...");
    const customerIds = [];
    const customers = [];

    for (let i = 0; i < randomNumber(5, 10); i++) {
      customers.push({
        name: `Customer ${i + 1}`,
        phone: randomPhone(),
        email: randomEmail(),
        address: `${randomNumber(1, 999)} Main Street, City ${i + 1}`,
      });
    }

    const { data: insertedCustomers } = await client
      .from("customers")
      .insert(customers)
      .select();

    if (insertedCustomers) {
      customerIds.push(...insertedCustomers.map((c) => c.id));
      console.log(`  ✅ Created ${customerIds.length} customers\n`);
    }

    // 1. Create vehicles
    console.log("🚗 Creating vehicles...");
    const vehicleIds = [];
    const vehicles = [];

    for (let i = 0; i < randomNumber(5, 10); i++) {
      vehicles.push({
        license_plate: randomLicensePlate(),
        brand: randomBrand(),
        customer_id: customerIds[i % customerIds.length],
        total_paid: randomNumber(0, 5000000),
      });
    }

    const { data: insertedVehicles } = await client
      .from("vehicles")
      .insert(vehicles)
      .select();

    if (insertedVehicles) {
      vehicleIds.push(...insertedVehicles.map((v) => v.id));
      console.log(`  ✅ Created ${vehicleIds.length} vehicles\n`);
    }

    // 2. Create spare parts
    console.log("🔧 Creating spare parts...");
    const spareParts = [
      { name: "Engine Oil", price: 150000, stock_quantity: 20 },
      { name: "Air Filter", price: 100000, stock_quantity: 15 },
      { name: "Brake Pads", price: 500000, stock_quantity: 10 },
      { name: "Spark Plugs", price: 200000, stock_quantity: 25 },
      { name: "Battery", price: 2000000, stock_quantity: 5 },
      { name: "Radiator Coolant", price: 120000, stock_quantity: 12 },
      { name: "Transmission Fluid", price: 180000, stock_quantity: 8 },
      { name: "Headlight Bulb", price: 80000, stock_quantity: 30 },
      { name: "Windshield Wipers", price: 120000, stock_quantity: 20 },
      { name: "Tire Patch Kit", price: 50000, stock_quantity: 40 },
    ];

    const sparePartIds = [];
    const { data: insertedParts } = await client
      .from("spare_parts")
      .insert(spareParts)
      .select();

    if (insertedParts) {
      sparePartIds.push(...insertedParts.map((p) => p.id));
      console.log(`  ✅ Created ${sparePartIds.length} spare parts\n`);
    }

    // 3. Create labor types
    console.log("⚙️  Creating labor types...");
    const laborTypes = [
      { name: "Oil Change", cost: 200000 },
      { name: "Brake Inspection", cost: 250000 },
      { name: "Tire Rotation", cost: 150000 },
      { name: "Engine Diagnostic", cost: 300000 },
      { name: "Battery Replacement", cost: 350000 },
      { name: "Radiator Flush", cost: 280000 },
      { name: "Transmission Service", cost: 400000 },
      { name: "Air Conditioning Service", cost: 320000 },
    ];

    const laborTypeIds = [];
    const { data: insertedLabor } = await client
      .from("labor_types")
      .insert(laborTypes)
      .select();

    if (insertedLabor) {
      laborTypeIds.push(...insertedLabor.map((l) => l.id));
      console.log(`  ✅ Created ${laborTypeIds.length} labor types\n`);
    }

    // 4. Create repair orders
    console.log("📋 Creating repair orders...");
    const repairOrderIds = [];
    const repairOrders = [];

    for (let i = 0; i < randomNumber(5, 10); i++) {
      repairOrders.push({
        vehicle_id: vehicleIds[i % vehicleIds.length],
        status: ["pending", "completed"][randomNumber(0, 1)],
        reception_date: randomDate(60),
        total_amount: randomNumber(500000, 10000000),
        notes: `Repair work for vehicle ${i + 1}`,
      });
    }

    const { data: insertedOrders, error: ordersError } = await client
      .from("repair_orders")
      .insert(repairOrders)
      .select();

    if (ordersError) {
      console.warn(`  ⚠️  Error creating repair orders: ${ordersError.message}`);
    } else if (insertedOrders) {
      repairOrderIds.push(...insertedOrders.map((o) => o.id));
      console.log(`  ✅ Created ${repairOrderIds.length} repair orders\n`);
    } else {
      console.log("  ✅ Created 0 repair orders\n");
    }

    // 5. Create repair order items
    console.log("📦 Creating repair order items...");
    let repairOrderItemsCount = 0;

    if (repairOrderIds.length > 0) {
      const repairOrderItems = [];

      for (let i = 0; i < repairOrderIds.length; i++) {
        const numItems = randomNumber(2, 4);

        for (let j = 0; j < numItems; j++) {
          const isSpare = Math.random() > 0.3; // 70% spare parts, 30% labor

          if (isSpare) {
            const part = sparePartIds[j % sparePartIds.length];
            const quantity = randomNumber(1, 5);
            const unitPrice = 150000 + randomNumber(0, 100000);

            repairOrderItems.push({
              repair_order_id: repairOrderIds[i],
              spare_part_id: part,
              quantity,
              unit_price: unitPrice,
              total_amount: unitPrice * quantity,
              description: `Spare part ${j + 1}`,
            });
          } else {
            const labor = laborTypeIds[j % laborTypeIds.length];
            const laborCost = 200000 + randomNumber(0, 200000);

            repairOrderItems.push({
              repair_order_id: repairOrderIds[i],
              labor_type_id: labor,
              labor_cost: laborCost,
              total_amount: laborCost,
              description: `Labor work ${j + 1}`,
            });
          }
        }
      }

      if (repairOrderItems.length > 0) {
        const { data: insertedItems, error: itemError } = await client
          .from("repair_order_items")
          .insert(repairOrderItems)
          .select();

        if (itemError) {
          console.warn(
            `  ⚠️  Error creating repair order items: ${itemError.message}`,
          );
        } else if (insertedItems) {
          repairOrderItemsCount = insertedItems.length;
          console.log(
            `  ✅ Created ${repairOrderItemsCount} repair order items\n`,
          );
        }
      }
    } else {
      console.log("  ✅ Created 0 repair order items\n");
    }

    // 6. Create payments
    console.log("💰 Creating payments...");
    const payments = [];

    for (let i = 0; i < randomNumber(5, 10); i++) {
      payments.push({
        vehicle_id: vehicleIds[i % vehicleIds.length],
        amount: randomNumber(100000, 2000000),
        payment_method: "cash",
        payment_date: randomDate(30),
      });
    }

    const { data: insertedPayments, error: paymentsError } = await client
      .from("payments")
      .insert(payments)
      .select();

    if (paymentsError) {
      console.warn(`  ⚠️  Error creating payments: ${paymentsError.message}`);
    } else if (insertedPayments) {
      console.log(`  ✅ Created ${insertedPayments.length} payments\n`);
    } else {
      console.log("  ✅ Created 0 payments\n");
    }

    console.log("✨ Database seeding completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`  - Customers: ${customerIds.length}`);
    console.log(`  - Vehicles: ${vehicleIds.length}`);
    console.log(`  - Spare Parts: ${sparePartIds.length}`);
    console.log(`  - Labor Types: ${laborTypeIds.length}`);
    console.log(`  - Repair Orders: ${repairOrderIds.length}`);
    console.log(`  - Repair Order Items: ${repairOrderItemsCount}`);
    console.log(`  - Payments: ${insertedPayments?.length || 0}\n`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
