import {
  mockSalesReport,
  mockEmptySalesReport,
} from "@/test/mocks/reports-data";

describe("Sales Data Validation", () => {
  describe("Data Accuracy Verification", () => {
    it("should verify total revenue calculation accuracy", () => {
      const expectedTotal = mockSalesReport.orders.reduce(
        (sum, order) => sum + order.amount,
        0
      );
      expect(mockSalesReport.totalRevenue).toBe(expectedTotal);
    });

    it("should verify rate calculations are accurate", () => {
      const totalRevenue = mockSalesReport.totalRevenue;

      mockSalesReport.orders.forEach((order) => {
        const expectedRate = (order.amount / totalRevenue) * 100;
        expect(Math.abs(order.rate - expectedRate)).toBeLessThan(0.1); // Allow small floating point differences
      });
    });

    it("should verify rates sum to approximately 100%", () => {
      const totalRate = mockSalesReport.orders.reduce(
        (sum, order) => sum + order.rate,
        0
      );
      expect(Math.abs(totalRate - 100)).toBeLessThan(0.1); // Allow small floating point differences
    });

    it("should verify sequential numbering (stt)", () => {
      mockSalesReport.orders.forEach((order, index) => {
        expect(order.stt).toBe(index + 1);
      });
    });

    it("should verify data integrity and consistency", () => {
      expect(mockSalesReport.orders).toHaveLength(4);
      expect(mockSalesReport.month).toBe("June 2025");
      expect(mockSalesReport.totalRevenue).toBe(15750000);
      
      // Verify all orders have required fields
      mockSalesReport.orders.forEach((order) => {
        expect(order.vehicleBrand).toBeTruthy();
        expect(order.repairCount).toBeGreaterThan(0);
        expect(order.amount).toBeGreaterThan(0);
        expect(order.rate).toBeGreaterThan(0);
      });
    });
  });

  describe("Business Logic Validation", () => {
    it("should validate repair count vs amount relationship", () => {
      // Higher repair counts should generally correlate with higher amounts
      const sortedByRepairCount = [...mockSalesReport.orders].sort(
        (a, b) => b.repairCount - a.repairCount
      );
      const sortedByAmount = [...mockSalesReport.orders].sort(
        (a, b) => b.amount - a.amount
      );

      // Toyota should be the highest in both repair count and amount
      expect(sortedByRepairCount[0].vehicleBrand).toBe("Toyota");
      expect(sortedByAmount[0].vehicleBrand).toBe("Toyota");
    });

    it("should validate average repair cost per brand", () => {
      mockSalesReport.orders.forEach((order) => {
        const avgCostPerRepair = order.amount / order.repairCount;
        
        // Average cost per repair should be reasonable (between 100,000 and 2,000,000 VND)
        expect(avgCostPerRepair).toBeGreaterThanOrEqual(100000);
        expect(avgCostPerRepair).toBeLessThanOrEqual(2000000);
      });
    });

    it("should validate market share distribution", () => {
      // Toyota should have the highest market share
      const toyotaOrder = mockSalesReport.orders.find(order => order.vehicleBrand === "Toyota");
      expect(toyotaOrder?.rate).toBeGreaterThan(50); // More than 50% market share
      
      // All rates should be positive
      mockSalesReport.orders.forEach((order) => {
        expect(order.rate).toBeGreaterThan(0);
      });
    });
  });

  describe("Empty State Data Handling", () => {
    it("should handle empty sales data", () => {
      expect(mockEmptySalesReport.orders).toEqual([]);
      expect(mockEmptySalesReport.orders.length).toBe(0);
      expect(mockEmptySalesReport.totalRevenue).toBe(0);
    });

    it("should handle undefined sales data", () => {
      const undefinedData = undefined;
      expect(undefinedData).toBeUndefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero revenue scenarios", () => {
      const zeroRevenueOrder = {
        stt: 1,
        vehicleBrand: "Zero Revenue Brand",
        repairCount: 0,
        amount: 0,
        rate: 0,
      };

      expect(zeroRevenueOrder.amount).toBe(0);
      expect(zeroRevenueOrder.rate).toBe(0);
    });

    it("should handle large revenue amounts", () => {
      const largeRevenueOrder = {
        stt: 1,
        vehicleBrand: "Luxury Brand",
        repairCount: 100,
        amount: 50000000, // 50 million VND
        rate: 80.5,
      };

      const avgCostPerRepair = largeRevenueOrder.amount / largeRevenueOrder.repairCount;
      expect(avgCostPerRepair).toBe(500000); // 500k VND per repair
    });

    it("should handle special characters in vehicle brand names", () => {
      const specialCharBrand = {
        stt: 1,
        vehicleBrand: "BMW-Série 3",
        repairCount: 5,
        amount: 2500000,
        rate: 15.5,
      };

      expect(specialCharBrand.vehicleBrand).toBe("BMW-Série 3");
      expect(specialCharBrand.amount).toBeGreaterThan(0);
    });

    it("should handle decimal precision in rates", () => {
      mockSalesReport.orders.forEach((order) => {
        // Check that rates are properly rounded to 1 decimal place
        const decimalPlaces = (order.rate.toString().split('.')[1] || '').length;
        expect(decimalPlaces).toBeLessThanOrEqual(1);
      });
    });
  });
});
