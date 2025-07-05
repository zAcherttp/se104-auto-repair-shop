"use client";

import { useQuery } from "@tanstack/react-query";
import { getSystemSettings } from "@/app/actions/settings";
import { createClient } from "@/supabase/client";

interface UsageStats {
    partUsage: number;
    laborUsage: number;
    maxPartsPerMonth: number;
    maxLaborTypesPerMonth: number;
}

export function useMonthlyUsageStats() {
    return useQuery({
        queryKey: ["monthlyUsageStats"],
        queryFn: async (): Promise<UsageStats> => {
            const supabase = createClient();

            // Get current garage settings for limits
            const settingsResponse = await getSystemSettings();
            const settings =
                settingsResponse.data as Array<
                    { setting_key: string; setting_value: string }
                > || [];

            const settingsMap = settings.reduce((acc, setting) => {
                acc[setting.setting_key] = setting.setting_value;
                return acc;
            }, {} as Record<string, string>);

            const maxPartsPerMonth =
                parseInt(settingsMap.max_parts_per_month) || 0;
            const maxLaborTypesPerMonth =
                parseInt(settingsMap.max_labor_types_per_month) || 0;

            // Calculate current month boundaries
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0,
            );

            // Get current month's part usage
            const { data: partUsageData } = await supabase
                .from("repair_order_items")
                .select("id")
                .not("spare_part_id", "is", null)
                .gte("created_at", startOfMonth.toISOString())
                .lte("created_at", endOfMonth.toISOString());

            // Get current month's labor type usage
            const { data: laborUsageData } = await supabase
                .from("repair_order_items")
                .select("id")
                .not("labor_type_id", "is", null)
                .gte("created_at", startOfMonth.toISOString())
                .lte("created_at", endOfMonth.toISOString());

            return {
                partUsage: partUsageData?.length || 0,
                laborUsage: laborUsageData?.length || 0,
                maxPartsPerMonth,
                maxLaborTypesPerMonth,
            };
        },
        refetchInterval: 60000, // Refresh every minute
    });
}
