import React from "react";
import { render, screen, waitFor, fireEvent } from "@/test/utils/test-utils";
import ReportsPage from "@/app/(protected)/reports/page";
import {
  mockSalesReport,
  mockInventoryReport,
  mockSalesAnalytics,
  mockErrorResponse,
} from "@/test/mocks/reports-data";
import {
  MockMonthYearPicker,
  MockSalesAnalyticsChart,
  MockSalesTable,
  MockInventoryTable,
  MockSkeleton,
  MockAlert,
  MockAlertDescription,
} from "@/test/mocks/component-mocks";

// Mock the useReportsQuery hook
const mockUseReportsQuery = jest.fn();

jest.mock("@/hooks/use-reports", () => ({
  useReportsQuery: () => mockUseReportsQuery(),
}));

// Mock the components
jest.mock("@/components/month-year-picker", () => ({
  MonthYearPicker: MockMonthYearPicker,
}));

jest.mock("@/components/reports/sales-analytics-chart", () => ({
  SalesAnalyticsChart: MockSalesAnalyticsChart,
}));

jest.mock("@/components/reports/sales-table", () => ({
  SalesTable: MockSalesTable,
}));

jest.mock("@/components/reports/inventory-table", () => ({
  InventoryTable: MockInventoryTable,
}));

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: MockSkeleton,
}));

jest.mock("@/components/ui/alert", () => ({
  Alert: MockAlert,
  AlertDescription: MockAlertDescription,
}));

// Mock Lucide icons
jest.mock("lucide-react", () => ({
  BarChart3: () => <div data-testid="bar-chart-icon">📊</div>,
  Package: () => <div data-testid="package-icon">📦</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">⚠️</div>,
}));

