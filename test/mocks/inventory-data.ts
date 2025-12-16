/**
 * Mock data for inventory functionality
 * Used in testing spare parts processing, stock calculations, and display logic
 */

import type { SparePartWithEndingStock } from "@/app/(protected)/inventory/columns";
import type { StockCalculationResult } from "@/lib/inventory-calculations";
import type { SparePart } from "@/types/types";

export const mockSparePart: SparePart = {
  id: "part-001",
  name: "Brake Pads",
  price: 45.99,
  stock_quantity: 25,
  created_at: "2024-12-01T08:00:00.000Z",
};

export const mockSparePartOilFilter: SparePart = {
  id: "part-002",
  name: "Oil Filter",
  price: 12.5,
  stock_quantity: 100,
  created_at: "2024-12-01T08:30:00.000Z",
};

export const mockSparePartAirFilter: SparePart = {
  id: "part-003",
  name: "Air Filter",
  price: 18.75,
  stock_quantity: 0,
  created_at: "2024-12-01T09:00:00.000Z",
};

export const mockSparePartTires: SparePart = {
  id: "part-004",
  name: "All-Season Tire",
  price: 125.0,
  stock_quantity: 16,
  created_at: "2024-12-01T09:30:00.000Z",
};

export const mockSparePartBattery: SparePart = {
  id: "part-005",
  name: "Car Battery",
  price: 89.99,
  stock_quantity: 8,
  created_at: "2024-12-01T10:00:00.000Z",
};

export const mockSparePartNoStock: SparePart = {
  id: "part-006",
  name: "Spark Plugs",
  price: 8.99,
  stock_quantity: null,
  created_at: "2024-12-01T10:30:00.000Z",
};

export const mockSparePartZeroStock: SparePart = {
  id: "part-007",
  name: "Transmission Fluid",
  price: 15.99,
  stock_quantity: 0,
  created_at: "2024-12-01T11:00:00.000Z",
};

export const mockSparePartLargeStock: SparePart = {
  id: "part-008",
  name: "Engine Oil",
  price: 24.99,
  stock_quantity: 500,
  created_at: "2024-12-01T11:30:00.000Z",
};

// Arrays for testing
export const mockSparePartsArray: SparePart[] = [
  mockSparePart,
  mockSparePartOilFilter,
  mockSparePartAirFilter,
  mockSparePartTires,
  mockSparePartBattery,
];

export const mockSparePartsArrayExtended: SparePart[] = [
  mockSparePart,
  mockSparePartOilFilter,
  mockSparePartAirFilter,
  mockSparePartTires,
  mockSparePartBattery,
  mockSparePartNoStock,
  mockSparePartZeroStock,
  mockSparePartLargeStock,
];

export const mockSparePartsEmptyArray: SparePart[] = [];

// Spare parts with ending stock calculations
export const mockSparePartWithEndingStock: SparePartWithEndingStock = {
  ...mockSparePart,
  endingStock: 20,
};

export const mockSparePartOilFilterWithEndingStock: SparePartWithEndingStock = {
  ...mockSparePartOilFilter,
  endingStock: 85,
};

export const mockSparePartAirFilterWithEndingStock: SparePartWithEndingStock = {
  ...mockSparePartAirFilter,
  endingStock: 0,
};

export const mockSparePartsWithEndingStockArray: SparePartWithEndingStock[] = [
  mockSparePartWithEndingStock,
  mockSparePartOilFilterWithEndingStock,
  mockSparePartAirFilterWithEndingStock,
  {
    ...mockSparePartTires,
    endingStock: 12,
  },
  {
    ...mockSparePartBattery,
    endingStock: 6,
  },
];

// Stock calculation results
export const mockStockCalculationResult: StockCalculationResult = {
  partId: "part-001",
  currentStock: 25,
  beginStock: 50,
  usedDuringPeriod: 30,
  endStock: 20,
};

export const mockStockCalculationOilFilter: StockCalculationResult = {
  partId: "part-002",
  currentStock: 100,
  beginStock: 150,
  usedDuringPeriod: 65,
  endStock: 85,
};

export const mockStockCalculationAirFilter: StockCalculationResult = {
  partId: "part-003",
  currentStock: 0,
  beginStock: 30,
  usedDuringPeriod: 30,
  endStock: 0,
};

export const mockStockCalculationsArray: StockCalculationResult[] = [
  mockStockCalculationResult,
  mockStockCalculationOilFilter,
  mockStockCalculationAirFilter,
];

// Edge cases for testing
export const mockSparePartMinimalData: SparePart = {
  id: "part-minimal",
  name: "Minimal Part",
  price: 0.01,
  stock_quantity: 1,
  created_at: "2024-12-01T12:00:00.000Z",
};

export const mockSparePartInvalidPrice: Partial<SparePart> = {
  id: "part-invalid",
  name: "Invalid Part",
  price: -10.0, // Invalid negative price
  stock_quantity: 5,
  created_at: "2024-12-01T12:30:00.000Z",
};

export const mockSparePartMissingName: Partial<SparePart> = {
  id: "part-no-name",
  name: "", // Invalid empty name
  price: 25.0,
  stock_quantity: 5,
  created_at: "2024-12-01T13:00:00.000Z",
};
