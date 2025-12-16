"use client";

import { useQuery } from "@tanstack/react-query";
import { getCarBrands } from "@/app/actions/settings";

export const CAR_BRANDS_QUERY_KEY = "car-brands";

export const useCarBrands = () => {
  return useQuery({
    queryKey: [CAR_BRANDS_QUERY_KEY],
    queryFn: async (): Promise<string[]> => {
      const result = await getCarBrands();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch car brands");
      }
      return result.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};
