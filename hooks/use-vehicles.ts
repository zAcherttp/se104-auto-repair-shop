"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchVehiclesWithDebt } from "@/app/actions/vehicles";
import type { VehicleWithDebt } from "@/types/types";

export const VEHICLES_QUERY_KEY = "vehicles-with-debt";

export const useVehicles = () => {
  return useQuery({
    queryKey: [VEHICLES_QUERY_KEY],
    queryFn: async (): Promise<VehicleWithDebt[]> => {
      const result = await fetchVehiclesWithDebt();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
