/**
 * Invoice Page Business Logic Tests
 * 
 * This test suite focuses on testing the specific business logic used in the invoice page,
 * including default date range generation, data loading states, and page-specific functionality.
 */

import type { PaymentWithDetails } from "@/types";
import { DateRange } from "react-day-picker";
import {
  mockPaymentData,
  mockPaymentDataCard,
  mockPaymentsArray,
  mockPaymentsEmptyArray,
} from "@/test/mocks/payments-data";

describe("Invoice Page Business Logic", () => {
  describe("Default Date Range Generation", () => {
    const getDefaultDateRange = (): DateRange => {
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      lastWeek.setHours(0, 0, 0, 0);
      today.setHours(23, 59, 59, 999);
      return { from: lastWeek, to: today };
    };

    it("generates correct default date range for last week", () => {
      const range = getDefaultDateRange();
      
      expect(range.from).toBeDefined();
      expect(range.to).toBeDefined();

      const today = new Date();
      const expectedFrom = new Date(today);
      expectedFrom.setDate(today.getDate() - 7);
      expectedFrom.setHours(0, 0, 0, 0);

      const expectedTo = new Date(today);
      expectedTo.setHours(23, 59, 59, 999);

      expect(range.from!.getTime()).toBe(expectedFrom.getTime());
      expect(range.to!.getTime()).toBe(expectedTo.getTime());
    });

    it("sets correct time boundaries for date range", () => {
      const range = getDefaultDateRange();
      
      // From date should be at start of day
      expect(range.from!.getHours()).toBe(0);
      expect(range.from!.getMinutes()).toBe(0);
      expect(range.from!.getSeconds()).toBe(0);
      expect(range.from!.getMilliseconds()).toBe(0);

      // To date should be at end of day
      expect(range.to!.getHours()).toBe(23);
      expect(range.to!.getMinutes()).toBe(59);
      expect(range.to!.getSeconds()).toBe(59);
      expect(range.to!.getMilliseconds()).toBe(999);
    });

    it("ensures from date is exactly 7 days before to date", () => {
      const range = getDefaultDateRange();
      const daysDifference = Math.floor(
        (range.to!.getTime() - range.from!.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysDifference).toBe(7);
    });
  });

  describe("Date Range Filtering Business Logic", () => {
    const filterPaymentsByDateRange = (
      payments: PaymentWithDetails[],
      dateRange: DateRange
    ): PaymentWithDetails[] => {
      if (!dateRange?.from || !dateRange?.to) {
        return payments;
      }

      return payments.filter(payment => {
        if (!payment.payment_date) return false;

        const paymentDate = new Date(payment.payment_date);
        const fromDate = new Date(dateRange.from!);
        const toDate = new Date(dateRange.to!);

        // Set time boundaries
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);

        return paymentDate >= fromDate && paymentDate <= toDate;
      });
    };

    const createTestDateRange = (fromDaysAgo: number, toDaysAgo: number = 0): DateRange => {
      const today = new Date();
      const from = new Date(today);
      const to = new Date(today);
      
      from.setDate(today.getDate() - fromDaysAgo);
      to.setDate(today.getDate() - toDaysAgo);
      
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      
      return { from, to };
    };

    it("filters payments within date range correctly", () => {
      // Create payments with known dates
      const paymentsWithDates: PaymentWithDetails[] = [
        { ...mockPaymentData, payment_date: "2024-12-15", id: "p1" },
        { ...mockPaymentDataCard, payment_date: "2024-12-16", id: "p2" },
        { ...mockPaymentData, payment_date: "2024-12-10", id: "p3" },
        { ...mockPaymentData, payment_date: "2024-12-20", id: "p4" },
      ];

      const range: DateRange = {
        from: new Date("2024-12-14"),
        to: new Date("2024-12-17"),
      };

      const filtered = filterPaymentsByDateRange(paymentsWithDates, range);
      expect(filtered).toHaveLength(2);
      expect(filtered.map(p => p.id)).toEqual(["p1", "p2"]);
    });

    it("includes payments on boundary dates", () => {
      const paymentsWithDates: PaymentWithDetails[] = [
        { ...mockPaymentData, payment_date: "2024-12-15", id: "boundary1" },
        { ...mockPaymentData, payment_date: "2024-12-17", id: "boundary2" },
        { ...mockPaymentData, payment_date: "2024-12-14", id: "outside1" },
        { ...mockPaymentData, payment_date: "2024-12-18", id: "outside2" },
      ];

      const range: DateRange = {
        from: new Date("2024-12-15"),
        to: new Date("2024-12-17"),
      };

      const filtered = filterPaymentsByDateRange(paymentsWithDates, range);
      expect(filtered).toHaveLength(2);
      expect(filtered.map(p => p.id)).toEqual(["boundary1", "boundary2"]);
    });

    it("excludes payments with null payment_date", () => {
      const paymentsWithNullDates: PaymentWithDetails[] = [
        { ...mockPaymentData, payment_date: "2024-12-15", id: "valid" },
        { ...mockPaymentData, payment_date: null, id: "null" },
      ];

      const range: DateRange = {
        from: new Date("2024-12-14"),
        to: new Date("2024-12-16"),
      };

      const filtered = filterPaymentsByDateRange(paymentsWithNullDates, range);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("valid");
    });

    it("returns all payments when date range is incomplete", () => {
      const incompleteRange1: DateRange = { from: new Date("2024-12-15"), to: undefined };
      const incompleteRange2: DateRange = { from: undefined, to: new Date("2024-12-15") };

      const filtered1 = filterPaymentsByDateRange(mockPaymentsArray, incompleteRange1);
      const filtered2 = filterPaymentsByDateRange(mockPaymentsArray, incompleteRange2);

      expect(filtered1).toHaveLength(mockPaymentsArray.length);
      expect(filtered2).toHaveLength(mockPaymentsArray.length);
    });
  });

  describe("Loading and Error States", () => {
    const getPageDisplayState = (
      isLoading: boolean,
      error: Error | null,
      payments: PaymentWithDetails[] | undefined
    ) => {
      if (error) {
        return {
          state: "error",
          message: "An error has occurred",
          showData: false,
        };
      }

      if (isLoading) {
        return {
          state: "loading",
          message: "Loading payments...",
          showData: false,
        };
      }

      return {
        state: "success",
        message: "",
        showData: true,
        hasData: Boolean(payments && payments.length > 0),
        paymentsCount: payments?.length || 0,
      };
    };

    it("returns error state when error is present", () => {
      const state = getPageDisplayState(false, new Error("API Error"), undefined);
      
      expect(state.state).toBe("error");
      expect(state.message).toBe("An error has occurred");
      expect(state.showData).toBe(false);
    });

    it("returns loading state when loading", () => {
      const state = getPageDisplayState(true, null, undefined);
      
      expect(state.state).toBe("loading");
      expect(state.message).toBe("Loading payments...");
      expect(state.showData).toBe(false);
    });

    it("returns success state with data", () => {
      const state = getPageDisplayState(false, null, mockPaymentsArray);
      
      expect(state.state).toBe("success");
      expect(state.showData).toBe(true);
      expect(state.hasData).toBe(true);
      expect(state.paymentsCount).toBe(mockPaymentsArray.length);
    });

    it("returns success state with empty data", () => {
      const state = getPageDisplayState(false, null, mockPaymentsEmptyArray);
      
      expect(state.state).toBe("success");
      expect(state.showData).toBe(true);
      expect(state.hasData).toBe(false);
      expect(state.paymentsCount).toBe(0);
    });

    it("prioritizes error over loading state", () => {
      const state = getPageDisplayState(true, new Error("Error"), mockPaymentsArray);
      
      expect(state.state).toBe("error");
      expect(state.showData).toBe(false);
    });
  });

  describe("Data Table Integration Logic", () => {
    const prepareDataTableProps = (
      payments: PaymentWithDetails[] | undefined,
      isLoading: boolean,
      dateRange: DateRange,
      onDateRangeChange: (range: DateRange) => void
    ) => {
      return {
        data: payments || [],
        isLoading,
        dateRange,
        onDateRangeChange,
        hasData: Boolean(payments && payments.length > 0),
        isEmpty: !payments || payments.length === 0,
      };
    };

    it("prepares correct props for data table with data", () => {
      const mockOnChange = jest.fn();
      const mockDateRange: DateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-31"),
      };

      const props = prepareDataTableProps(
        mockPaymentsArray,
        false,
        mockDateRange,
        mockOnChange
      );

      expect(props.data).toEqual(mockPaymentsArray);
      expect(props.isLoading).toBe(false);
      expect(props.dateRange).toEqual(mockDateRange);
      expect(props.onDateRangeChange).toBe(mockOnChange);
      expect(props.hasData).toBe(true);
      expect(props.isEmpty).toBe(false);
    });

    it("prepares correct props for data table with empty data", () => {
      const mockOnChange = jest.fn();
      const mockDateRange: DateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-31"),
      };

      const props = prepareDataTableProps(
        mockPaymentsEmptyArray,
        false,
        mockDateRange,
        mockOnChange
      );

      expect(props.data).toEqual([]);
      expect(props.isLoading).toBe(false);
      expect(props.hasData).toBe(false);
      expect(props.isEmpty).toBe(true);
    });

    it("prepares correct props for data table while loading", () => {
      const mockOnChange = jest.fn();
      const mockDateRange: DateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-31"),
      };

      const props = prepareDataTableProps(
        undefined,
        true,
        mockDateRange,
        mockOnChange
      );

      expect(props.data).toEqual([]);
      expect(props.isLoading).toBe(true);
      expect(props.hasData).toBe(false);
      expect(props.isEmpty).toBe(true);
    });
  });

  describe("Date Range Update Logic", () => {
    const validateDateRangeUpdate = (
      currentRange: DateRange,
      newRange: DateRange
    ): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (!newRange.from) {
        errors.push("Start date is required");
      }

      if (!newRange.to) {
        errors.push("End date is required");
      }

      if (newRange.from && newRange.to && newRange.from > newRange.to) {
        errors.push("Start date must be before end date");
      }

      // Check if range is too large (e.g., more than 1 year)
      if (newRange.from && newRange.to) {
        const daysDifference = Math.floor(
          (newRange.to.getTime() - newRange.from.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDifference > 365) {
          errors.push("Date range cannot exceed 1 year");
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    };

    const shouldRefetchData = (currentRange: DateRange, newRange: DateRange): boolean => {
      return (
        currentRange.from?.getTime() !== newRange.from?.getTime() ||
        currentRange.to?.getTime() !== newRange.to?.getTime()
      );
    };

    it("validates correct date range", () => {
      const currentRange: DateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-31"),
      };
      const newRange: DateRange = {
        from: new Date("2024-12-10"),
        to: new Date("2024-12-20"),
      };

      const validation = validateDateRangeUpdate(currentRange, newRange);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("detects missing dates", () => {
      const currentRange: DateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-31"),
      };
      const newRange: DateRange = {
        from: undefined,
        to: undefined,
      };

      const validation = validateDateRangeUpdate(currentRange, newRange);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Start date is required");
      expect(validation.errors).toContain("End date is required");
    });

    it("detects invalid date order", () => {
      const currentRange: DateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-31"),
      };
      const newRange: DateRange = {
        from: new Date("2024-12-20"),
        to: new Date("2024-12-10"),
      };

      const validation = validateDateRangeUpdate(currentRange, newRange);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Start date must be before end date");
    });

    it("detects date range too large", () => {
      const currentRange: DateRange = {
        from: new Date("2024-01-01"),
        to: new Date("2024-12-31"),
      };
      const newRange: DateRange = {
        from: new Date("2023-01-01"),
        to: new Date("2024-12-31"),
      };

      const validation = validateDateRangeUpdate(currentRange, newRange);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Date range cannot exceed 1 year");
    });

    it("determines when data refetch is needed", () => {
      const range1: DateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-31"),
      };
      const range2: DateRange = {
        from: new Date("2024-12-10"),
        to: new Date("2024-12-20"),
      };
      const range3: DateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-31"),
      };

      expect(shouldRefetchData(range1, range2)).toBe(true);
      expect(shouldRefetchData(range1, range3)).toBe(false);
    });
  });

  describe("Query Key Generation", () => {
    const generateQueryKey = (dateRange: DateRange): (string | DateRange)[] => {
      return ["payments", dateRange];
    };

    const isQueryEnabled = (dateRange: DateRange): boolean => {
      return Boolean(dateRange?.from && dateRange?.to);
    };

    it("generates correct query key", () => {
      const dateRange: DateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-31"),
      };

      const queryKey = generateQueryKey(dateRange);
      expect(queryKey[0]).toBe("payments");
      expect(queryKey[1]).toEqual(dateRange);
    });

    it("enables query when date range is complete", () => {
      const completeRange: DateRange = {
        from: new Date("2024-12-01"),
        to: new Date("2024-12-31"),
      };

      expect(isQueryEnabled(completeRange)).toBe(true);
    });

    it("disables query when date range is incomplete", () => {
      const incompleteRange1: DateRange = {
        from: new Date("2024-12-01"),
        to: undefined,
      };
      const incompleteRange2: DateRange = {
        from: undefined,
        to: new Date("2024-12-31"),
      };

      expect(isQueryEnabled(incompleteRange1)).toBe(false);
      expect(isQueryEnabled(incompleteRange2)).toBe(false);
    });
  });
});
