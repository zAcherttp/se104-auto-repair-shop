"use client";

import { InventoryAnalytics } from "@/types/reports";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface InventoryAnalyticsChartProps {
  data?: InventoryAnalytics;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function InventoryAnalyticsChart({
  data,
}: InventoryAnalyticsChartProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No inventory data available
      </div>
    );
  }

  const chartData = [
    {
      name: "In Stock",
      value: data.totalParts - data.lowStockItems - data.outOfStockItems,
    },
    { name: "Low Stock", value: data.lowStockItems },
    { name: "Out of Stock", value: data.outOfStockItems },
  ].filter((item) => item.value > 0);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
