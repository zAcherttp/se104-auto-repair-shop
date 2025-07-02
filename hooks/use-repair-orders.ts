"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/supabase/client";
import { RepairOrderWithVehicleDetails } from "@/types/types";
import { DateRange } from "react-day-picker";

export function useRepairOrders(dateRange?: DateRange) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["repair-orders", dateRange],
    queryFn: async (): Promise<RepairOrderWithVehicleDetails[]> => {
      let query = supabase
        .from("repair_orders")
        .select(`
          *,
          vehicle:vehicles(
            *,
            customer:customers(*),
            payments(*)
          )
        `)
        .order("reception_date", { ascending: false });

      // Apply date range filter if provided
      if (dateRange?.from) {
        query = query.gte(
          "reception_date",
          dateRange.from.toISOString().split("T")[0],
        );
      }
      if (dateRange?.to) {
        query = query.lte(
          "reception_date",
          dateRange.to.toISOString().split("T")[0],
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: true,
  });
}

export function useUpdateRepairOrderStatus() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      const { data, error } = await supabase
        .from("repair_orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onMutate: async ({ orderId, status }) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ["repair-orders"] });

      // Snapshot the previous state for rollback
      const previousOrders = queryClient.getQueriesData({
        queryKey: ["repair-orders"],
      });

      // Optimistically update all matching queries
      queryClient.setQueriesData(
        { queryKey: ["repair-orders"] },
        (oldData: RepairOrderWithVehicleDetails[] | undefined) => {
          return oldData
            ? oldData.map((order) =>
              order.id === orderId
                ? { ...order, status, updated_at: new Date().toISOString() }
                : order
            )
            : [];
        },
      );

      return { previousOrders };
    },
    onError: (error, variables, context) => {
      // Rollback to previous state on error
      if (context?.previousOrders) {
        context.previousOrders.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      // Only invalidate queries on error to refetch correct state
      queryClient.invalidateQueries({ queryKey: ["repair-orders"] });
    },
    onSettled: () => {
      // Always refetch the repair orders after mutation
      //queryClient.invalidateQueries({ queryKey: ["repair-orders"] });
    },
  });
}
