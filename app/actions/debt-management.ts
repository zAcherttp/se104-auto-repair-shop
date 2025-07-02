import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiResponse, VehicleDebt } from "@/types/debt-management";

export async function getVehicleDebts(
  dateRange?: { from: Date; to: Date },
  searchTerm?: string,
): Promise<ApiResponse<VehicleDebt[]>> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect("/login");
    }

    // Build query for vehicles with related data
    let query = supabase
      .from("vehicles")
      .select(`
        id,
        license_plate,
        brand,
        total_paid,
        customer:customers (
          id,
          name,
          phone,
          email
        ),
        repair_orders (
          id,
          total_amount,
          status,
          reception_date,
          created_at
        ),
        payments (
          id,
          amount,
          payment_method,
          payment_date,
          created_at
        )
      `);

    // Apply search filter
    if (searchTerm) {
      query = query.or(
        `license_plate.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`,
      );
    }

    const { data: vehicles, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;

    // Process vehicles and calculate debts
    const vehicleDebts: VehicleDebt[] = [];

    vehicles?.forEach((vehicle) => {
      // Handle the customer as an array from the query result
      const customer = Array.isArray(vehicle.customer)
        ? vehicle.customer[0]
        : vehicle.customer;

      if (!customer) return;

      // Filter repair orders by date range if provided
      let filteredRepairOrders = vehicle.repair_orders || [];
      if (dateRange?.from && dateRange?.to) {
        const fromDate = dateRange.from.toISOString().split("T")[0];
        const toDate = dateRange.to.toISOString().split("T")[0];
        filteredRepairOrders = filteredRepairOrders.filter((order) => {
          return order.reception_date >= fromDate &&
            order.reception_date <= toDate;
        });
      }

      // Calculate totals
      const totalDebt = filteredRepairOrders.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0,
      );
      const totalPaid = vehicle.payments?.reduce((sum, payment) =>
        sum + payment.amount, 0) || 0;
      const remainingDebt = Math.max(0, totalDebt - totalPaid);

      // Only include vehicles with debt or payments
      if (totalDebt > 0 || totalPaid > 0) {
        vehicleDebts.push({
          vehicle: {
            id: vehicle.id,
            license_plate: vehicle.license_plate,
            brand: vehicle.brand,
            customer: customer,
          },
          repair_orders: filteredRepairOrders,
          payments: vehicle.payments || [],
          total_debt: totalDebt,
          total_paid: totalPaid,
          remaining_debt: remainingDebt,
        });
      }
    });

    // Apply additional search filter to processed results
    let filteredResults = vehicleDebts;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredResults = vehicleDebts.filter((debt) =>
        debt.vehicle.license_plate.toLowerCase().includes(searchLower) ||
        debt.vehicle.customer.name.toLowerCase().includes(searchLower) ||
        debt.vehicle.brand.toLowerCase().includes(searchLower) ||
        debt.vehicle.customer.phone?.toLowerCase().includes(searchLower) ||
        debt.vehicle.customer.email?.toLowerCase().includes(searchLower)
      );
    }

    // Filter out vehicles with no remaining debt
    filteredResults = filteredResults.filter((debt) => debt.remaining_debt > 0);

    return {
      success: true,
      data: filteredResults,
    };
  } catch (error) {
    console.error("Error fetching vehicle debts:", error);
    return {
      success: false,
      error: "Failed to fetch vehicle debts",
    };
  }
}

export async function processPayment(
  vehicleId: string,
  amount: number,
  paymentMethod: string = "cash",
): Promise<ApiResponse> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect("/login");
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

    if (vehicleError) throw vehicleError;

    // Calculate current debt
    const totalRepairCosts = vehicle.repair_orders?.reduce((sum, order) =>
      sum + (order.total_amount || 0), 0) || 0;
    const totalPaid = vehicle.payments?.reduce((sum, payment) =>
      sum + payment.amount, 0) || 0;
    const remainingDebt = totalRepairCosts - totalPaid;

    if (remainingDebt <= 0) {
      return {
        success: false,
        error: "No outstanding debt found for this vehicle",
      };
    }

    if (amount > remainingDebt) {
      return {
        success: false,
        error:
          `Payment amount (${amount}) exceeds remaining debt (${remainingDebt})`,
      };
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        vehicle_id: vehicleId,
        amount,
        payment_method: paymentMethod,
        created_by: user.id,
        payment_date: new Date().toISOString().split("T")[0], // Today's date
      })
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    // Update vehicle's total_paid
    const newTotalPaid = totalPaid + amount;
    const { error: updateError } = await supabase
      .from("vehicles")
      .update({ total_paid: newTotalPaid })
      .eq("id", vehicleId);

    if (updateError) {
      throw updateError;
    }

    revalidatePath("/debt-management");
    return { success: true, data: payment };
  } catch (error) {
    console.error("Error processing payment:", error);
    return { success: false, error: "Failed to process payment" };
  }
}
