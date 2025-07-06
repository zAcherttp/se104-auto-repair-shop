import { useQuery } from "@tanstack/react-query";
import { getStockCalculationsForPeriod } from "@/lib/inventory-calculations";
import { ReportPeriod } from "@/types/reports";

export const useStockCalculationsQuery = (period: ReportPeriod) => {
    return useQuery({
        queryKey: [
            "stock-calculations",
            period.from?.toISOString(),
            period.to?.toISOString(),
        ],
        queryFn: () => {
            if (!period.from || !period.to) {
                throw new Error("Period dates are required");
            }
            return getStockCalculationsForPeriod(period.from, period.to);
        },
        enabled: Boolean(period.from && period.to),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};
