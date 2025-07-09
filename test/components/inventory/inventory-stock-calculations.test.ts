/**
 * Inventory Stock Calculations Tests
 * 
 * This test suite focuses on testing the inventory stock calculation logic,
 * business logic patterns, and calculation functions without complex async operations.
 */

import {
  mockStockCalculationResult,
  mockStockCalculationsArray,
} from "@/test/mocks/inventory-data";
import type { StockCalculationResult } from "@/lib/inventory-calculations";

describe("Inventory Stock Calculations", () => {
  describe("Stock Calculation Business Logic", () => {
    it("calculates stock utilization correctly", () => {
      const calculateUtilization = (calc: StockCalculationResult): number => {
        if (calc.beginStock === 0) return 0;
        return (calc.usedDuringPeriod / calc.beginStock) * 100;
      };

      const utilization = calculateUtilization(mockStockCalculationResult);
      expect(utilization).toBe(60); // 30 used out of 50 beginning
    });

    it("handles zero beginning stock in utilization", () => {
      const calculateUtilization = (calc: StockCalculationResult): number => {
        if (calc.beginStock === 0) return 0;
        return (calc.usedDuringPeriod / calc.beginStock) * 100;
      };

      const zeroBeginCalc: StockCalculationResult = {
        ...mockStockCalculationResult,
        beginStock: 0,
      };

      expect(calculateUtilization(zeroBeginCalc)).toBe(0);
    });

    it("calculates stock turnover correctly", () => {
      const calculateTurnover = (calc: StockCalculationResult): number => {
        const avgStock = (calc.beginStock + calc.endStock) / 2;
        if (avgStock === 0) return 0;
        return calc.usedDuringPeriod / avgStock;
      };

      const turnover = calculateTurnover(mockStockCalculationResult);
      const expectedAvg = (50 + 20) / 2; // 35
      expect(turnover).toBeCloseTo(30 / 35, 2);
    });

    it("handles zero average stock in turnover", () => {
      const calculateTurnover = (calc: StockCalculationResult): number => {
        const avgStock = (calc.beginStock + calc.endStock) / 2;
        if (avgStock === 0) return 0;
        return calc.usedDuringPeriod / avgStock;
      };

      const zeroAvgCalc: StockCalculationResult = {
        ...mockStockCalculationResult,
        beginStock: 0,
        endStock: 0,
      };

      expect(calculateTurnover(zeroAvgCalc)).toBe(0);
    });

    it("processes multiple stock calculations", () => {
      const calculateUtilization = (calc: StockCalculationResult): number => {
        if (calc.beginStock === 0) return 0;
        return (calc.usedDuringPeriod / calc.beginStock) * 100;
      };

      const calculateTurnover = (calc: StockCalculationResult): number => {
        const avgStock = (calc.beginStock + calc.endStock) / 2;
        if (avgStock === 0) return 0;
        return calc.usedDuringPeriod / avgStock;
      };

      mockStockCalculationsArray.forEach(calc => {
        const utilization = calculateUtilization(calc);
        const turnover = calculateTurnover(calc);
        
        expect(typeof utilization).toBe('number');
        expect(typeof turnover).toBe('number');
        expect(utilization).toBeGreaterThanOrEqual(0);
        expect(turnover).toBeGreaterThanOrEqual(0);
      });
    });

    it("identifies low stock situations", () => {
      const isLowStock = (calc: StockCalculationResult, threshold: number = 10): boolean => {
        return calc.endStock <= threshold;
      };

      expect(isLowStock(mockStockCalculationResult, 25)).toBe(true); // endStock = 20
      expect(isLowStock(mockStockCalculationResult, 15)).toBe(false);
    });

    it("calculates stock movement correctly", () => {
      const getStockMovement = (calc: StockCalculationResult): number => {
        return calc.beginStock - calc.endStock;
      };

      const movement = getStockMovement(mockStockCalculationResult);
      expect(movement).toBe(30); // 50 - 20
    });

    it("validates calculation consistency", () => {
      const isConsistentCalculation = (calc: StockCalculationResult): boolean => {
        // beginStock - usedDuringPeriod should equal endStock for current period calculations
        return calc.beginStock - calc.usedDuringPeriod === calc.endStock;
      };

      expect(isConsistentCalculation(mockStockCalculationResult)).toBe(true);
    });

    it("handles extreme values correctly", () => {
      const extremeCalc: StockCalculationResult = {
        partId: "extreme-part",
        currentStock: 999999,
        beginStock: 1000000,
        usedDuringPeriod: 1,
        endStock: 999999,
      };

      const calculateUtilization = (calc: StockCalculationResult): number => {
        if (calc.beginStock === 0) return 0;
        return (calc.usedDuringPeriod / calc.beginStock) * 100;
      };

      const utilization = calculateUtilization(extremeCalc);
      expect(utilization).toBeCloseTo(0.0001, 4); // Very small utilization
    });

    it("handles calculations with different data types", () => {
      const variations: StockCalculationResult[] = [
        {
          partId: "var-1",
          currentStock: 10,
          beginStock: 15,
          usedDuringPeriod: 5,
          endStock: 10,
        },
        {
          partId: "var-2",
          currentStock: 0,
          beginStock: 10,
          usedDuringPeriod: 10,
          endStock: 0,
        },
        {
          partId: "var-3",
          currentStock: 100,
          beginStock: 100,
          usedDuringPeriod: 0,
          endStock: 100,
        },
      ];

      const isConsistentCalculation = (calc: StockCalculationResult): boolean => {
        return calc.beginStock - calc.usedDuringPeriod === calc.endStock;
      };

      variations.forEach(calc => {
        expect(isConsistentCalculation(calc)).toBe(true);
        expect(calc.currentStock).toBeGreaterThanOrEqual(0);
        expect(calc.beginStock).toBeGreaterThanOrEqual(0);
        expect(calc.usedDuringPeriod).toBeGreaterThanOrEqual(0);
        expect(calc.endStock).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("Stock Analysis Functions", () => {
    it("categorizes stock levels correctly", () => {
      const categorizeStock = (endStock: number): string => {
        if (endStock === 0) return "out-of-stock";
        if (endStock <= 5) return "critical";
        if (endStock <= 20) return "low";
        if (endStock <= 50) return "normal";
        return "abundant";
      };

      expect(categorizeStock(0)).toBe("out-of-stock");
      expect(categorizeStock(3)).toBe("critical");
      expect(categorizeStock(15)).toBe("low");
      expect(categorizeStock(35)).toBe("normal");
      expect(categorizeStock(100)).toBe("abundant");
    });

    it("calculates reorder points", () => {
      const calculateReorderPoint = (
        averageUsage: number,
        leadTimeDays: number,
        safetyStock: number = 0
      ): number => {
        return (averageUsage * leadTimeDays) + safetyStock;
      };

      expect(calculateReorderPoint(5, 7, 10)).toBe(45); // 5*7 + 10
      expect(calculateReorderPoint(2, 14, 0)).toBe(28); // 2*14 + 0
      expect(calculateReorderPoint(0, 7, 5)).toBe(5); // 0*7 + 5
    });

    it("determines stock velocity", () => {
      const calculateStockVelocity = (calc: StockCalculationResult, periodDays: number): number => {
        if (periodDays === 0) return 0;
        return calc.usedDuringPeriod / periodDays;
      };

      const velocity30Days = calculateStockVelocity(mockStockCalculationResult, 30);
      expect(velocity30Days).toBeCloseTo(30 / 30, 2); // 1.0 per day

      const velocity7Days = calculateStockVelocity(mockStockCalculationResult, 7);
      expect(velocity7Days).toBeCloseTo(30 / 7, 2); // ~4.29 per day
    });

    it("projects future stock levels", () => {
      const projectFutureStock = (
        currentStock: number,
        dailyUsage: number,
        days: number
      ): number => {
        return Math.max(0, currentStock - (dailyUsage * days));
      };

      expect(projectFutureStock(100, 5, 10)).toBe(50); // 100 - (5*10)
      expect(projectFutureStock(20, 5, 10)).toBe(0); // Can't go negative
      expect(projectFutureStock(50, 0, 30)).toBe(50); // No usage
    });

    it("calculates days of supply remaining", () => {
      const calculateDaysOfSupply = (currentStock: number, dailyUsage: number): number => {
        if (dailyUsage === 0) return Infinity;
        return currentStock / dailyUsage;
      };

      expect(calculateDaysOfSupply(30, 2)).toBe(15); // 15 days
      expect(calculateDaysOfSupply(100, 5)).toBe(20); // 20 days
      expect(calculateDaysOfSupply(50, 0)).toBe(Infinity); // No usage
      expect(calculateDaysOfSupply(0, 5)).toBe(0); // Out of stock
    });
  });

  describe("Stock Data Aggregation", () => {
    it("aggregates multiple calculations correctly", () => {
      const aggregateStockData = (calculations: StockCalculationResult[]) => {
        const totalBeginStock = calculations.reduce((sum, calc) => sum + calc.beginStock, 0);
        const totalUsage = calculations.reduce((sum, calc) => sum + calc.usedDuringPeriod, 0);
        const totalEndStock = calculations.reduce((sum, calc) => sum + calc.endStock, 0);
        
        return {
          totalBeginStock,
          totalUsage,
          totalEndStock,
          averageUtilization: totalBeginStock > 0 ? (totalUsage / totalBeginStock) * 100 : 0,
          partsCount: calculations.length,
        };
      };

      const aggregated = aggregateStockData(mockStockCalculationsArray);
      
      expect(aggregated.partsCount).toBe(mockStockCalculationsArray.length);
      expect(aggregated.totalBeginStock).toBeGreaterThan(0);
      expect(aggregated.totalUsage).toBeGreaterThanOrEqual(0);
      expect(aggregated.totalEndStock).toBeGreaterThanOrEqual(0);
      expect(aggregated.averageUtilization).toBeGreaterThanOrEqual(0);
      expect(aggregated.averageUtilization).toBeLessThanOrEqual(100);
    });

    it("handles empty calculations array", () => {
      const aggregateStockData = (calculations: StockCalculationResult[]) => {
        const totalBeginStock = calculations.reduce((sum, calc) => sum + calc.beginStock, 0);
        const totalUsage = calculations.reduce((sum, calc) => sum + calc.usedDuringPeriod, 0);
        const totalEndStock = calculations.reduce((sum, calc) => sum + calc.endStock, 0);
        
        return {
          totalBeginStock,
          totalUsage,
          totalEndStock,
          averageUtilization: totalBeginStock > 0 ? (totalUsage / totalBeginStock) * 100 : 0,
          partsCount: calculations.length,
        };
      };

      const aggregated = aggregateStockData([]);
      
      expect(aggregated.partsCount).toBe(0);
      expect(aggregated.totalBeginStock).toBe(0);
      expect(aggregated.totalUsage).toBe(0);
      expect(aggregated.totalEndStock).toBe(0);
      expect(aggregated.averageUtilization).toBe(0);
    });

    it("filters calculations by criteria", () => {
      const filterLowStockParts = (
        calculations: StockCalculationResult[],
        threshold: number
      ): StockCalculationResult[] => {
        return calculations.filter(calc => calc.endStock <= threshold);
      };

      const filterHighUsageParts = (
        calculations: StockCalculationResult[],
        minUsage: number
      ): StockCalculationResult[] => {
        return calculations.filter(calc => calc.usedDuringPeriod >= minUsage);
      };

      const lowStockParts = filterLowStockParts(mockStockCalculationsArray, 10);
      const highUsageParts = filterHighUsageParts(mockStockCalculationsArray, 20);

      expect(Array.isArray(lowStockParts)).toBe(true);
      expect(Array.isArray(highUsageParts)).toBe(true);
      
      lowStockParts.forEach(part => {
        expect(part.endStock).toBeLessThanOrEqual(10);
      });
      
      highUsageParts.forEach(part => {
        expect(part.usedDuringPeriod).toBeGreaterThanOrEqual(20);
      });
    });
  });

  describe("Edge Cases and Validation", () => {
    it("handles calculation with all zero values", () => {
      const zeroCalc: StockCalculationResult = {
        partId: "zero-part",
        currentStock: 0,
        beginStock: 0,
        usedDuringPeriod: 0,
        endStock: 0,
      };

      const calculateUtilization = (calc: StockCalculationResult): number => {
        if (calc.beginStock === 0) return 0;
        return (calc.usedDuringPeriod / calc.beginStock) * 100;
      };

      expect(calculateUtilization(zeroCalc)).toBe(0);
      expect(zeroCalc.currentStock).toBe(0);
      expect(zeroCalc.beginStock - zeroCalc.usedDuringPeriod).toBe(zeroCalc.endStock);
    });

    it("validates calculation result structure", () => {
      const validateCalculation = (calc: any): boolean => {
        return (
          typeof calc.partId === 'string' &&
          typeof calc.currentStock === 'number' &&
          typeof calc.beginStock === 'number' &&
          typeof calc.usedDuringPeriod === 'number' &&
          typeof calc.endStock === 'number' &&
          calc.currentStock >= 0 &&
          calc.beginStock >= 0 &&
          calc.usedDuringPeriod >= 0 &&
          calc.endStock >= 0
        );
      };

      mockStockCalculationsArray.forEach(calc => {
        expect(validateCalculation(calc)).toBe(true);
      });

      // Test invalid calculation
      const invalidCalc = {
        partId: 123, // Should be string
        currentStock: "invalid", // Should be number
        beginStock: -5, // Should be non-negative
      };

      expect(validateCalculation(invalidCalc)).toBe(false);
    });

    it("handles large numbers correctly", () => {
      const largeCalc: StockCalculationResult = {
        partId: "large-part",
        currentStock: 1000000,
        beginStock: 1000000,
        usedDuringPeriod: 500000,
        endStock: 500000,
      };

      const calculateUtilization = (calc: StockCalculationResult): number => {
        if (calc.beginStock === 0) return 0;
        return (calc.usedDuringPeriod / calc.beginStock) * 100;
      };

      expect(calculateUtilization(largeCalc)).toBe(50);
      expect(largeCalc.beginStock - largeCalc.usedDuringPeriod).toBe(largeCalc.endStock);
    });
  });
});
