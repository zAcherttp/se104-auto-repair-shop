"use client";

import { SalesAnalytics } from "@/types/reports";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesAnalyticsChartProps {
  data?: SalesAnalytics;
}

export function SalesAnalyticsChart({ data }: SalesAnalyticsChartProps) {
  if (!data?.monthlyRevenue?.length) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No sales data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data.monthlyRevenue}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
        <Tooltip
          formatter={(value: number) => [
            value.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            }),
            "Revenue",
          ]}
        />
        <Bar dataKey="revenue" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}
