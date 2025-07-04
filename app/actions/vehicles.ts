"use server";

import { createClient } from "@/supabase/server";
import {
  VehicleReceptionFormData,
  VehicleReceptionFormSchema,
} from "@/lib/form/definitions";
import { ApiResponse } from "@/types/types";
import { VehicleWithDebt } from "@/types/types";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { VehicleRegistration } from "../(protected)/reception/columns";

interface FetchVehicleRegistrationParams {
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export async function createReception(
  data: VehicleReceptionFormData,
): Promise<ApiResponse<{ success: true }>> {
  try {
    console.log("Starting createReception with data:", data);
    const supabase = await createClient();

    // Get current user
    console.log("Fetching current user...");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Authentication failed:", userError);
      return {
        error: new Error("Authentication required"),
        data: undefined,
      };
    }
    console.log("User authenticated:", user.id);

    // Validate the form data
    console.log("Validating form data...");
    const validatedData = VehicleReceptionFormSchema.safeParse(data);

    if (!validatedData.success) {
      console.error("Form validation failed:", validatedData.error);
      return {
        error: new Error("Invalid form data"),
        data: undefined,
      };
    }
    const formData = validatedData.data;
    console.log("Form data validated successfully");

    // Check if customer already exists
    console.log(
      "Checking for existing customer with phone:",
      formData.phoneNumber,
    );
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", formData.phoneNumber)
      .single();

    let customerId = existingCustomer?.id;

    if (!customerId) {
      console.log("Creating new customer...");
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
        console.error("Failed to create customer:", customerError);
        return {
          error: new Error("Failed to create customer"),
          data: undefined,
        };
      }
      customerId = customer.id;
      console.log("Customer created successfully with ID:", customerId);
    } else {
      console.log("Using existing customer ID:", customerId);
    }

    // Check if vehicle already exists
    console.log(
      "Checking for existing vehicle with license plate:",
      formData.licensePlate,
    );
    const { data: existingVehicle } = await supabase
      .from("vehicles")
      .select("id")
      .eq("license_plate", formData.licensePlate)
      .single();

    let vehicleId = existingVehicle?.id;

    if (!vehicleId) {
      console.log("Creating new vehicle...");
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
        console.error("Failed to create vehicle:", vehicleError);
        return {
          error: new Error("Failed to create vehicle"),
          data: undefined,
        };
      }
      vehicleId = vehicle.id;
      console.log("Vehicle created successfully with ID:", vehicleId);
    } else {
      console.log("Using existing vehicle ID:", vehicleId);
    }

    // Create repair order (no customer_id since it's linked through vehicle)
    console.log("Creating repair order...");
    const { error: repairOrderError } = await supabase
      .from("repair_orders")
      .insert({
        vehicle_id: vehicleId,
        created_by: user.id,
        status: "pending",
        reception_date: format(formData.receptionDate, "yyyy-MM-dd"),
        notes: formData.notes || null,
        total_amount: 0,
      });

    if (repairOrderError) {
      console.error("Failed to create repair order:", repairOrderError);
      return {
        error: new Error("Failed to create repair order"),
        data: undefined,
      };
    }
    console.log("Repair order created successfully");

    console.log("Revalidating paths...");
    revalidatePath("/vehicles");
    console.log("createReception completed successfully");

    return {
      error: null,
      data: { success: true },
    };
  } catch (error) {
    console.error("Reception creation error:", error);
    return {
      error: error instanceof Error
        ? error
        : new Error("Something went wrong. Please try again."),
      data: undefined,
    };
  }
}

