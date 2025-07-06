"use client";

import { SalesAnalytics } from "@/types/reports";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface SalesAnalyticsChartProps {
  data?: SalesAnalytics;
}

// Color palette for pie chart
const COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#6366f1", // indigo
];

export function SalesAnalyticsChart({ data }: SalesAnalyticsChartProps) {
  if (!data?.topServices?.length) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No sales data available
      </div>
    );
  }

  // Prepare data for pie chart with percentages
  const totalRevenue = data.topServices.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  const chartData = data.topServices.map((item, index) => ({
    name: item.service,
    value: item.revenue,
    percentage:
      totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(1) : "0",
    color: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: {
        name: string;
        value: number;
        percentage: string;
      };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">
            Revenue:{" "}
            {data.value.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </p>
          <p className="text-gray-600">Percentage: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percentage,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percentage: string;
  }) => {
    // Only show label if percentage is significant enough
    if (parseFloat(percentage) < 5) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={CustomLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value: string, entry: { color?: string }) => (
            <span style={{ color: entry.color || "#000" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
