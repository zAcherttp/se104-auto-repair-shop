"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/supabase/client";
import { RepairOrderWithItemsDetails } from "@/types/types";

export function useRepairOrderDetails(orderId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["repair-order-details", orderId],
    queryFn: async (): Promise<RepairOrderWithItemsDetails> => {
      if (!orderId) {
        throw new Error("Order ID is required");
      }

      const { data, error } = await supabase
        .from("repair_orders")
        .select(`
          *,
          repair_order_items(
            *,
            spare_part:spare_parts(*),
            labor_type:labor_types(*)
          )
        `)
        .eq("id", orderId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!orderId,
  });
}
