import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/supabase/client";
import type { Vehicle } from "@/types";

interface VehicleDebtData {
  totalExpense: number;
  totalPaid: number;
  remainingDebt: number;
  vehicle: Vehicle;
}

interface UseVehicleDebtOptions {
  vehicleId: string;
  enabled?: boolean;
}

export function useVehicleDebt({
  vehicleId,
  enabled = true,
}: UseVehicleDebtOptions) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["vehicle-debt", vehicleId],
    queryFn: async (): Promise<VehicleDebtData> => {
      // Fetch vehicle data with repair orders (we'll use total_paid field directly)
      const { data: vehicleData, error: vehicleError } = await supabase
        .from("vehicles")
        .select(
          `
          *,
          repair_orders (
            total_amount
          )
        `,
        )
        .eq("id", vehicleId)
        .single();

      if (vehicleError) {
        throw new Error(
          `Failed to fetch vehicle data: ${vehicleError.message}`,
        );
      }

      // Calculate total expense from all repair orders
      const totalExpense =
        vehicleData.repair_orders?.reduce(
          (sum: number, order: { total_amount: number | null }) =>
            sum + (order.total_amount || 0),
          0,
        ) || 0;

      // Calculate total paid from vehicle's total_paid field (more reliable)
      // This field is directly updated when payments are made
      const totalPaid = vehicleData.total_paid || 0;

      // Calculate remaining debt
      const remainingDebt = totalExpense - totalPaid;

      return {
        totalExpense,
        totalPaid,
        remainingDebt,
        vehicle: vehicleData,
      };
    },
    enabled: enabled && !!vehicleId,
    staleTime: 60 * 5,
    refetchOnWindowFocus: true,
  });
}
