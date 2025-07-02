import { useCallback, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { getVehicleDebts, VehicleDebt } from "@/app/actions/debt-management";

interface UseDebtManagementProps {
  initialDateRange?: DateRange;
  searchTerm?: string;
}

export function useDebtManagement({
  initialDateRange,
  searchTerm = "",
}: UseDebtManagementProps) {
  const [data, setData] = useState<VehicleDebt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(
    initialDateRange || {
      from: new Date(),
      to: new Date(),
    },
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Only fetch if we have valid date range
      if (dateRange.from && dateRange.to) {
        const response = await getVehicleDebts(
          { from: dateRange.from, to: dateRange.to },
          searchTerm,
        );

        if (response.success && response.data) {
          setData(response.data);
        } else {
          throw new Error(response.error || "Failed to fetch vehicle debts");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateDateRange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    isLoading,
    error,
    dateRange,
    updateDateRange,
    refetch,
  };
}
