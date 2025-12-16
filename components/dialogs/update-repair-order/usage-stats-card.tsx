"use client";

import { Package, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMonthlyUsageStats } from "@/hooks/use-monthly-usage-stats";

export function UsageStatsCard() {
  const { data: stats, isLoading } = useMonthlyUsageStats();

  if (isLoading || !stats) {
    return null;
  }

  // Only show if limits are set
  if (stats.maxPartsPerMonth === 0 && stats.maxLaborTypesPerMonth === 0) {
    return null;
  }

  const getUsageBadgeVariant = (current: number, max: number) => {
    if (max === 0) return "outline";
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "destructive";
    if (percentage >= 70) return "secondary";
    return "outline";
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Monthly Usage Limits</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-4">
          {stats.maxPartsPerMonth > 0 && (
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <Badge
                variant={getUsageBadgeVariant(
                  stats.partUsage,
                  stats.maxPartsPerMonth,
                )}
              >
                Parts: {stats.partUsage}/{stats.maxPartsPerMonth}
              </Badge>
            </div>
          )}

          {stats.maxLaborTypesPerMonth > 0 && (
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <Badge
                variant={getUsageBadgeVariant(
                  stats.laborUsage,
                  stats.maxLaborTypesPerMonth,
                )}
              >
                Labor: {stats.laborUsage}/{stats.maxLaborTypesPerMonth}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
