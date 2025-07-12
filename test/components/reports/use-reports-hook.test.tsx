// Mock TanStack Query
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

// Mock reports actions
jest.mock("@/app/actions/reports", () => ({
  getSalesAnalytics: jest.fn(),
  getInventoryAnalytics: jest.fn(),
  getSalesReport: jest.fn(),
  getInventoryReport: jest.fn(),
}));

import { useQuery } from "@tanstack/react-query";
import { useReportsQuery } from "@/hooks/use-reports";
import {
  mockSalesAnalytics,
  mockInventoryAnalytics,
  mockSalesReport,
  mockInventoryReport,
  mockReportPeriod,
  mockEmptySalesAnalytics,
} from "@/test/mocks/reports-data";

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

describe("useReportsQuery Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns all data when queries are successful", () => {
    mockUseQuery
      .mockReturnValueOnce({
        data: { data: mockSalesAnalytics, error: null },
        isLoading: false,
        refetch: jest.fn(),
      } as any)
      .mockReturnValueOnce({
        data: { data: mockInventoryAnalytics, error: null },
        isLoading: false,
        refetch: jest.fn(),
      } as any)
      .mockReturnValueOnce({
        data: { data: mockSalesReport, error: null },
        isLoading: false,
        refetch: jest.fn(),
      } as any)
      .mockReturnValueOnce({
        data: { data: mockInventoryReport, error: null },
        isLoading: false,
        refetch: jest.fn(),
      } as any);

    const result = useReportsQuery(mockReportPeriod);

    expect(result.salesAnalytics).toEqual(mockSalesAnalytics);
    expect(result.inventoryAnalytics).toEqual(mockInventoryAnalytics);
    expect(result.b51Report).toEqual(mockSalesReport);
    expect(result.b52Report).toEqual(mockInventoryReport);
    expect(result.isLoading).toBe(false);
  });

  it("handles loading states correctly", () => {
    mockUseQuery
      .mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        refetch: jest.fn(),
      } as any)
      .mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        refetch: jest.fn(),
      } as any)
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        refetch: jest.fn(),
      } as any)
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        refetch: jest.fn(),
      } as any);

    const result = useReportsQuery(mockReportPeriod);

    expect(result.isLoading).toBe(true);
    expect(result.salesAnalytics).toBeUndefined();
    expect(result.inventoryAnalytics).toBeUndefined();
  });

  it("handles error states correctly", () => {
    const mockError = new Error("Failed to fetch sales data");

    mockUseQuery
      .mockReturnValueOnce({
        data: { data: undefined, error: mockError },
        isLoading: false,
        refetch: jest.fn(),
      } as any)
      .mockReturnValueOnce({
        data: { data: mockInventoryAnalytics, error: null },
        isLoading: false,
        refetch: jest.fn(),
      } as any)
      .mockReturnValueOnce({
        data: { data: mockSalesReport, error: null },
        isLoading: false,
        refetch: jest.fn(),
      } as any)
      .mockReturnValueOnce({
        data: { data: mockInventoryReport, error: null },
        isLoading: false,
        refetch: jest.fn(),
      } as any);

    const result = useReportsQuery(mockReportPeriod);

    expect(result.errors.sales).toEqual(mockError);
    expect(result.errors.inventory).toBeNull();
    expect(result.salesAnalytics).toBeUndefined();
    expect(result.inventoryAnalytics).toEqual(mockInventoryAnalytics);
  });

  it("handles empty data gracefully", () => {
    mockUseQuery
      .mockReturnValueOnce({
        data: { data: mockEmptySalesAnalytics, error: null },
        isLoading: false,
        refetch: jest.fn(),
      } as any)
      .mockReturnValueOnce({
        data: { data: mockInventoryAnalytics, error: null },
        isLoading: false,
        refetch: jest.fn(),
      } as any)
      .mockReturnValueOnce({
        data: { data: mockSalesReport, error: null },
        isLoading: false,
        refetch: jest.fn(),
      } as any)
      .mockReturnValueOnce({
        data: { data: mockInventoryReport, error: null },
        isLoading: false,
        refetch: jest.fn(),
      } as any);

    const result = useReportsQuery(mockReportPeriod);

    expect(result.salesAnalytics).toEqual(mockEmptySalesAnalytics);
    expect(result.salesAnalytics?.totalRevenue).toBe(0);
    expect(result.salesAnalytics?.topServices).toEqual([]);
    expect(result.isLoading).toBe(false);
  });

  it("creates correct query keys with period dates", () => {
    mockUseQuery.mockReturnValue({
      data: { data: mockSalesAnalytics, error: null },
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    useReportsQuery(mockReportPeriod);

    // Check that useQuery was called with correct query keys
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [
          "sales-analytics",
          mockReportPeriod.from.toISOString(),
          mockReportPeriod.to.toISOString(),
        ],
      })
    );
  });

  it("provides refetch functionality", () => {
    const mockRefetch = jest.fn();

    mockUseQuery.mockReturnValue({
      data: { data: mockSalesAnalytics, error: null },
      isLoading: false,
      refetch: mockRefetch,
    } as any);

    const result = useReportsQuery(mockReportPeriod);

    result.refetch();

    // refetch should be called for all queries
    expect(mockRefetch).toHaveBeenCalledTimes(4);
  });

  it("handles multiple concurrent error states", () => {
    const salesError = new Error("Sales fetch failed");
    const inventoryError = new Error("Inventory fetch failed");

    mockUseQuery
      .mockReturnValueOnce({
        data: { data: undefined, error: salesError },
        isLoading: false,
        refetch: jest.fn(),
      } as any)
      .mockReturnValueOnce({
        data: { data: undefined, error: inventoryError },
        isLoading: false,
        refetch: jest.fn(),
      } as any)
      .mockReturnValueOnce({
        data: { data: mockSalesReport, error: null },
        isLoading: false,
        refetch: jest.fn(),
      } as any)
      .mockReturnValueOnce({
        data: { data: mockInventoryReport, error: null },
        isLoading: false,
        refetch: jest.fn(),
      } as any);

    const result = useReportsQuery(mockReportPeriod);

    expect(result.errors.sales).toEqual(salesError);
    expect(result.errors.inventory).toEqual(inventoryError);
    expect(result.errors.b51).toBeNull();
    expect(result.errors.b52).toBeNull();
  });
});
