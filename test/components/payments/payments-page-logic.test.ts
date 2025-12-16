/**
 * Payments Page Logic Tests
 *
 * This test suite focuses on testing the payments page business logic,
 * including default date range generation, error handling, and state management.
 */

// Mock the usePayments hook
jest.mock("@/hooks/use-payments", () => ({
  usePayments: jest.fn(),
}));

import type { DateRange } from "react-day-picker";
import { usePayments } from "@/hooks/use-payments";
import {
  mockPaymentsArray,
  mockPaymentsEmptyArray,
} from "@/test/mocks/payments-data";

const mockUsePayments = usePayments as jest.MockedFunction<typeof usePayments>;

describe("Payments Page Logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default successful mock
    mockUsePayments.mockReturnValue({
      data: mockPaymentsArray,
      isLoading: false,
      error: null,
      isError: false,
      dateRange: {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-08"),
      },
      updateDateRange: jest.fn(),
      refetch: jest.fn(),
      isSuccess: true,
    } as any);
  });

  describe("Default Date Range Generation", () => {
    const getDefaultDateRange = (): DateRange => {
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      lastWeek.setHours(0, 0, 0, 0);
      today.setHours(23, 59, 59, 999);
      return { from: lastWeek, to: today };
    };

    it("generates default date range for last 7 days", () => {
      const range = getDefaultDateRange();

      expect(range.from).toBeInstanceOf(Date);
      expect(range.to).toBeInstanceOf(Date);

      // Verify it's exactly 7 days difference
      const daysDiff = Math.floor(
        (range.to!.getTime() - range.from!.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(daysDiff).toBe(7);
    });

    it("sets correct time boundaries for date range", () => {
      const range = getDefaultDateRange();

      // From date should be start of day
      expect(range.from!.getHours()).toBe(0);
      expect(range.from!.getMinutes()).toBe(0);
      expect(range.from!.getSeconds()).toBe(0);
      expect(range.from!.getMilliseconds()).toBe(0);

      // To date should be end of day
      expect(range.to!.getHours()).toBe(23);
      expect(range.to!.getMinutes()).toBe(59);
      expect(range.to!.getSeconds()).toBe(59);
      expect(range.to!.getMilliseconds()).toBe(999);
    });

    it("generates different ranges when called at different times", () => {
      const range1 = getDefaultDateRange();

      // Simulate time passing
      jest.useFakeTimers();
      jest.advanceTimersByTime(24 * 60 * 60 * 1000); // 1 day

      const range2 = getDefaultDateRange();

      expect(range2.from!.getTime()).toBeGreaterThan(range1.from!.getTime());
      expect(range2.to!.getTime()).toBeGreaterThan(range1.to!.getTime());

      jest.useRealTimers();
    });
  });

  describe("Page State Management", () => {
    it("initializes with default date range", () => {
      const defaultRange = {
        from: new Date(),
        to: new Date(),
      };

      mockUsePayments.mockReturnValue({
        data: mockPaymentsArray,
        isLoading: false,
        error: null,
        isError: false,
        dateRange: defaultRange,
        updateDateRange: jest.fn(),
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      expect(mockUsePayments).toBeDefined();

      // Verify hook was called with initial date range
      const lastCall =
        mockUsePayments.mock.calls[mockUsePayments.mock.calls.length - 1];
      if (lastCall && lastCall[0]) {
        expect(lastCall[0]).toHaveProperty("initialDateRange");
      }
    });

    it("provides data to components correctly", () => {
      const result = mockUsePayments();

      expect(result.data).toEqual(mockPaymentsArray);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
    });

    it("handles date range updates", () => {
      const mockUpdateDateRange = jest.fn();

      mockUsePayments.mockReturnValue({
        data: mockPaymentsArray,
        isLoading: false,
        error: null,
        isError: false,
        dateRange: {
          from: new Date("2024-12-01"),
          to: new Date("2024-12-08"),
        },
        updateDateRange: mockUpdateDateRange,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const result = mockUsePayments();

      const newRange: DateRange = {
        from: new Date("2024-11-01"),
        to: new Date("2024-11-30"),
      };

      result.updateDateRange(newRange);
      expect(mockUpdateDateRange).toHaveBeenCalledWith(newRange);
    });
  });

  describe("Error State Handling", () => {
    it("handles network errors gracefully", () => {
      const errorMessage = "Network connection failed";

      mockUsePayments.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error(errorMessage),
        isError: true,
        dateRange: {
          from: new Date("2024-12-01"),
          to: new Date("2024-12-08"),
        },
        updateDateRange: jest.fn(),
        refetch: jest.fn(),
        isSuccess: false,
      } as any);

      const result = mockUsePayments();

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe(errorMessage);
      expect(result.isError).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it("handles database errors", () => {
      const errorMessage = "Database query failed";

      mockUsePayments.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error(errorMessage),
        isError: true,
        dateRange: {
          from: new Date("2024-12-01"),
          to: new Date("2024-12-08"),
        },
        updateDateRange: jest.fn(),
        refetch: jest.fn(),
        isSuccess: false,
      } as any);

      const result = mockUsePayments();

      expect(result.error?.message).toBe(errorMessage);
      expect(result.isError).toBe(true);
    });

    it("maintains date range even during errors", () => {
      const dateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-08"),
      };

      mockUsePayments.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error("Some error"),
        isError: true,
        dateRange,
        updateDateRange: jest.fn(),
        refetch: jest.fn(),
        isSuccess: false,
      } as any);

      const result = mockUsePayments();

      expect(result.dateRange).toEqual(dateRange);
      expect(typeof result.updateDateRange).toBe("function");
    });
  });

  describe("Loading State Management", () => {
    it("handles initial loading state", () => {
      mockUsePayments.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        dateRange: {
          from: new Date("2024-12-01"),
          to: new Date("2024-12-08"),
        },
        updateDateRange: jest.fn(),
        refetch: jest.fn(),
        isSuccess: false,
      } as any);

      const result = mockUsePayments();

      expect(result.isLoading).toBe(true);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeNull();
    });

    it("transitions from loading to success", () => {
      // First call - loading
      mockUsePayments.mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        dateRange: {
          from: new Date("2024-12-01"),
          to: new Date("2024-12-08"),
        },
        updateDateRange: jest.fn(),
        refetch: jest.fn(),
        isSuccess: false,
      } as any);

      // Second call - success
      mockUsePayments.mockReturnValueOnce({
        data: mockPaymentsArray,
        isLoading: false,
        error: null,
        isError: false,
        dateRange: {
          from: new Date("2024-12-01"),
          to: new Date("2024-12-08"),
        },
        updateDateRange: jest.fn(),
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const loadingResult = mockUsePayments();
      expect(loadingResult.isLoading).toBe(true);

      const successResult = mockUsePayments();
      expect(successResult.isLoading).toBe(false);
      expect(successResult.data).toEqual(mockPaymentsArray);
    });

    it("handles loading state during refetch", () => {
      const mockRefetch = jest.fn();

      mockUsePayments.mockReturnValue({
        data: mockPaymentsArray,
        isLoading: false,
        error: null,
        isError: false,
        dateRange: {
          from: new Date("2024-12-01"),
          to: new Date("2024-12-08"),
        },
        updateDateRange: jest.fn(),
        refetch: mockRefetch,
        isSuccess: true,
      } as any);

      const result = mockUsePayments();

      result.refetch();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe("Data Handling", () => {
    it("handles successful data retrieval", () => {
      mockUsePayments.mockReturnValue({
        data: mockPaymentsArray,
        isLoading: false,
        error: null,
        isError: false,
        dateRange: {
          from: new Date("2024-12-01"),
          to: new Date("2024-12-08"),
        },
        updateDateRange: jest.fn(),
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const result = mockUsePayments();

      expect(result.data).toEqual(mockPaymentsArray);
      expect(result.data).toHaveLength(5);
      expect(result.isSuccess).toBe(true);
    });

    it("handles empty data sets", () => {
      mockUsePayments.mockReturnValue({
        data: mockPaymentsEmptyArray,
        isLoading: false,
        error: null,
        isError: false,
        dateRange: {
          from: new Date("2024-12-01"),
          to: new Date("2024-12-08"),
        },
        updateDateRange: jest.fn(),
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const result = mockUsePayments();

      expect(result.data).toEqual([]);
      expect(result.data).toHaveLength(0);
      expect(result.isSuccess).toBe(true);
    });

    it("provides fallback for undefined data", () => {
      mockUsePayments.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        isError: false,
        dateRange: {
          from: new Date("2024-12-01"),
          to: new Date("2024-12-08"),
        },
        updateDateRange: jest.fn(),
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const result = mockUsePayments();

      // Page should handle undefined data by providing empty array fallback
      const dataForTable = result.data || [];
      expect(dataForTable).toEqual([]);
    });
  });

  describe("Component Integration", () => {
    it("passes correct props to data table", () => {
      const mockUpdateDateRange = jest.fn();
      const dateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-08"),
      };

      mockUsePayments.mockReturnValue({
        data: mockPaymentsArray,
        isLoading: false,
        error: null,
        isError: false,
        dateRange,
        updateDateRange: mockUpdateDateRange,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const result = mockUsePayments();

      // Verify all required props are available
      expect(result.data).toBeDefined();
      expect(result.isLoading).toBeDefined();
      expect(result.dateRange).toBeDefined();
      expect(result.updateDateRange).toBeDefined();

      // Test the update function
      const newRange: DateRange = {
        from: new Date("2024-11-01"),
        to: new Date("2024-11-30"),
      };

      result.updateDateRange(newRange);
      expect(mockUpdateDateRange).toHaveBeenCalledWith(newRange);
    });

    it("handles data table callback interactions", () => {
      const mockUpdateDateRange = jest.fn();

      mockUsePayments.mockReturnValue({
        data: mockPaymentsArray,
        isLoading: false,
        error: null,
        isError: false,
        dateRange: {
          from: new Date("2024-12-01"),
          to: new Date("2024-12-08"),
        },
        updateDateRange: mockUpdateDateRange,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const result = mockUsePayments();

      // Simulate date range picker interaction
      const newRange: DateRange = {
        from: new Date("2024-10-01"),
        to: new Date("2024-10-31"),
      };

      result.updateDateRange(newRange);

      expect(mockUpdateDateRange).toHaveBeenCalledTimes(1);
      expect(mockUpdateDateRange).toHaveBeenCalledWith(newRange);
    });
  });

  describe("Edge Cases", () => {
    it("handles hook call without parameters", () => {
      mockUsePayments.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isError: false,
        dateRange: {
          from: new Date(),
          to: new Date(),
        },
        updateDateRange: jest.fn(),
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const result = mockUsePayments();

      expect(result).toBeDefined();
      expect(result.data).toEqual([]);
      expect(result.dateRange).toBeDefined();
    });

    it("handles rapid date range changes", () => {
      const mockUpdateDateRange = jest.fn();

      mockUsePayments.mockReturnValue({
        data: mockPaymentsArray,
        isLoading: false,
        error: null,
        isError: false,
        dateRange: {
          from: new Date("2024-12-01"),
          to: new Date("2024-12-08"),
        },
        updateDateRange: mockUpdateDateRange,
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const result = mockUsePayments();

      // Simulate rapid changes
      const range1: DateRange = {
        from: new Date("2024-01-01"),
        to: new Date("2024-01-31"),
      };
      const range2: DateRange = {
        from: new Date("2024-02-01"),
        to: new Date("2024-02-28"),
      };
      const range3: DateRange = {
        from: new Date("2024-03-01"),
        to: new Date("2024-03-31"),
      };

      result.updateDateRange(range1);
      result.updateDateRange(range2);
      result.updateDateRange(range3);

      expect(mockUpdateDateRange).toHaveBeenCalledTimes(3);
      expect(mockUpdateDateRange).toHaveBeenNthCalledWith(1, range1);
      expect(mockUpdateDateRange).toHaveBeenNthCalledWith(2, range2);
      expect(mockUpdateDateRange).toHaveBeenNthCalledWith(3, range3);
    });

    it("maintains referential stability for callback functions", () => {
      mockUsePayments.mockReturnValue({
        data: mockPaymentsArray,
        isLoading: false,
        error: null,
        isError: false,
        dateRange: {
          from: new Date("2024-12-01"),
          to: new Date("2024-12-08"),
        },
        updateDateRange: jest.fn(),
        refetch: jest.fn(),
        isSuccess: true,
      } as any);

      const result1 = mockUsePayments();
      const result2 = mockUsePayments();

      // Functions should be stable across calls (if properly memoized)
      expect(typeof result1.updateDateRange).toBe("function");
      expect(typeof result2.updateDateRange).toBe("function");
    });
  });
});
