"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchExistingRepairOrderItems } from "@/app/actions/vehicles";

interface UseRepairOrderItemsOptions {
  repairOrderId?: string;
  enabled?: boolean;
}

export function useRepairOrderItems({ 
  repairOrderId, 
  enabled = true 
}: UseRepairOrderItemsOptions) {
  return useQuery({
    queryKey: ["repair-order-items", repairOrderId],
    queryFn: async () => {
      if (!repairOrderId) {
        throw new Error("Repair order ID is required");
      }
      
      const result = await fetchExistingRepairOrderItems(repairOrderId);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.items || [];
    },
    enabled: enabled && !!repairOrderId
  });
}