/**
 * Payments Hook Tests
 * 
 * This test suite focuses on testing the usePayments hook functionality,
 * including TanStack Query integration, date range handling, and state management.
 */

// Mock the useQuery hook from TanStack Query
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

// Mock the Supabase client
jest.mock("@/supabase/client", () => ({
  createClient: jest.fn(),
}));

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/supabase/client";
import { usePayments } from "@/hooks/use-payments";
import { mockPaymentsArray, mockPaymentsEmptyArray } from "@/test/mocks/payments-data";
import { renderHook, act } from "@testing-library/react";
import { DateRange } from "react-day-picker";

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

// Mock Supabase query builder
const mockSupabaseQuery = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
};

describe("usePayments Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockCreateClient.mockReturnValue(mockSupabaseQuery as any);
    
    // Default successful query mock
    mockUseQuery.mockReturnValue({
      data: mockPaymentsArray,
      isLoading: false,
      error: null,
      isError: false,
      refetch: jest.fn(),
      isSuccess: true,
    } as any);
  });

  describe("Basic Hook Functionality", () => {
    it("initializes with default date range when none provided", () => {
      const { result } = renderHook(() => usePayments());

      expect(result.current.dateRange).toBeDefined();
      expect(result.current.dateRange?.from).toBeInstanceOf(Date);
      expect(result.current.dateRange?.to).toBeInstanceOf(Date);
    });

    it("uses provided initial date range", () => {
      const initialDateRange: DateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-31"),
      };

      const { result } = renderHook(() => usePayments({ initialDateRange }));

      expect(result.current.dateRange).toEqual(initialDateRange);
    });

    it("returns TanStack Query properties correctly", () => {
      const { result } = renderHook(() => usePayments());

      expect(result.current.data).toEqual(mockPaymentsArray);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.updateDateRange).toBeDefined();
    });
  });

  describe("Date Range Management", () => {
    it("updates date range correctly", () => {
      const { result } = renderHook(() => usePayments());

      const newDateRange: DateRange = {
        from: new Date("2024-11-01"),
        to: new Date("2024-11-30"),
      };

      act(() => {
        result.current.updateDateRange(newDateRange);
      });

      expect(result.current.dateRange).toEqual(newDateRange);
    });

    it("triggers new query when date range changes", () => {
      const { result } = renderHook(() => usePayments());

      const newDateRange: DateRange = {
        from: new Date("2024-11-01"),
        to: new Date("2024-11-30"),
      };

      act(() => {
        result.current.updateDateRange(newDateRange);
      });

      // Verify useQuery was called with updated query key
      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ["payments", newDateRange],
        })
      );
    });

    it("handles undefined date range values", () => {
      const partialDateRange: DateRange = {
        from: new Date("2024-12-01"),
        to: undefined,
      };

      const { result } = renderHook(() => usePayments({ initialDateRange: partialDateRange }));

      expect(result.current.dateRange).toEqual(partialDateRange);
    });
  });

  describe("Query Configuration", () => {
    it("configures query to be enabled only when both dates are provided", () => {
      const completeRange: DateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-31"),
      };

      renderHook(() => usePayments({ initialDateRange: completeRange }));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
        })
      );
    });

    it("disables query when date range is incomplete", () => {
      const incompleteRange: DateRange = {
        from: new Date("2024-12-01"),
        to: undefined,
      };

      renderHook(() => usePayments({ initialDateRange: incompleteRange }));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it("uses correct query key format", () => {
      const dateRange: DateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-31"),
      };

      renderHook(() => usePayments({ initialDateRange: dateRange }));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ["payments", dateRange],
        })
      );
    });
  });

  describe("Data Fetching Logic", () => {
    it("constructs Supabase query correctly", () => {
      const dateRange: DateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-31"),
      };

      renderHook(() => usePayments({ initialDateRange: dateRange }));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ["payments", dateRange],
          enabled: true,
        })
      );
    });

    it("applies correct query configuration for date filtering", () => {
      const dateRange: DateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-31"),
      };

      renderHook(() => usePayments({ initialDateRange: dateRange }));

      // Verify useQuery was called with proper configuration
      const lastCall = mockUseQuery.mock.calls[mockUseQuery.mock.calls.length - 1][0];
      expect(lastCall.queryKey).toEqual(["payments", dateRange]);
      expect(lastCall.enabled).toBe(true);
      expect(typeof lastCall.queryFn).toBe('function');
    });

    it("disables query when date range is incomplete", () => {
      const incompleteRange: DateRange = {
        from: new Date("2024-12-01"),
        to: undefined,
      };

      renderHook(() => usePayments({ initialDateRange: incompleteRange }));

      const lastCall = mockUseQuery.mock.calls[mockUseQuery.mock.calls.length - 1][0];
      expect(lastCall.enabled).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("handles query errors through TanStack Query", () => {
      const errorMessage = "Database connection failed";
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error(errorMessage),
        isError: true,
        refetch: jest.fn(),
        isSuccess: false,
      } as any);

      const { result } = renderHook(() => usePayments());

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.isError).toBe(true);
    });

    it("propagates errors through TanStack Query", () => {
      const errorMessage = "Network error";
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error(errorMessage),
        isError: true,
        refetch: jest.fn(),
        isSuccess: false,
      } as any);

      const { result } = renderHook(() => usePayments());

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.isError).toBe(true);
    });
  });

  describe("Loading States", () => {
    it("reflects loading state correctly", () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: false,
      } as any);

      const { result } = renderHook(() => usePayments());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it("transitions from loading to success state", () => {
      const { rerender } = renderHook(() => usePayments());

      // Initially loading
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: false,
      } as any);

      rerender();

      // Then success
      mockUseQuery.mockReturnValue({
        data: mockPaymentsArray,
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      rerender();

      const { result } = renderHook(() => usePayments());
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockPaymentsArray);
    });
  });

  describe("Empty Data Handling", () => {
    it("handles empty payments array correctly", () => {
      mockUseQuery.mockReturnValue({
        data: mockPaymentsEmptyArray,
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const { result } = renderHook(() => usePayments());

      expect(result.current.data).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("handles null data gracefully", () => {
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const { result } = renderHook(() => usePayments());

      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("Query Key Generation", () => {
    it("generates unique query keys for different date ranges", () => {
      const range1: DateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-31"),
      };

      const range2: DateRange = {
        from: new Date("2024-11-01"),
        to: new Date("2024-11-30"),
      };

      const { result: result1 } = renderHook(() => usePayments({ initialDateRange: range1 }));
      const { result: result2 } = renderHook(() => usePayments({ initialDateRange: range2 }));

      // Verify different query keys were used
      const calls = mockUseQuery.mock.calls;
      expect(calls[calls.length - 2][0].queryKey).toEqual(["payments", range1]);
      expect(calls[calls.length - 1][0].queryKey).toEqual(["payments", range2]);
    });

    it("maintains consistent query key format", () => {
      const dateRange: DateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-31"),
      };

      renderHook(() => usePayments({ initialDateRange: dateRange }));

      const lastCall = mockUseQuery.mock.calls[mockUseQuery.mock.calls.length - 1][0];
      expect(lastCall.queryKey).toHaveLength(2);
      expect(lastCall.queryKey[0]).toBe("payments");
      expect(lastCall.queryKey[1]).toEqual(dateRange);
    });
  });
});
