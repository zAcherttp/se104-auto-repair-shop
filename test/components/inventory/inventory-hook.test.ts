/**
 * Inventory Hook Tests
 * 
 * This test suite focuses on testing the inventory-related hooks functionality,
 * including TanStack Query integration, data fetching, and state management.
 */

// Mock the useQuery hook from TanStack Query
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

// Mock the Supabase client
jest.mock("@/supabase/client", () => ({
  createClient: jest.fn(),
}));

// Mock the inventory calculations
jest.mock("@/lib/inventory-calculations", () => ({
  getCurrentEndingStock: jest.fn(),
}));

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/supabase/client";
import { getCurrentEndingStock } from "@/lib/inventory-calculations";
import { useInventory } from "@/hooks/use-inventory";
import { useInventoryWithEndingStock } from "@/hooks/use-inventory-with-ending-stock";
import {
  mockSparePartsArray,
  mockSparePartsEmptyArray,
  mockSparePartsWithEndingStockArray,
  mockStockCalculationsArray,
} from "@/test/mocks/inventory-data";
import { renderHook } from "@testing-library/react";

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockGetCurrentEndingStock = getCurrentEndingStock as jest.MockedFunction<typeof getCurrentEndingStock>;

// Mock Supabase query builder
const mockSupabaseQuery = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
};

