/**
 * Inventory Data Processing Tests
 *
 * This test suite focuses on validating the data processing and transformation logic
 * used in the inventory functionality. Tests core business logic without UI dependencies.
 */

import type { SparePartWithEndingStock } from "@/app/(protected)/inventory/columns";
import type { StockCalculationResult } from "@/lib/inventory-calculations";
import {
  mockSparePart,
  mockSparePartAirFilter,
  mockSparePartBattery,
  mockSparePartInvalidPrice,
  mockSparePartLargeStock,
  mockSparePartMinimalData,
  mockSparePartMissingName,
  mockSparePartNoStock,
  mockSparePartOilFilter,
  mockSparePartsArray,
  mockSparePartsArrayExtended,
  mockSparePartsEmptyArray,
  mockSparePartTires,
  mockSparePartZeroStock,
  mockStockCalculationResult,
  mockStockCalculationsArray,
} from "@/test/mocks/inventory-data";
import type { SparePart } from "@/types/types";

// Helper function for spare part data validation
const validateSparePartData = (
  part: SparePart | Partial<SparePart>,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate required fields
  if (!part.id) {
    errors.push("Part ID is required");
  }
  if (!part.name || part.name.trim() === "") {
    errors.push("Part name is required and cannot be empty");
  }
  if (typeof part.price !== "number" || part.price < 0) {
    errors.push("Part price must be a non-negative number");
  }

  // Validate optional fields
  if (
    part.stock_quantity !== null &&
    part.stock_quantity !== undefined &&
    part.stock_quantity < 0
  ) {
    errors.push("Stock quantity cannot be negative");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

describe("Inventory Data Processing", () => {
  describe("Currency Formatting Logic", () => {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    };

    it("formats standard prices correctly", () => {
      expect(formatCurrency(45.99)).toBe("$45.99");
      expect(formatCurrency(125.0)).toBe("$125.00");
      expect(formatCurrency(8.99)).toBe("$8.99");
    });

    it("formats zero price correctly", () => {
      expect(formatCurrency(0)).toBe("$0.00");
    });

    it("formats large amounts correctly", () => {
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
      expect(formatCurrency(10000.0)).toBe("$10,000.00");
    });

    it("formats small amounts correctly", () => {
      expect(formatCurrency(0.01)).toBe("$0.01");
      expect(formatCurrency(0.99)).toBe("$0.99");
    });
  });

  describe("Spare Part Data Validation", () => {
    it("validates complete spare part data correctly", () => {
      const validation = validateSparePartData(mockSparePart);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("validates multiple spare parts correctly", () => {
      mockSparePartsArray.forEach((part) => {
        const validation = validateSparePartData(part);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      });
    });

    it("detects missing required fields", () => {
      const validation = validateSparePartData(mockSparePartMissingName);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "Part name is required and cannot be empty",
      );
    });

    it("detects invalid price values", () => {
      const validation = validateSparePartData(mockSparePartInvalidPrice);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "Part price must be a non-negative number",
      );
    });

    it("handles null stock quantity correctly", () => {
      const validation = validateSparePartData(mockSparePartNoStock);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("handles zero stock quantity correctly", () => {
      const validation = validateSparePartData(mockSparePartZeroStock);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe("Stock Level Processing", () => {
    const determineStockStatus = (stockQuantity: number | null): string => {
      if (stockQuantity === null || stockQuantity === undefined) {
        return "unknown";
      }
      if (stockQuantity === 0) {
        return "out-of-stock";
      }
      if (stockQuantity <= 5) {
        return "low-stock";
      }
      return "in-stock";
    };

    it("determines stock status correctly for various levels", () => {
      expect(determineStockStatus(mockSparePart.stock_quantity)).toBe(
        "in-stock",
      );
      expect(determineStockStatus(mockSparePartOilFilter.stock_quantity)).toBe(
        "in-stock",
      );
      expect(determineStockStatus(mockSparePartAirFilter.stock_quantity)).toBe(
        "out-of-stock",
      );
      expect(determineStockStatus(mockSparePartNoStock.stock_quantity)).toBe(
        "unknown",
      );
    });

    it("identifies low stock items correctly", () => {
      const lowStockPart: SparePart = {
        ...mockSparePart,
        stock_quantity: 3,
      };
      expect(determineStockStatus(lowStockPart.stock_quantity)).toBe(
        "low-stock",
      );
    });

    it("handles edge case stock levels", () => {
      expect(determineStockStatus(1)).toBe("low-stock");
      expect(determineStockStatus(5)).toBe("low-stock");
      expect(determineStockStatus(6)).toBe("in-stock");
    });
  });

  describe("Spare Parts Sorting and Filtering", () => {
    const sortPartsByName = (parts: SparePart[]): SparePart[] => {
      return [...parts].sort((a, b) => a.name.localeCompare(b.name));
    };

    const sortPartsByPrice = (parts: SparePart[]): SparePart[] => {
      return [...parts].sort((a, b) => a.price - b.price);
    };

    const filterPartsByStock = (
      parts: SparePart[],
      hasStock: boolean,
    ): SparePart[] => {
      return parts.filter((part) =>
        hasStock
          ? part.stock_quantity !== null && part.stock_quantity > 0
          : part.stock_quantity === null || part.stock_quantity === 0,
      );
    };

    it("sorts parts by name alphabetically", () => {
      const sorted = sortPartsByName(mockSparePartsArray);
      expect(sorted[0].name).toBe("Air Filter");
      expect(sorted[1].name).toBe("All-Season Tire");
      expect(sorted[2].name).toBe("Brake Pads");
    });

    it("sorts parts by price ascending", () => {
      const sorted = sortPartsByPrice(mockSparePartsArray);
      expect(sorted[0].price).toBe(12.5); // Oil Filter
      expect(sorted[4].price).toBe(125.0); // All-Season Tire
    });

    it("filters parts with stock correctly", () => {
      const withStock = filterPartsByStock(mockSparePartsArrayExtended, true);
      expect(withStock).toHaveLength(5); // Excludes zero stock and null stock parts
      expect(
        withStock.every(
          (part) => part.stock_quantity && part.stock_quantity > 0,
        ),
      ).toBe(true);
    });

    it("filters parts without stock correctly", () => {
      const withoutStock = filterPartsByStock(
        mockSparePartsArrayExtended,
        false,
      );
      expect(withoutStock).toHaveLength(3); // Zero stock and null stock parts
      expect(
        withoutStock.every(
          (part) => !part.stock_quantity || part.stock_quantity === 0,
        ),
      ).toBe(true);
    });

    it("handles empty array correctly", () => {
      expect(sortPartsByName(mockSparePartsEmptyArray)).toHaveLength(0);
      expect(filterPartsByStock(mockSparePartsEmptyArray, true)).toHaveLength(
        0,
      );
    });
  });

  describe("Stock Calculation Processing", () => {
    const calculateStockUtilization = (
      calc: StockCalculationResult,
    ): number => {
      if (calc.beginStock === 0) return 0;
      return (calc.usedDuringPeriod / calc.beginStock) * 100;
    };

    const calculateStockTurnover = (calc: StockCalculationResult): number => {
      const avgStock = (calc.beginStock + calc.endStock) / 2;
      if (avgStock === 0) return 0;
      return calc.usedDuringPeriod / avgStock;
    };

    it("calculates stock utilization correctly", () => {
      const utilization = calculateStockUtilization(mockStockCalculationResult);
      expect(utilization).toBe(60); // 30 used out of 50 beginning stock
    });

    it("calculates stock turnover correctly", () => {
      const turnover = calculateStockTurnover(mockStockCalculationResult);
      const avgStock = (50 + 20) / 2; // 35
      expect(turnover).toBeCloseTo(30 / 35, 2);
    });

    it("handles zero beginning stock in utilization", () => {
      const zeroBeginCalc: StockCalculationResult = {
        ...mockStockCalculationResult,
        beginStock: 0,
      };
      expect(calculateStockUtilization(zeroBeginCalc)).toBe(0);
    });

    it("handles zero average stock in turnover", () => {
      const zeroAvgCalc: StockCalculationResult = {
        ...mockStockCalculationResult,
        beginStock: 0,
        endStock: 0,
      };
      expect(calculateStockTurnover(zeroAvgCalc)).toBe(0);
    });

    it("processes multiple stock calculations", () => {
      mockStockCalculationsArray.forEach((calc) => {
        const utilization = calculateStockUtilization(calc);
        const turnover = calculateStockTurnover(calc);

        expect(typeof utilization).toBe("number");
        expect(typeof turnover).toBe("number");
        expect(utilization).toBeGreaterThanOrEqual(0);
        expect(turnover).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("Ending Stock Calculations", () => {
    const combinePartWithEndingStock = (
      part: SparePart,
      stockCalc: StockCalculationResult | undefined,
    ): SparePartWithEndingStock => {
      return {
        ...part,
        endingStock: stockCalc?.endStock ?? part.stock_quantity ?? 0,
      };
    };

    it("combines part with stock calculation correctly", () => {
      const combined = combinePartWithEndingStock(
        mockSparePart,
        mockStockCalculationResult,
      );
      expect(combined.endingStock).toBe(20);
      expect(combined.id).toBe(mockSparePart.id);
      expect(combined.name).toBe(mockSparePart.name);
    });

    it("falls back to current stock when no calculation available", () => {
      const combined = combinePartWithEndingStock(
        mockSparePartOilFilter,
        undefined,
      );
      expect(combined.endingStock).toBe(100); // Falls back to stock_quantity
    });

    it("handles null stock quantity with no calculation", () => {
      const combined = combinePartWithEndingStock(
        mockSparePartNoStock,
        undefined,
      );
      expect(combined.endingStock).toBe(0); // Falls back to 0 when stock_quantity is null
    });

    it("prioritizes calculation over current stock", () => {
      const customCalc: StockCalculationResult = {
        partId: mockSparePart.id,
        currentStock: 25,
        beginStock: 50,
        usedDuringPeriod: 35,
        endStock: 15, // Different from current stock
      };

      const combined = combinePartWithEndingStock(mockSparePart, customCalc);
      expect(combined.endingStock).toBe(15); // Uses calculation, not current stock
    });
  });

  describe("Data Edge Cases", () => {
    it("handles minimal valid data correctly", () => {
      const validation = validateSparePartData(mockSparePartMinimalData);
      expect(validation.isValid).toBe(true);
    });

    it("handles large stock quantities correctly", () => {
      const validation = validateSparePartData(mockSparePartLargeStock);
      expect(validation.isValid).toBe(true);
      expect(mockSparePartLargeStock.stock_quantity).toBe(500);
    });

    it("handles price formatting for extreme values", () => {
      const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
      };

      expect(formatCurrency(0.01)).toBe("$0.01");
      expect(formatCurrency(999999.99)).toBe("$999,999.99");
    });

    it("processes empty arrays without errors", () => {
      const sortPartsByName = (parts: SparePart[]): SparePart[] => {
        return [...parts].sort((a, b) => a.name.localeCompare(b.name));
      };

      expect(() => sortPartsByName(mockSparePartsEmptyArray)).not.toThrow();
      expect(sortPartsByName(mockSparePartsEmptyArray)).toHaveLength(0);
    });
  });
});
