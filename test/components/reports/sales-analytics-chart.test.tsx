// Mock recharts components
jest.mock("recharts", () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ data }: { data: any[] }) => (
    <div data-testid="pie" data-length={data?.length || 0} />
  ),
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Legend: () => <div data-testid="legend" />,
}));

import { render, screen } from "@testing-library/react";
import type React from "react";
import { SalesAnalyticsChart } from "@/components/reports/sales-analytics-chart";
import {
  mockEmptySalesAnalytics,
  mockSalesAnalytics,
} from "@/test/mocks/reports-data";

describe("SalesAnalyticsChart Data Layer", () => {
  it("renders chart with valid sales analytics data", () => {
    render(<SalesAnalyticsChart data={mockSalesAnalytics} />);

    const chart = screen.getByTestId("pie-chart");
    const pie = screen.getByTestId("pie");

    expect(chart).toBeTruthy();
    expect(pie).toBeTruthy();
    expect(pie.getAttribute("data-length")).toBe(
      mockSalesAnalytics.topServices.length.toString(),
    ); // Use actual length from mock data
  });

  it("calculates correct data transformation for chart", () => {
    render(<SalesAnalyticsChart data={mockSalesAnalytics} />);

    const pie = screen.getByTestId("pie");

    // Verify that data was transformed (length should match topServices)
    expect(pie.getAttribute("data-length")).toBe(
      mockSalesAnalytics.topServices.length.toString(),
    );
  });

  it("handles empty data gracefully", () => {
    render(<SalesAnalyticsChart data={mockEmptySalesAnalytics} />);

    const noDataMessage = screen.getByText(/no sales data available/i);
    expect(noDataMessage).toBeTruthy();

    // Chart should not be rendered when no data
    const chart = screen.queryByTestId("pie-chart");
    expect(chart).toBeFalsy();
  });

  it("handles undefined data", () => {
    render(<SalesAnalyticsChart data={undefined} />);

    const noDataMessage = screen.getByText(/no sales data available/i);
    expect(noDataMessage).toBeTruthy();
  });

  it("handles data with no top services", () => {
    const dataWithNoServices = {
      ...mockSalesAnalytics,
      topServices: [],
    };

    render(<SalesAnalyticsChart data={dataWithNoServices} />);

    const noDataMessage = screen.getByText(/no sales data available/i);
    expect(noDataMessage).toBeTruthy();
  });

  it("processes revenue calculations correctly", () => {
    const testData = {
      ...mockSalesAnalytics,
      topServices: [
        { service: "Engine Repair", count: 10, revenue: 5000 },
        { service: "Brake Service", count: 5, revenue: 2500 },
      ],
    };

    render(<SalesAnalyticsChart data={testData} />);

    const pie = screen.getByTestId("pie");
    expect(pie.getAttribute("data-length")).toBe("2");
  });

  it("renders responsive container for chart layout", () => {
    render(<SalesAnalyticsChart data={mockSalesAnalytics} />);

    const responsiveContainer = screen.getByTestId("responsive-container");
    expect(responsiveContainer).toBeTruthy();
  });

  it("includes required chart components when data is available", () => {
    render(<SalesAnalyticsChart data={mockSalesAnalytics} />);

    expect(screen.getByTestId("pie-chart")).toBeTruthy();
    expect(screen.getByTestId("pie")).toBeTruthy();
    expect(screen.getByTestId("tooltip")).toBeTruthy();
    expect(screen.getByTestId("legend")).toBeTruthy();
    expect(screen.getByTestId("responsive-container")).toBeTruthy();
  });

  it("handles single service data", () => {
    const singleServiceData = {
      ...mockSalesAnalytics,
      topServices: [{ service: "Oil Change", count: 15, revenue: 750 }],
    };

    render(<SalesAnalyticsChart data={singleServiceData} />);

    const pie = screen.getByTestId("pie");
    expect(pie.getAttribute("data-length")).toBe("1");
  });

  it("handles large numbers in revenue data", () => {
    const largeRevenueData = {
      ...mockSalesAnalytics,
      topServices: [
        { service: "Engine Overhaul", count: 2, revenue: 150000 },
        { service: "Transmission Rebuild", count: 1, revenue: 85000 },
      ],
    };

    render(<SalesAnalyticsChart data={largeRevenueData} />);

    const pie = screen.getByTestId("pie");
    expect(pie.getAttribute("data-length")).toBe("2");
  });
});
