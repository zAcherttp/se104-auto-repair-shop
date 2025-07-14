import React from "react";
import { render, screen } from "@testing-library/react";
import { SalesTable } from "@/components/reports/sales-table";
import {
  mockSalesReport,
  mockEmptySalesReport,
} from "@/test/mocks/reports-data";

describe("SalesTable Data Layer", () => {
  it("renders sales table with valid data", () => {
    render(<SalesTable data={mockSalesReport} />);

    // Check that the table structure is present
    const table = screen.getByRole("table");
    expect(table).toBeTruthy();

    // Check table headers
    expect(screen.getByText(/no\./i)).toBeTruthy();
    expect(screen.getByText(/car brand/i)).toBeTruthy();
    expect(screen.getByText(/repair count/i)).toBeTruthy();
    expect(screen.getByText(/amount/i)).toBeTruthy();
    expect(screen.getByText(/rate/i)).toBeTruthy();
  });

  it("displays correct sales report data", () => {
    render(<SalesTable data={mockSalesReport} />);

    // Check month display
    expect(screen.getByText(/sales report: June 2025/i)).toBeTruthy();

    // Check total revenue display
    expect(screen.getByText(/total revenue:/i)).toBeTruthy();
    expect(screen.getByText(/\$15,750,000/)).toBeTruthy();

    // Check that data rows are rendered
    expect(screen.getByText("Toyota")).toBeTruthy();
    expect(screen.getByText("Honda")).toBeTruthy();
    expect(screen.getByText("Mazda")).toBeTruthy();
  });

  it("displays correct vehicle brand data", () => {
    render(<SalesTable data={mockSalesReport} />);

    // Check each vehicle brand appears in the table
    mockSalesReport.orders.forEach((order) => {
      expect(screen.getByText(order.vehicleBrand)).toBeTruthy();
    });
  });

  it("displays correct repair count data", () => {
    render(<SalesTable data={mockSalesReport} />);

    // Check specific repair counts
    expect(screen.getByText("12")).toBeTruthy(); // Toyota repair count
    expect(screen.getByText("8")).toBeTruthy(); // Honda repair count
    expect(screen.getByText("5")).toBeTruthy(); // Mazda repair count
  });

  it("formats currency amounts correctly", () => {
    render(<SalesTable data={mockSalesReport} />);

    // Check formatted amounts (should include $ and commas)
    expect(screen.getByText("$8,400,000.00")).toBeTruthy(); // Toyota amount
    expect(screen.getByText("$4,200,000.00")).toBeTruthy(); // Honda amount
    expect(screen.getByText("$2,100,000.00")).toBeTruthy(); // Mazda amount
  });

  it("displays rate percentages correctly", () => {
    render(<SalesTable data={mockSalesReport} />);

    // Check percentage displays with proper formatting
    expect(screen.getByText("53.3%")).toBeTruthy(); // Toyota rate
    expect(screen.getByText("26.7%")).toBeTruthy(); // Honda rate
    expect(screen.getByText("13.3%")).toBeTruthy(); // Mazda rate
  });

  it("handles empty data gracefully", () => {
    render(<SalesTable data={mockEmptySalesReport} />);

    const noDataMessage = screen.getByText(
      /no sales data available for this period/i
    );
    expect(noDataMessage).toBeTruthy();

    // Table should not be rendered when no data
    const table = screen.queryByRole("table");
    expect(table).toBeFalsy();
  });

  it("handles undefined data", () => {
    render(<SalesTable data={undefined} />);

    const noDataMessage = screen.getByText(
      /no sales data available for this period/i
    );
    expect(noDataMessage).toBeTruthy();
  });

  it("handles data with no orders", () => {
    const dataWithNoOrders = {
      ...mockSalesReport,
      orders: [],
    };

    render(<SalesTable data={dataWithNoOrders} />);

    const noDataMessage = screen.getByText(
      /no sales data available for this period/i
    );
    expect(noDataMessage).toBeTruthy();
  });

  it("renders correct number of data rows", () => {
    render(<SalesTable data={mockSalesReport} />);

    const rows = screen.getAllByRole("row");
    // Should have header row + data rows
    expect(rows).toHaveLength(mockSalesReport.orders.length + 1);
  });

  it("calculates and displays total revenue correctly", () => {
    const customData = {
      month: "2025-08",
      totalRevenue: 75000,
      orders: [
        {
          stt: 1,
          vehicleBrand: "BMW",
          repairCount: 5,
          amount: 75000,
          rate: 100.0,
        },
      ],
    };

    render(<SalesTable data={customData} />);

    // Check that total revenue appears in the header section
    expect(screen.getByText(/total revenue:/i)).toBeTruthy();
    expect(screen.getByText("100.0%")).toBeTruthy();
  });

  it("handles large numbers correctly", () => {
    const dataWithLargeNumbers = {
      month: "2025-09",
      totalRevenue: 1500000,
      orders: [
        {
          stt: 1,
          vehicleBrand: "Luxury",
          repairCount: 1000,
          amount: 1500000,
          rate: 100.0,
        },
      ],
    };

    render(<SalesTable data={dataWithLargeNumbers} />);

    // Check large number formatting - the system uses US locale formatting in tests
    expect(screen.getByText("1,000")).toBeTruthy(); // repair count with comma (US format)
    expect(screen.getByText("Luxury")).toBeTruthy(); // vehicle brand
  });

  it("maintains correct table structure with varying data sizes", () => {
    const singleRowData = {
      month: "2025-10",
      totalRevenue: 5000,
      orders: [
        {
          stt: 1,
          vehicleBrand: "TestBrand",
          repairCount: 1,
          amount: 5000,
          rate: 100.0,
        },
      ],
    };

    render(<SalesTable data={singleRowData} />);

    const table = screen.getByRole("table");
    expect(table).toBeTruthy();

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(2); // 1 header + 1 data row
  });
});
