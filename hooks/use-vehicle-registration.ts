"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { fetchVehicleRegistrationWithDateRange } from "@/app/actions/vehicles";

export const VEHICLE_REGISTRATION_QUERY_KEY = "vehicle-registration";

interface UseVehicleRegistrationOptions {
  initialDateRange?: DateRange;
}

export function useVehicleRegistration(
  options: UseVehicleRegistrationOptions = {},
) {
  // Set default date range to today if no initial range provided
  const getDefaultDateRange = (): DateRange => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return { from: today, to: today };
  };

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    options.initialDateRange || getDefaultDateRange(),
  );

  const queryClient = useQueryClient();

  // Simple query with date range as key
  const {
    data: vehicleData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [VEHICLE_REGISTRATION_QUERY_KEY, dateRange?.from, dateRange?.to],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) {
        return { data: [], error: null };
      }

      return await fetchVehicleRegistrationWithDateRange({
        from: dateRange.from,
        to: dateRange.to,
        limit: 1000, // Increased limit since we're not paginating
      });
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Force refetch by invalidating the query
  const invalidateAndRefetch = () => {
    queryClient.invalidateQueries({
      queryKey: [
        VEHICLE_REGISTRATION_QUERY_KEY,
        dateRange?.from,
        dateRange?.to,
      ],
    });
  };

  // Update date range and trigger refetch
  const updateDateRange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    // TanStack Query will automatically refetch when the query key changes
  };

  return {
    data: vehicleData?.data || [],
    isLoading,
    error: error || vehicleData?.error,
    dateRange,
    updateDateRange,
    refetch: invalidateAndRefetch,
  };
}
