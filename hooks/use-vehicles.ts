"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchVehiclesWithRange } from "@/app/actions/vehicles";

export function useVehicles(dateFrom: string, dateTo: string) {
  console.log("useVehicles called with:", { dateFrom, dateTo });

  return useQuery({
    queryKey: ["vehicles", dateFrom, dateTo],
    queryFn: () => {
      return fetchVehiclesWithRange(dateFrom, dateTo);
    },
    enabled: Boolean(dateFrom && dateTo),
    staleTime: 0, // Always refetch for testing
    refetchOnWindowFocus: false,
  });
}
