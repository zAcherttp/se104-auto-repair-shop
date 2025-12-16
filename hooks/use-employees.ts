"use client";

import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "@/app/actions/settings";

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const result = await getEmployees();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch employees");
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}
