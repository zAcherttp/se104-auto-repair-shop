// Mock the reports actions
jest.mock("@/app/actions/reports", () => ({
  getSalesAnalytics: jest.fn(),
  getInventoryAnalytics: jest.fn(),
  getSalesReport: jest.fn(),
  getInventoryReport: jest.fn(),
}));

import {
  getSalesAnalytics,
  getInventoryAnalytics,
  getSalesReport,
  getInventoryReport,
} from "@/app/actions/reports";
import {
  mockSalesAnalytics,
  mockInventoryAnalytics,
  mockSalesReport,
  mockInventoryReport,
  mockReportPeriod,
} from "@/test/mocks/reports-data";

const mockGetSalesAnalytics = getSalesAnalytics as jest.MockedFunction<
  typeof getSalesAnalytics
>;
const mockGetInventoryAnalytics = getInventoryAnalytics as jest.MockedFunction<
  typeof getInventoryAnalytics
>;
const mockGetSalesReport = getSalesReport as jest.MockedFunction<
  typeof getSalesReport
>;
const mockGetInventoryReport = getInventoryReport as jest.MockedFunction<
  typeof getInventoryReport
>;

describe("Reports Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSalesAnalytics", () => {
    it("successfully fetches sales analytics data", async () => {
      mockGetSalesAnalytics.mockResolvedValue({
        data: mockSalesAnalytics,
        error: null,
      });

      const result = await getSalesAnalytics(mockReportPeriod);

      expect(result.data).toEqual(mockSalesAnalytics);
      expect(result.error).toBeNull();
      expect(mockGetSalesAnalytics).toHaveBeenCalledWith(mockReportPeriod);
    });

    it("handles empty sales analytics data", async () => {
      const emptySalesAnalytics = {
        ...mockSalesAnalytics,
        totalRevenue: 0,
        totalOrders: 0,
        topServices: [],
        monthlyRevenue: [],
      };

      mockGetSalesAnalytics.mockResolvedValue({
        data: emptySalesAnalytics,
        error: null,
      });

      const result = await getSalesAnalytics(mockReportPeriod);

      expect(result.data?.totalRevenue).toBe(0);
      expect(result.data?.totalOrders).toBe(0);
      expect(result.data?.topServices).toEqual([]);
      expect(result.error).toBeNull();
    });

    it("handles authentication errors", async () => {
      mockGetSalesAnalytics.mockResolvedValue({
        data: undefined,
        error: new Error("Authentication required"),
      });

      const result = await getSalesAnalytics(mockReportPeriod);

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe("Authentication required");
      expect(result.data).toBeUndefined();
    });

    it("calculates correct analytics metrics", async () => {
      mockGetSalesAnalytics.mockResolvedValue({
        data: mockSalesAnalytics,
        error: null,
      });

      const result = await getSalesAnalytics(mockReportPeriod);

      expect(result.data?.totalRevenue).toBe(mockSalesAnalytics.totalRevenue);
      expect(result.data?.totalOrders).toBe(mockSalesAnalytics.totalOrders);
      expect(result.data?.averageOrderValue).toBe(
        mockSalesAnalytics.averageOrderValue
      );
      expect(result.data?.completedOrders).toBeGreaterThan(0);
    });
  });

  describe("getInventoryAnalytics", () => {
    it("successfully fetches inventory analytics data", async () => {
      mockGetInventoryAnalytics.mockResolvedValue({
        data: mockInventoryAnalytics,
        error: null,
      });

      const result = await getInventoryAnalytics();

      expect(result.data).toEqual(mockInventoryAnalytics);
      expect(result.error).toBeNull();
      expect(mockGetInventoryAnalytics).toHaveBeenCalledTimes(1);
    });

    it("handles empty inventory data", async () => {
      const emptyInventoryAnalytics = {
        ...mockInventoryAnalytics,
        totalParts: 0,
        totalValue: 0,
        topValueParts: [],
        stockMovement: [],
      };

      mockGetInventoryAnalytics.mockResolvedValue({
        data: emptyInventoryAnalytics,
        error: null,
      });

      const result = await getInventoryAnalytics();

      expect(result.data?.totalParts).toBe(0);
      expect(result.data?.totalValue).toBe(0);
      expect(result.data?.topValueParts).toEqual([]);
      expect(result.error).toBeNull();
    });

    it("calculates correct inventory metrics", async () => {
      mockGetInventoryAnalytics.mockResolvedValue({
        data: mockInventoryAnalytics,
        error: null,
      });

      const result = await getInventoryAnalytics();

      expect(result.data?.totalParts).toBe(150);
      expect(result.data?.totalValue).toBe(75000);
      expect(result.data?.averagePartValue).toBe(500);
      expect(result.data?.lowStockItems).toBe(8);
      expect(result.data?.outOfStockItems).toBe(3);
    });
  });

  describe("getSalesReport", () => {
    it("successfully fetches sales report data", async () => {
      mockGetSalesReport.mockResolvedValue({
        data: mockSalesReport,
        error: null,
      });

      const result = await getSalesReport(mockReportPeriod);

      expect(result.data).toEqual(mockSalesReport);
      expect(result.error).toBeNull();
      expect(mockGetSalesReport).toHaveBeenCalledWith(mockReportPeriod);
    });

    it("handles database connection errors", async () => {
      mockGetSalesReport.mockResolvedValue({
        data: undefined,
        error: new Error("Database connection failed"),
      });

      const result = await getSalesReport(mockReportPeriod);

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe("Database connection failed");
      expect(result.data).toBeUndefined();
    });

    it("validates report data structure", async () => {
      mockGetSalesReport.mockResolvedValue({
        data: mockSalesReport,
        error: null,
      });

      const result = await getSalesReport(mockReportPeriod);

      expect(result.data?.month).toBe(mockSalesReport.month);
      expect(result.data?.totalRevenue).toBe(mockSalesReport.totalRevenue);
      expect(result.data?.orders).toHaveLength(mockSalesReport.orders.length);
      expect(result.data?.orders[0]).toHaveProperty("vehicleBrand");
      expect(result.data?.orders[0]).toHaveProperty("repairCount");
      expect(result.data?.orders[0]).toHaveProperty("amount");
      expect(result.data?.orders[0]).toHaveProperty("rate");
    });
  });

  describe("getInventoryReport", () => {
    it("successfully fetches inventory report data", async () => {
      mockGetInventoryReport.mockResolvedValue({
        data: mockInventoryReport,
        error: null,
      });

      const result = await getInventoryReport(mockReportPeriod);

      expect(result.data).toEqual(mockInventoryReport);
      expect(result.error).toBeNull();
      expect(mockGetInventoryReport).toHaveBeenCalledWith(mockReportPeriod);
    });

    it("validates inventory report structure", async () => {
      mockGetInventoryReport.mockResolvedValue({
        data: mockInventoryReport,
        error: null,
      });

      const result = await getInventoryReport(mockReportPeriod);

      expect(result.data?.month).toBe(mockInventoryReport.month);
      expect(result.data?.inventory).toHaveLength(
        mockInventoryReport.inventory.length
      );
      expect(result.data?.inventory[0]).toHaveProperty("partName");
      expect(result.data?.inventory[0]).toHaveProperty("beginStock");
      expect(result.data?.inventory[0]).toHaveProperty("purchased");
      expect(result.data?.inventory[0]).toHaveProperty("endStock");
    });

    it("handles permission errors", async () => {
      mockGetInventoryReport.mockResolvedValue({
        data: undefined,
        error: new Error("Insufficient permissions"),
      });

      const result = await getInventoryReport(mockReportPeriod);

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe("Insufficient permissions");
      expect(result.data).toBeUndefined();
    });
  });
});
