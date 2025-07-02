import { useQuery } from "@tanstack/react-query";
import {
    getB51SalesReport,
    getB52InventoryReport,
    getInventoryAnalytics,
    getSalesAnalytics,
} from "@/app/actions/reports";
import { ReportPeriod } from "@/types/reports";

export const useReportsQuery = (period: ReportPeriod) => {
    const salesQuery = useQuery({
        queryKey: ["sales-analytics", period.from, period.to],
        queryFn: () => getSalesAnalytics(period),
        enabled: Boolean(period.from && period.to),
    });

    const inventoryQuery = useQuery({
        queryKey: ["inventory-analytics"],
        queryFn: () => getInventoryAnalytics(),
    });

    const b51Query = useQuery({
        queryKey: ["b51-sales-report", period.from, period.to],
        queryFn: () => getB51SalesReport(period),
        enabled: Boolean(period.from && period.to),
    });

    const b52Query = useQuery({
        queryKey: ["b52-inventory-report"],
        queryFn: () => getB52InventoryReport(),
    });

    return {
        salesAnalytics: salesQuery.data?.data,
        inventoryAnalytics: inventoryQuery.data?.data,
        b51Report: b51Query.data?.data,
        b52Report: b52Query.data?.data,
        isLoading: salesQuery.isLoading || inventoryQuery.isLoading ||
            b51Query.isLoading || b52Query.isLoading,
        errors: {
            sales: salesQuery.data?.error,
            inventory: inventoryQuery.data?.error,
            b51: b51Query.data?.error,
            b52: b52Query.data?.error,
        },
        refetch: () => {
            salesQuery.refetch();
            inventoryQuery.refetch();
            b51Query.refetch();
            b52Query.refetch();
        },
    };
};
