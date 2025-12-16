"use server";

import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/types";

export interface PaymentReceiptData {
  id: string;
  amount: number;
  payment_method: string;
  payment_date: string | null;
  created_at: string;
  vehicle: {
    id: string;
    license_plate: string;
    brand: string;
    customer: {
      id: string;
      name: string;
      phone: string | null;
      email: string | null;
    };
  };
  created_by_profile?: {
    full_name: string | null;
    email: string;
  };
  repair_orders: Array<{
    id: string;
    status: string;
    total_amount: number | null;
    reception_date: string | null;
    completion_date: string | null;
    repair_order_items: Array<{
      id: string;
      description: string;
      quantity: number;
      unit_price: number;
      total_amount: number;
      spare_part_id: string | null;
      labor_type_id: string | null;
      spare_part?: {
        id: string;
        name: string;
        price: number;
      };
      labor_type?: {
        id: string;
        name: string;
        cost: number;
      };
    }>;
  }>;
}

/**
 * Fetch detailed payment receipt information including repair orders and line items
 */
export async function fetchPaymentReceiptDetails(
  paymentId: string,
): Promise<ApiResponse<PaymentReceiptData>> {
  try {
    const supabase = await createClient();

    // Get the payment details first
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select(`
        *,
        vehicle:vehicles(
          *,
          customer:customers(*)
        ),
        created_by_profile:profiles!payments_created_by_fkey(
          full_name,
          email
        )
      `)
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      return {
        data: undefined,
        error: new Error(paymentError?.message || "Payment not found"),
      };
    }

    // Get repair orders for this vehicle up to the payment date in parallel
    const { data: repairOrders, error: ordersError } = await supabase
      .from("repair_orders")
      .select(`
        *,
        repair_order_items(
          *,
          spare_part:spare_parts(
            id,
            name,
            price
          ),
          labor_type:labor_types(
            id,
            name,
            cost
          )
        )
      `)
      .eq("vehicle_id", payment.vehicle.id)
      .lte("created_at", payment.payment_date || payment.created_at)
      .order("created_at", { ascending: false });

    // Don't fail if repair orders can't be fetched - just show empty array
    const receiptData: PaymentReceiptData = {
      id: payment.id,
      amount: payment.amount,
      payment_method: payment.payment_method,
      payment_date: payment.payment_date,
      created_at: payment.created_at,
      vehicle: payment.vehicle,
      created_by_profile: payment.created_by_profile,
      repair_orders: ordersError ? [] : repairOrders || [],
    };

    return {
      data: receiptData,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching payment receipt details:", error);
    return {
      data: undefined,
      error:
        error instanceof Error ? error : new Error("Unknown error occurred"),
    };
  }
}
