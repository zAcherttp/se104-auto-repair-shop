import { useQuery } from "@tanstack/react-query";
import { getDailyVehicleLimitStatus } from "@/app/actions/vehicles";

export function useDailyVehicleLimit() {
    return useQuery({
        queryKey: ["daily-vehicle-limit"],
        queryFn: async () => {
            const response = await getDailyVehicleLimitStatus();
            if (response.error) {
                throw response.error;
            }
            return response.data;
        },
        staleTime: 30000, // 30 seconds
        refetchInterval: 60000, // Refetch every minute
    });
}