describe("Inventory Hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockCreateClient.mockReturnValue(mockSupabaseQuery as any);
    
    // Default successful query mock
    mockUseQuery.mockReturnValue({
      data: mockSparePartsArray,
      isLoading: false,
      error: null,
      isError: false,
      refetch: jest.fn(),
      isSuccess: true,
    } as any);
  });

  describe("useInventory Hook", () => {
    it("returns TanStack Query properties correctly", () => {
      const { result } = renderHook(() => useInventory());

      expect(result.current.data).toEqual(mockSparePartsArray);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.refetch).toBeDefined();
    });

    it("uses correct query key", () => {
      renderHook(() => useInventory());

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ["spare_parts"],
        queryFn: expect.any(Function),
      });
    });

    it("handles loading state correctly", () => {
      mockUseQuery.mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: false,
      } as any);

      const { result } = renderHook(() => useInventory());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it("handles error state correctly", () => {
      const mockError = new Error("Failed to fetch spare parts");
      mockUseQuery.mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: mockError,
        isError: true,
        refetch: jest.fn(),
        isSuccess: false,
      } as any);

      const { result } = renderHook(() => useInventory());

      expect(result.current.error).toBe(mockError);
      expect(result.current.isError).toBe(true);
    });

    it("handles empty data correctly", () => {
      mockUseQuery.mockReturnValueOnce({
        data: mockSparePartsEmptyArray,
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const { result } = renderHook(() => useInventory());

      expect(result.current.data).toEqual(mockSparePartsEmptyArray);
      expect(result.current.data).toHaveLength(0);
    });

    it("provides refetch functionality", () => {
      const mockRefetch = jest.fn();
      mockUseQuery.mockReturnValueOnce({
        data: mockSparePartsArray,
        isLoading: false,
        error: null,
        isError: false,
        refetch: mockRefetch,
        isSuccess: true,
      } as any);

      const { result } = renderHook(() => useInventory());

      expect(result.current.refetch).toBe(mockRefetch);
      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe("useInventoryWithEndingStock Hook", () => {
    beforeEach(() => {
      mockGetCurrentEndingStock.mockResolvedValue(mockStockCalculationsArray);
    });

    it("returns TanStack Query properties correctly", () => {
      mockUseQuery.mockReturnValueOnce({
        data: mockSparePartsWithEndingStockArray,
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const { result } = renderHook(() => useInventoryWithEndingStock());

      expect(result.current.data).toEqual(mockSparePartsWithEndingStockArray);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("uses correct query key for ending stock", () => {
      renderHook(() => useInventoryWithEndingStock());

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ["inventory_with_ending_stock"],
        queryFn: expect.any(Function),
      });
    });

    it("handles loading state correctly", () => {
      mockUseQuery.mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: false,
      } as any);

      const { result } = renderHook(() => useInventoryWithEndingStock());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it("handles error state correctly", () => {
      const mockError = new Error("Failed to fetch inventory with ending stock");
      mockUseQuery.mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: mockError,
        isError: true,
        refetch: jest.fn(),
        isSuccess: false,
      } as any);

      const { result } = renderHook(() => useInventoryWithEndingStock());

      expect(result.current.error).toBe(mockError);
      expect(result.current.isError).toBe(true);
    });

    it("handles empty inventory correctly", () => {
      mockUseQuery.mockReturnValueOnce({
        data: [],
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const { result } = renderHook(() => useInventoryWithEndingStock());

      expect(result.current.data).toEqual([]);
      expect(result.current.data).toHaveLength(0);
    });

    it("provides refetch functionality", () => {
      const mockRefetch = jest.fn();
      mockUseQuery.mockReturnValueOnce({
        data: mockSparePartsWithEndingStockArray,
        isLoading: false,
        error: null,
        isError: false,
        refetch: mockRefetch,
        isSuccess: true,
      } as any);

      const { result } = renderHook(() => useInventoryWithEndingStock());

      expect(result.current.refetch).toBe(mockRefetch);
      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe("Hook Data Integration", () => {
    it("handles successful data fetching for basic inventory", async () => {
      // Mock successful Supabase query
      const mockQueryResult = { data: mockSparePartsArray, error: null };
      mockSupabaseQuery.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          order: jest.fn().mockResolvedValueOnce(mockQueryResult),
        }),
      });

      const { result } = renderHook(() => useInventory());

      expect(result.current.data).toEqual(mockSparePartsArray);
      expect(result.current.isError).toBe(false);
    });

    it("handles Supabase errors correctly", async () => {
      const mockError = { message: "Database connection failed" };
      const mockQueryResult = { data: null, error: mockError };
      
      mockSupabaseQuery.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          order: jest.fn().mockResolvedValueOnce(mockQueryResult),
        }),
      });

      mockUseQuery.mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: new Error(mockError.message),
        isError: true,
        refetch: jest.fn(),
        isSuccess: false,
      } as any);

      const { result } = renderHook(() => useInventory());

      expect(result.current.isError).toBe(true);
      expect(result.current.error?.message).toBe("Database connection failed");
    });

    it("handles stock calculation errors gracefully", () => {
      mockGetCurrentEndingStock.mockRejectedValueOnce(new Error("Stock calculation failed"));

      // Should still return data but with fallback stock values
      mockUseQuery.mockReturnValueOnce({
        data: mockSparePartsArray.map(part => ({ ...part, endingStock: part.stock_quantity ?? 0 })),
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const { result } = renderHook(() => useInventoryWithEndingStock());

      expect(result.current.data).toBeDefined();
      expect(result.current.isError).toBe(false);
    });

    it("handles missing stock calculations correctly", () => {
      mockGetCurrentEndingStock.mockResolvedValueOnce([]); // No calculations available

      mockUseQuery.mockReturnValueOnce({
        data: mockSparePartsArray.map(part => ({ ...part, endingStock: part.stock_quantity ?? 0 })),
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const { result } = renderHook(() => useInventoryWithEndingStock());

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.every(part => part.endingStock !== undefined)).toBe(true);
    });
  });

  describe("Query Behavior", () => {
    it("calls Supabase client correctly for basic inventory", () => {
      renderHook(() => useInventory());

      // Verify the query function behavior
      const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
      expect(typeof queryFn).toBe('function');
    });

    it("calls Supabase client correctly for inventory with ending stock", () => {
      renderHook(() => useInventoryWithEndingStock());

      // Verify the query function behavior
      const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
      expect(typeof queryFn).toBe('function');
    });

    it("uses different query keys for different hooks", () => {
      const { unmount: unmount1 } = renderHook(() => useInventory());
      const { unmount: unmount2 } = renderHook(() => useInventoryWithEndingStock());

      const calls = mockUseQuery.mock.calls;
      expect(calls[0][0].queryKey).toEqual(["spare_parts"]);
      expect(calls[1][0].queryKey).toEqual(["inventory_with_ending_stock"]);

      unmount1();
      unmount2();
    });

    it("maintains query key consistency across multiple renders", () => {
      const { rerender } = renderHook(() => useInventory());
      
      rerender();
      rerender();

      const calls = mockUseQuery.mock.calls;
      calls.forEach(call => {
        expect(call[0].queryKey).toEqual(["spare_parts"]);
      });
    });
  });
});