export async function handleVehiclePayment(
  vehicleId: string,
  amount: number,
  paymentMethod: string = "cash",
): Promise<ApiResponse<{ success: true }>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        error: new Error("Authentication required"),
        data: undefined,
      };
    }

    // Validate that there's outstanding debt for this vehicle
    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select(`
        id,
        total_paid,
        repair_orders (
          total_amount
        ),
        payments (
          amount
        )
      `)
      .eq("id", vehicleId)
      .single();

    if (vehicleError) {
      console.error("Vehicle fetch error:", vehicleError);
      return {
        error: new Error("Failed to fetch vehicle data"),
        data: undefined,
      };
    }

    // Calculate current debt
    const totalRepairCosts = vehicle.repair_orders?.reduce((sum, order) =>
      sum + (order.total_amount || 0), 0) || 0;
    const totalPaid = vehicle.payments?.reduce((sum, payment) =>
      sum + payment.amount, 0) || 0;
    const remainingDebt = totalRepairCosts - totalPaid;

    if (remainingDebt <= 0) {
      return {
        error: new Error("No outstanding debt found for this vehicle"),
        data: undefined,
      };
    }

    if (amount > remainingDebt) {
      return {
        error: new Error(
          `Payment amount (${amount}) exceeds remaining debt (${remainingDebt})`,
        ),
        data: undefined,
      };
    }

    // Insert new payment record
    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        vehicle_id: vehicleId,
        amount: amount,
        payment_method: paymentMethod,
        created_by: user.id,
        payment_date: new Date().toISOString().split("T")[0], // Today's date
      });

    if (paymentError) {
      console.error("Payment insertion error:", paymentError);
      return {
        error: new Error(paymentError.message),
        data: undefined,
      };
    }

    // Update vehicle's total_paid
    const newTotalPaid = totalPaid + amount;
    const { error: updateError } = await supabase
      .from("vehicles")
      .update({ total_paid: newTotalPaid })
      .eq("id", vehicleId);

    if (updateError) {
      console.error("Vehicle update error:", updateError);
      return {
        error: new Error("Failed to update vehicle payment total"),
        data: undefined,
      };
    }

    revalidatePath("/vehicles");
    revalidatePath("/reception");
    revalidatePath("/debt-management");
    return {
      error: null,
      data: { success: true },
    };
  } catch (error) {
    console.error("Error processing payment:", error);
    return {
      error: error instanceof Error
        ? error
        : new Error("Failed to process payment"),
      data: undefined,
    };
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

export async function fetchSparePartsAndLaborTypes() {
  const supabase = await createClient();

  try {
    const [sparePartsResponse, laborTypesResponse] = await Promise.all([
      supabase.from("spare_parts").select("*").order("name"),
      supabase.from("labor_types").select("*").order("name"),
    ]);

    if (sparePartsResponse.error) throw sparePartsResponse.error;
    if (laborTypesResponse.error) throw laborTypesResponse.error;

    return {
      spareParts: sparePartsResponse.data,
      laborTypes: laborTypesResponse.data,
    };
  } catch (error) {
    console.error("Error fetching spare parts and labor types:", error);
    return { error: "Failed to fetch spare parts and labor types" };
  }
}

export async function fetchExistingRepairOrderItems(repairOrderId: string) {
  const supabase = await createClient();

  try {
    const { data: items, error } = await supabase
      .from("repair_order_items")
      .select(
        `
        *,
        spare_part:spare_parts(id, name, price),
        labor_type:labor_types(id, name, cost),
        assigned_employee:profiles(id, full_name, role)
      `,
      )
      .eq("repair_order_id", repairOrderId);

    if (error) throw error;

    return { items };
  } catch (error) {
    console.error("Error fetching existing repair order items:", error);
    return { error: "Failed to fetch existing repair order items" };
  }
}

export async function updateRepairOrder(
  repairOrderId: string,
  totalAmount: number,
  orderItems: Array<{
    description: string;
    spare_part_id: string | null;
    quantity: number;
    unit_price: number;
    labor_type_id: string | null;
    labor_cost: number;
    total_amount: number;
  }>,
) {
  const supabase = await createClient();

  try {
    // Update the repair order total
    const { error: orderError } = await supabase
      .from("repair_orders")
      .update({ total_amount: totalAmount })
      .eq("id", repairOrderId);

    if (orderError) throw orderError;

    // Delete existing items
    const { error: deleteError } = await supabase
      .from("repair_order_items")
      .delete()
      .eq("repair_order_id", repairOrderId);

    if (deleteError) throw deleteError;

    // Insert new items
    if (orderItems.length > 0) {
      const itemsToInsert = orderItems.map((item) => ({
        repair_order_id: repairOrderId,
        ...item,
      }));

      const { error: itemsError } = await supabase
        .from("repair_order_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    revalidatePath("/vehicles");
    return { success: true };
  } catch (error) {
    console.error("Error updating repair order:", error);
    return { error: "Failed to update repair order" };
  }
}

// Smart update repair order that handles CRUD operations properly
export async function updateRepairOrderSmart(
  repairOrderId: string,
  totalAmount: number,
  changes: {
    newItems: Array<{
      description: string;
      spare_part_id: string | null;
      quantity: number;
      unit_price: number;
      labor_type_id: string | null;
      labor_cost: number;
      total_amount: number;
      assigned_to: string | null;
    }>;
    updatedItems: Array<{
      id: string;
      description: string;
      spare_part_id: string | null;
      quantity: number;
      unit_price: number;
      labor_type_id: string | null;
      labor_cost: number;
      total_amount: number;
      assigned_to: string | null;
    }>;
    deletedItemIds: string[];
  },
) {
  const supabase = await createClient();

  try {
    // Update the repair order total
    const { error: orderError } = await supabase
      .from("repair_orders")
      .update({ total_amount: totalAmount })
      .eq("id", repairOrderId);

    if (orderError) throw orderError;

    // Delete removed items
    if (changes.deletedItemIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("repair_order_items")
        .delete()
        .in("id", changes.deletedItemIds);

      if (deleteError) throw deleteError;
    }

    // Update existing items
    if (changes.updatedItems.length > 0) {
      for (const item of changes.updatedItems) {
        const { error: updateError } = await supabase
          .from("repair_order_items")
          .update({
            description: item.description,
            spare_part_id: item.spare_part_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            labor_type_id: item.labor_type_id,
            labor_cost: item.labor_cost,
            total_amount: item.total_amount,
          })
          .eq("id", item.id);

        if (updateError) throw updateError;
      }
    }

    // Insert new items
    if (changes.newItems.length > 0) {
      const itemsToInsert = changes.newItems.map((item) => ({
        repair_order_id: repairOrderId,
        ...item,
      }));

      const { error: insertError } = await supabase
        .from("repair_order_items")
        .insert(itemsToInsert);

      if (insertError) throw insertError;
    }

    revalidatePath("/vehicles");
    return { success: true };
  } catch (error) {
    console.error("Error updating repair order:", error);
    return { error: "Failed to update repair order" };
  }
}

export async function fetchVehicleRegistrationWithDateRange(
  params: FetchVehicleRegistrationParams = {},
): Promise<ApiResponse<VehicleRegistration[]>> {
  const supabase = await createClient();
  const { from, to, limit = 100, offset = 0 } = params;

  try {
    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        error: new Error("Authentication required"),
        data: undefined,
      };
    }

    let query = supabase
      .from("repair_orders")
      .select(
        `
        *,
        vehicle:vehicles(
          *,
          customer:customers(*)
        )
      `,
      )
      .order("created_at", { ascending: false });

    // Apply date range filter if provided - filter by created_at
    if (from) {
      // Start of the day (00:00:00) in UTC
      const fromStart = new Date(from);
      fromStart.setUTCHours(0, 0, 0, 0);
      query = query.gte("created_at", fromStart.toISOString());
    }
    if (to) {
      // End of the day (23:59:59.999) in UTC
      const toEnd = new Date(to);
      toEnd.setUTCHours(23, 59, 59, 999);
      query = query.lte("created_at", toEnd.toISOString());
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Fetch total repair costs and payments for all vehicles in the result set
    const vehicleIds = data?.map((repairOrder) => {
      const vehicle = Array.isArray(repairOrder.vehicle)
        ? repairOrder.vehicle[0]
        : repairOrder.vehicle;
      return vehicle?.id;
    }).filter(Boolean) || [];

    const vehicleDebts: Record<
      string,
      { totalRepairs: number; totalPaid: number }
    > = {};

    if (vehicleIds.length > 0) {
      // Get total repair costs per vehicle
      const { data: repairTotals } = await supabase
        .from("repair_orders")
        .select("vehicle_id, total_amount")
        .in("vehicle_id", vehicleIds);

      // Get total payments per vehicle
      const { data: paymentTotals } = await supabase
        .from("payments")
        .select("vehicle_id, amount")
        .in("vehicle_id", vehicleIds);

      // Calculate totals per vehicle
      vehicleIds.forEach((vehicleId) => {
        const totalRepairs = repairTotals?.filter((r) =>
          r.vehicle_id === vehicleId
        )
          .reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;
        const totalPaid = paymentTotals?.filter((p) =>
          p.vehicle_id === vehicleId
        )
          .reduce((sum, p) => sum + p.amount, 0) || 0;

        vehicleDebts[vehicleId] = { totalRepairs, totalPaid };
      });
    }

    return {
      error: null,
      data: data?.map((repairOrder) => {
        const vehicle = Array.isArray(repairOrder.vehicle)
          ? repairOrder.vehicle[0]
          : repairOrder.vehicle;
        const customer = Array.isArray(vehicle?.customer)
          ? vehicle.customer[0]
          : vehicle?.customer;

        // Calculate debt for this vehicle using aggregated data
        const vehicleDebt = vehicleDebts[vehicle?.id] ||
          { totalRepairs: 0, totalPaid: 0 };
        const debt = Math.max(
          0,
          vehicleDebt.totalRepairs - vehicleDebt.totalPaid,
        );

        return {
          vehicle: vehicle,
          customer: customer,
          repair_order: {
            id: repairOrder.id,
            vehicle_id: repairOrder.vehicle_id,
            created_by: repairOrder.created_by,
            status: repairOrder.status,
            reception_date: repairOrder.reception_date,
            completion_date: repairOrder.completion_date,
            notes: repairOrder.notes,
            total_amount: repairOrder.total_amount,
            created_at: repairOrder.created_at,
            updated_at: repairOrder.updated_at,
          },
          debt: debt,
        };
      }) || [],
      totalCount: count || 0,
    };
  } catch (error) {
    console.error(
      "Error fetching vehicle registration with date range:",
      error,
    );
    return {
      error: new Error("Failed to fetch vehicle registration"),
      data: [],
      totalCount: 0,
    };
  }
}

export async function fetchPaymentHistory(vehicleId: string) {
  const supabase = await createClient();

  try {
    const { data: payments, error } = await supabase
      .from("payments")
      .select(`
        *,
        created_by_profile:profiles(full_name)
      `)
      .eq("vehicle_id", vehicleId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { payments };
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return { error: "Failed to fetch payment history" };
  }
}

export async function fetchVehiclesWithDebt(): Promise<
  ApiResponse<VehicleWithDebt[]>
> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        error: new Error("Authentication required"),
        data: undefined,
      };
    }

    // Fetch all vehicles with their customers, repair orders, and payments
    const { data: vehicles, error } = await supabase
      .from("vehicles")
      .select(`
        id,
        license_plate,
        brand,
        total_paid,
        created_at,
        customer:customers (
          id,
          name,
          phone,
          email
        ),
        repair_orders (
          id,
          total_amount,
          status
        ),
        payments (
          id,
          amount,
          payment_date
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Calculate debt for each vehicle
    const vehiclesWithDebt: VehicleWithDebt[] = vehicles?.map((vehicle) => {
      const customer = Array.isArray(vehicle.customer)
        ? vehicle.customer[0]
        : vehicle.customer;
      const totalRepairCosts = vehicle.repair_orders?.reduce((sum, order) =>
        sum + (order.total_amount || 0), 0) || 0;
      const totalPaid = vehicle.payments?.reduce((sum, payment) =>
        sum + payment.amount, 0) || 0;
      const totalDebt = Math.max(0, totalRepairCosts - totalPaid);

      return {
        id: vehicle.id,
        license_plate: vehicle.license_plate,
        brand: vehicle.brand,
        customer: customer,
        total_repair_cost: totalRepairCosts,
        total_paid: totalPaid,
        total_debt: totalDebt,
        created_at: vehicle.created_at,
      };
    }) || [];

    return {
      error: null,
      data: vehiclesWithDebt,
    };
  } catch (error) {
    console.error("Error fetching vehicles with debt:", error);
    return {
      error: error instanceof Error
        ? error
        : new Error("Failed to fetch vehicles"),
      data: undefined,
    };
  }
}
