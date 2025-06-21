"use server";

import { createClient } from "@/lib/supabase/server";
import {
  VehicleReceptionFormSchema,
  VehicleReceptionFormData,
} from "@/lib/form/definitions";
import { VehicleWithDetails } from "@/types/types";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export async function createReception(data: VehicleReceptionFormData) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Authentication required" };
  }

  // Validate the form data
  const validatedData = VehicleReceptionFormSchema.safeParse(data);

  if (!validatedData.success) {
    return { error: "Invalid form data" };
  }
  const formData = validatedData.data;

  try {
    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", formData.phoneNumber)
      .single();

    let customerId = existingCustomer?.id;

    if (!customerId) {
      // Create new customer
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({
          name: formData.customerName,
          phone: formData.phoneNumber,
          address: formData.address || null,
        })
        .select("id")
        .single();

      if (customerError) {
        return { error: "Failed to create customer" };
      }
      customerId = customer.id;
    }

    // Check if vehicle already exists
    const { data: existingVehicle } = await supabase
      .from("vehicles")
      .select("id")
      .eq("license_plate", formData.licensePlate)
      .single();

    let vehicleId = existingVehicle?.id;

    if (!vehicleId) {
      // Create new vehicle
      const { data: vehicle, error: vehicleError } = await supabase
        .from("vehicles")
        .insert({
          license_plate: formData.licensePlate,
          brand: formData.carBrand,
          customer_id: customerId,
        })
        .select("id")
        .single();

      if (vehicleError) {
        return { error: "Failed to create vehicle" };
      }
      vehicleId = vehicle.id;
    }

    // Create repair order
    const { error: repairOrderError } = await supabase
      .from("repair_orders")
      .insert({
        vehicle_id: vehicleId,
        customer_id: customerId,
        created_by: user.id,
        status: "pending",
        reception_date: format(formData.receptionDate, "yyyy-MM-dd"),
        notes: formData.notes || null,
        total_amount: 0,
        paid_amount: 0,
      });

    if (repairOrderError) {
      return { error: "Failed to create repair order" };
    }

    revalidatePath("/vehicles");
    return { success: true };
  } catch (error) {
    console.error("Reception creation error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function fetchVehiclesWithRange(
  dateFrom: string,
  dateTo: string
): Promise<VehicleWithDetails[]> {
  const supabase = await createClient();

  try {
    // First get all vehicles with customers
    const { data: vehicles, error: vehiclesError } = await supabase
      .from("vehicles")
      .select(
        `
        *,
        customer:customers(*)
      `
      )
      .order("created_at", { ascending: false });

    if (vehiclesError) throw vehiclesError;

    // Then get repair orders within the date range for each vehicle
    const vehicleIds = vehicles?.map((v) => v.id) || [];

    if (vehicleIds.length === 0) {
      return [];
    }

    const { data: repairOrders, error: ordersError } = await supabase
      .from("repair_orders")
      .select("*")
      .in("vehicle_id", vehicleIds)
      .gte("reception_date", dateFrom)
      .lte("reception_date", dateTo)
      .order("reception_date", { ascending: false });

    if (ordersError) throw ordersError;

    // Combine vehicles with their filtered repair orders
    const vehiclesWithOrders: VehicleWithDetails[] =
      vehicles?.map((vehicle) => ({
        ...vehicle,
        repair_orders:
          repairOrders?.filter((order) => order.vehicle_id === vehicle.id) ||
          [],
      })) || [];

    return vehiclesWithOrders;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw new Error("Failed to fetch vehicles");
  }
}

export async function removeVehicle(vehicleId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", vehicleId);

    if (error) throw error;

    revalidatePath("/vehicles");
    return { success: true };
  } catch (error) {
    console.error("Error removing vehicle:", error);
    return { error: "Failed to remove vehicle" };
  }
}
