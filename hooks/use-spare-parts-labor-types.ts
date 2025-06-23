"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSparePartsAndLaborTypes } from "@/app/actions/vehicles";

export function useSparePartsAndLaborTypes() {
  return useQuery({
    queryKey: ["spare-parts-labor-types"],
    queryFn: () => fetchSparePartsAndLaborTypes(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}