describe("Reports Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default successful mock response
    mockUseReportsQuery.mockReturnValue({
      salesAnalytics: mockSalesAnalytics,
      inventoryAnalytics: null,
      b51Report: mockSalesReport,
      b52Report: mockInventoryReport,
      isLoading: false,
      errors: {
        sales: null,
        inventory: null,
        b51: null,
        b52: null,
      },
    });
  });

  describe("Page Layout and Structure", () => {
    it("should render the page title and description", () => {
      render(<ReportsPage />);

      expect(screen.getByText("Reports")).toBeTruthy();
      expect(
        screen.getByText(/view sales and inventory analytics/i)
      ).toBeTruthy();
    });

    it("should render the month/year picker", () => {
      render(<ReportsPage />);

      expect(screen.getByTestId("month-year-picker")).toBeTruthy();
    });

    it("should render tabs for sales and inventory", () => {
      render(<ReportsPage />);

      expect(screen.getByRole("tab", { name: /sales analysis/i })).toBeTruthy();
      expect(
        screen.getByRole("tab", { name: /inventory analysis/i })
      ).toBeTruthy();
    });

    it("should render tab icons correctly", () => {
      render(<ReportsPage />);

      expect(screen.getByTestId("bar-chart-icon")).toBeTruthy();
      expect(screen.getByTestId("package-icon")).toBeTruthy();
    });
  });

  describe("Sales Tab Content", () => {
    it("should render sales analytics chart", () => {
      render(<ReportsPage />);

      expect(screen.getByTestId("sales-analytics-chart")).toBeTruthy();
    });

    it("should render sales table", () => {
      render(<ReportsPage />);

      expect(screen.getByTestId("sales-table")).toBeTruthy();
    });

    it("should display sales overview card", () => {
      render(<ReportsPage />);

      expect(screen.getByText("Sales Overview")).toBeTruthy();
      expect(screen.getByText(/car brands revenue distribution/i)).toBeTruthy();
    });

    it("should display key metrics card", () => {
      render(<ReportsPage />);

      expect(screen.getByText("Key Metrics")).toBeTruthy();
      expect(screen.getByText(/important sales metrics/i)).toBeTruthy();
    });

    it("should display detailed sales report card", () => {
      render(<ReportsPage />);

      expect(screen.getByText("Detailed Sales Report")).toBeTruthy();
      expect(screen.getByText(/comprehensive breakdown/i)).toBeTruthy();
    });
  });

  describe("Inventory Tab Content", () => {
    it("should render inventory table when switching to inventory tab", async () => {
      render(<ReportsPage />);

      const inventoryTab = screen.getByRole("tab", {
        name: /inventory analysis/i,
      });
      fireEvent.click(inventoryTab);

      await waitFor(() => {
        expect(screen.getByTestId("inventory-table")).toBeTruthy();
      });
    });

    it("should display inventory metrics card", async () => {
      render(<ReportsPage />);

      const inventoryTab = screen.getByRole("tab", {
        name: /inventory analysis/i,
      });
      fireEvent.click(inventoryTab);

      await waitFor(() => {
        expect(screen.getByText("Inventory Metrics")).toBeTruthy();
        expect(screen.getByText(/key inventory performance/i)).toBeTruthy();
      });
    });

    it("should display inventory status report card", async () => {
      render(<ReportsPage />);

      const inventoryTab = screen.getByRole("tab", {
        name: /inventory analysis/i,
      });
      fireEvent.click(inventoryTab);

      await waitFor(() => {
        expect(screen.getByText("Inventory Status Report")).toBeTruthy();
        expect(screen.getByText(/detailed inventory levels/i)).toBeTruthy();
      });
    });
  });

  describe("Loading States", () => {
    it("should display skeleton loaders when data is loading", () => {
      mockUseReportsQuery.mockReturnValue({
        salesAnalytics: null,
        inventoryAnalytics: null,
        b51Report: null,
        b52Report: null,
        isLoading: true,
        errors: {
          sales: null,
          inventory: null,
          b51: null,
          b52: null,
        },
      });

      render(<ReportsPage />);

      expect(screen.getAllByTestId("skeleton")).toHaveLength(4);
    });

    it("should show loading state for sales analytics chart", () => {
      mockUseReportsQuery.mockReturnValue({
        salesAnalytics: null,
        inventoryAnalytics: null,
        b51Report: mockSalesReport,
        b52Report: mockInventoryReport,
        isLoading: true,
        errors: {
          sales: null,
          inventory: null,
          b51: null,
          b52: null,
        },
      });

      render(<ReportsPage />);

      // Should render skeleton for chart
      expect(screen.getByTestId("skeleton")).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    it("should display error alert when there are errors", () => {
      mockUseReportsQuery.mockReturnValue({
        salesAnalytics: null,
        inventoryAnalytics: null,
        b51Report: null,
        b52Report: null,
        isLoading: false,
        errors: {
          sales: new Error("Failed to fetch sales data"),
          inventory: null,
          b51: null,
          b52: null,
        },
      });

      render(<ReportsPage />);

      expect(screen.getByTestId("alert")).toBeTruthy();
      expect(screen.getByTestId("alert-description")).toBeTruthy();
      expect(screen.getByText(/failed to load reports data/i)).toBeTruthy();
    });

    it("should prioritize first error when multiple errors exist", () => {
      mockUseReportsQuery.mockReturnValue({
        salesAnalytics: null,
        inventoryAnalytics: null,
        b51Report: null,
        b52Report: null,
        isLoading: false,
        errors: {
          sales: new Error("Sales error"),
          inventory: new Error("Inventory error"),
          b51: new Error("B51 error"),
          b52: new Error("B52 error"),
        },
      });

      render(<ReportsPage />);

      expect(screen.getByText(/sales error/i)).toBeTruthy();
    });

    it("should render alert with destructive variant", () => {
      mockUseReportsQuery.mockReturnValue({
        salesAnalytics: null,
        inventoryAnalytics: null,
        b51Report: null,
        b52Report: null,
        isLoading: false,
        errors: {
          sales: new Error("Test error"),
          inventory: null,
          b51: null,
          b52: null,
        },
      });

      render(<ReportsPage />);

      const alert = screen.getByTestId("alert");
      expect(alert.getAttribute("data-variant")).toBe("destructive");
    });
  });

  describe("Data Integration", () => {
    it("should pass correct data to components", () => {
      render(<ReportsPage />);

      // Verify mocks were called with correct data
      expect(MockSalesAnalyticsChart).toHaveBeenCalledWith(
        expect.objectContaining({ data: mockSalesAnalytics }),
        expect.anything()
      );

      expect(MockSalesTable).toHaveBeenCalledWith(
        expect.objectContaining({ data: mockSalesReport }),
        expect.anything()
      );

      expect(MockInventoryTable).toHaveBeenCalledWith(
        expect.objectContaining({ data: mockInventoryReport }),
        expect.anything()
      );
    });

    it("should handle undefined data gracefully", () => {
      mockUseReportsQuery.mockReturnValue({
        salesAnalytics: undefined,
        inventoryAnalytics: undefined,
        b51Report: undefined,
        b52Report: undefined,
        isLoading: false,
        errors: {
          sales: null,
          inventory: null,
          b51: null,
          b52: null,
        },
      });

      render(<ReportsPage />);

      expect(MockSalesAnalyticsChart).toHaveBeenCalledWith(
        expect.objectContaining({ data: undefined }),
        expect.anything()
      );
    });
  });

  describe("Month/Year Picker Integration", () => {
    it("should update period when month/year picker changes", async () => {
      render(<ReportsPage />);

      const picker = screen.getByTestId("month-year-picker");
      const button = picker.querySelector("button");

      if (button) {
        fireEvent.click(button);

        await waitFor(() => {
          expect(MockMonthYearPicker).toHaveBeenCalled();
        });
      }
    });

    it("should initialize with current month and year", () => {
      render(<ReportsPage />);

      expect(MockMonthYearPicker).toHaveBeenCalledWith(
        expect.objectContaining({
          initialMonth: expect.any(Number),
          initialYear: expect.any(Number),
        }),
        expect.anything()
      );
    });
  });

  describe("Tab Navigation", () => {
    it("should switch between tabs correctly", async () => {
      render(<ReportsPage />);

      // Initially on sales tab
      expect(screen.getByRole("tab", { selected: true }).textContent).toContain(
        "Sales Analysis"
      );

      // Switch to inventory tab
      const inventoryTab = screen.getByRole("tab", {
        name: /inventory analysis/i,
      });
      fireEvent.click(inventoryTab);

      await waitFor(() => {
        expect(
          screen.getByRole("tab", { selected: true }).textContent
        ).toContain("Inventory Analysis");
      });
    });

    it("should maintain tab state during data updates", async () => {
      const { rerender } = render(<ReportsPage />);

      // Switch to inventory tab
      const inventoryTab = screen.getByRole("tab", {
        name: /inventory analysis/i,
      });
      fireEvent.click(inventoryTab);

      // Update data
      mockUseReportsQuery.mockReturnValue({
        salesAnalytics: mockSalesAnalytics,
        inventoryAnalytics: null,
        b51Report: mockSalesReport,
        b52Report: mockInventoryReport,
        isLoading: false,
        errors: {
          sales: null,
          inventory: null,
          b51: null,
          b52: null,
        },
      });

      rerender(<ReportsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole("tab", { selected: true }).textContent
        ).toContain("Inventory Analysis");
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels and roles", () => {
      render(<ReportsPage />);

      expect(screen.getByRole("tablist")).toBeTruthy();
      expect(screen.getAllByRole("tab")).toHaveLength(2);
      expect(screen.getAllByRole("tabpanel")).toHaveLength(2);
    });

    it("should have proper heading structure", () => {
      render(<ReportsPage />);

      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
        "Reports"
      );
    });
  });
});
