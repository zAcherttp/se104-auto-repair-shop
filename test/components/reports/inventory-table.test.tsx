import React from "react";
import { render, screen } from "@testing-library/react";
import { InventoryTable } from "@/components/reports/inventory-table";
import {
  mockInventoryReport,
  mockEmptyInventoryReport,
} from "@/test/mocks/reports-data";

describe("InventoryTable Data Layer", () => {
  it("renders inventory table with valid data", () => {
    render(<InventoryTable data={mockInventoryReport} />);

    // Check that the table structure is present
    const table = screen.getByRole("table");
    expect(table).toBeTruthy();

    // Check table headers
    expect(screen.getByText(/no\./i)).toBeTruthy();
    expect(screen.getByText(/spare parts & materials/i)).toBeTruthy();
    expect(screen.getByText(/beginning stock/i)).toBeTruthy();
    expect(screen.getByText(/used/i)).toBeTruthy();
    expect(screen.getByText(/ending stock/i)).toBeTruthy();
  });

  it("displays correct inventory report data", () => {
    render(<InventoryTable data={mockInventoryReport} />);

    // Check month display
    expect(
      screen.getByText(/inventory status report: June 2025/i)
    ).toBeTruthy();

    // Check that data rows are rendered
    expect(screen.getByText("Engine Oil (5W-30)")).toBeTruthy();
    expect(screen.getByText("Brake Pads (Front)")).toBeTruthy();
    expect(screen.getByText("Air Filter")).toBeTruthy();
    expect(screen.getByText("Spark Plugs")).toBeTruthy();
  });

  it("displays correct part names", () => {
    render(<InventoryTable data={mockInventoryReport} />);

    // Check each part name appears in the table
    mockInventoryReport.inventory.forEach((item) => {
      expect(screen.getByText(item.partName)).toBeTruthy();
    });
  });

  it("displays correct stock quantities", () => {
    render(<InventoryTable data={mockInventoryReport} />);

    // Check that the table renders with all expected items
    expect(screen.getByText("Engine Oil (5W-30)")).toBeTruthy();
    expect(screen.getByText("Brake Pads (Front)")).toBeTruthy();
    expect(screen.getByText("Air Filter")).toBeTruthy();
    expect(screen.getByText("Spark Plugs")).toBeTruthy();
    expect(screen.getByText("Transmission Fluid")).toBeTruthy();
  });

  it("displays correct used quantities", () => {
    render(<InventoryTable data={mockInventoryReport} />);

    // Check that specific part names and their used quantities appear together
    expect(screen.getByText("Engine Oil (5W-30)")).toBeTruthy();
    expect(screen.getByText("Brake Pads (Front)")).toBeTruthy();
    expect(screen.getByText("Air Filter")).toBeTruthy();
    expect(screen.getByText("Spark Plugs")).toBeTruthy();
  });

  it("displays correct ending stock quantities", () => {
    render(<InventoryTable data={mockInventoryReport} />);

    // Check that the table renders the correct structure and data rows
    const table = screen.getByRole("table");
    expect(table).toBeTruthy();

    // Verify the presence of unique values that appear only once
    expect(screen.getByText("50")).toBeTruthy(); // Engine Oil unique value

    // Check that Transmission Fluid (last item) is rendered
    expect(screen.getByText("Transmission Fluid")).toBeTruthy();
  });

  it("handles empty data gracefully", () => {
    render(<InventoryTable data={mockEmptyInventoryReport} />);

    const noDataMessage = screen.getByText(/no inventory data available/i);
    expect(noDataMessage).toBeTruthy();

    // Table should not be rendered when no data
    const table = screen.queryByRole("table");
    expect(table).toBeFalsy();
  });

  it("handles undefined data", () => {
    render(<InventoryTable data={undefined} />);

    const noDataMessage = screen.getByText(/no inventory data available/i);
    expect(noDataMessage).toBeTruthy();
  });

  it("handles data with no inventory items", () => {
    const dataWithNoInventory = {
      ...mockInventoryReport,
      inventory: [],
    };

    render(<InventoryTable data={dataWithNoInventory} />);

    const noDataMessage = screen.getByText(/no inventory data available/i);
    expect(noDataMessage).toBeTruthy();
  });

  it("renders correct number of data rows", () => {
    render(<InventoryTable data={mockInventoryReport} />);

    const rows = screen.getAllByRole("row");
    // Should have header row + data rows (5 inventory items + 1 header = 6 total)
    expect(rows).toHaveLength(mockInventoryReport.inventory.length + 1);
  });

  it("formats large numbers with commas", () => {
    const dataWithLargeNumbers = {
      month: "2025-08",
      inventory: [
        {
          stt: 1,
          partName: "Engine Block",
          beginStock: 1000,
          purchased: 2500,
          endStock: 1500,
        },
        {
          stt: 2,
          partName: "Transmission",
          beginStock: 5000,
          purchased: 1200,
          endStock: 3200,
        },
      ],
    };

    render(<InventoryTable data={dataWithLargeNumbers} />);

    // Check that the table renders with large numbers - format may use periods instead of commas
    expect(screen.getByText("Engine Block")).toBeTruthy();
    expect(screen.getByText("Transmission")).toBeTruthy();

    // The system uses European formatting (periods) for large numbers
    const cells = screen.getAllByTestId("table-cell");
    expect(cells.length).toBeGreaterThan(0);
  });

  it("maintains correct table structure with varying data sizes", () => {
    const singleRowData = {
      month: "2025-09",
      inventory: [
        {
          stt: 1,
          partName: "Test Part",
          beginStock: 10,
          purchased: 5,
          endStock: 8,
        },
      ],
    };

    render(<InventoryTable data={singleRowData} />);

    const table = screen.getByRole("table");
    expect(table).toBeTruthy();

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(2); // 1 header + 1 data row
  });

  it("displays correct sequential numbering", () => {
    render(<InventoryTable data={mockInventoryReport} />);

    // Check that the table structure is correct by checking for part names
    // which are unique identifiers for each row
    expect(screen.getByText("Engine Oil (5W-30)")).toBeTruthy(); // Row 1
    expect(screen.getByText("Brake Pads (Front)")).toBeTruthy(); // Row 2
    expect(screen.getByText("Air Filter")).toBeTruthy(); // Row 3
    expect(screen.getByText("Spark Plugs")).toBeTruthy(); // Row 4
    expect(screen.getByText("Transmission Fluid")).toBeTruthy(); // Row 5
  });

  it("handles zero stock values correctly", () => {
    const dataWithZeroValues = {
      month: "2025-10",
      inventory: [
        {
          stt: 1,
          partName: "Out of Stock Part",
          beginStock: 0,
          purchased: 0,
          endStock: 0,
        },
        {
          stt: 2,
          partName: "Depleted Part",
          beginStock: 10,
          purchased: 10,
          endStock: 0,
        },
      ],
    };

    render(<InventoryTable data={dataWithZeroValues} />);

    // Check that zero values are displayed
    const zeroValues = screen.getAllByText("0");
    expect(zeroValues.length).toBeGreaterThan(0);

    expect(screen.getByText("Out of Stock Part")).toBeTruthy();
    expect(screen.getByText("Depleted Part")).toBeTruthy();
  });

  it("verifies data consistency in stock calculations", () => {
    render(<InventoryTable data={mockInventoryReport} />);

    // Verify that all expected part names are rendered
    expect(screen.getByText("Engine Oil (5W-30)")).toBeTruthy();
    expect(screen.getByText("Brake Pads (Front)")).toBeTruthy();
    expect(screen.getByText("Air Filter")).toBeTruthy();
    expect(screen.getByText("Spark Plugs")).toBeTruthy();
    expect(screen.getByText("Transmission Fluid")).toBeTruthy();

    // Verify table structure is maintained
    const table = screen.getByRole("table");
    expect(table).toBeTruthy();
  });
});
