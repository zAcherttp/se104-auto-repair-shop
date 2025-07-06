/**
 * Invoice/Payments Data Processing Tests
 * 
 * This test suite focuses on validating the data processing and transformation logic
 * used in the invoice/payments functionality. Tests core business logic without UI dependencies.
 */

import {
  mockPaymentData,
  mockPaymentDataCard,
  mockPaymentDataTransfer,
  mockPaymentDataNoProfile,
  mockPaymentDataMissingInfo,
  mockPaymentsArray,
  mockPaymentsArraySortedByDate,
  mockPaymentsArrayFilteredWeek,
  mockPaymentsEmptyArray,
  mockPaymentDataLargeAmount,
  mockPaymentDataSmallAmount,
  mockPaymentDataZeroAmount,
} from "@/test/mocks/payments-data";
import type { PaymentWithDetails } from "@/types";
import { DateRange } from "react-day-picker";

describe("Invoice/Payments Data Processing", () => {
  describe("Currency Formatting Logic", () => {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    };

    it("formats standard payment amounts correctly", () => {
      expect(formatCurrency(545.00)).toBe("$545.00");
      expect(formatCurrency(850.50)).toBe("$850.50");
      expect(formatCurrency(1200.75)).toBe("$1,200.75");
    });

    it("formats zero amount correctly", () => {
      expect(formatCurrency(0)).toBe("$0.00");
    });

    it("formats small amounts correctly", () => {
      expect(formatCurrency(0.01)).toBe("$0.01");
      expect(formatCurrency(0.99)).toBe("$0.99");
    });

    it("formats large amounts with proper commas", () => {
      expect(formatCurrency(999999.99)).toBe("$999,999.99");
      expect(formatCurrency(1000000)).toBe("$1,000,000.00");
      expect(formatCurrency(12345678.90)).toBe("$12,345,678.90");
    });

    it("handles decimal precision correctly", () => {
      expect(formatCurrency(123.456)).toBe("$123.46"); // Rounds to 2 decimal places
      expect(formatCurrency(123.454)).toBe("$123.45");
      expect(formatCurrency(123.999)).toBe("$124.00");
    });

    it("handles negative amounts correctly", () => {
      expect(formatCurrency(-100.50)).toBe("-$100.50");
      expect(formatCurrency(-0.01)).toBe("-$0.01");
    });
  });

  describe("Payment Method Processing", () => {
    const capitalizePaymentMethod = (method: string): string => {
      return method.charAt(0).toUpperCase() + method.slice(1);
    };

    const getPaymentMethodBadgeVariant = (method: string): string => {
      switch (method.toLowerCase()) {
        case "cash":
          return "default";
        case "card":
          return "secondary";
        case "transfer":
          return "outline";
        default:
          return "outline";
      }
    };

    it("capitalizes payment methods correctly", () => {
      expect(capitalizePaymentMethod("cash")).toBe("Cash");
      expect(capitalizePaymentMethod("card")).toBe("Card");
      expect(capitalizePaymentMethod("transfer")).toBe("Transfer");
    });

    it("handles mixed case payment methods", () => {
      expect(capitalizePaymentMethod("CASH")).toBe("CASH");
      expect(capitalizePaymentMethod("CaRd")).toBe("CaRd");
    });

    it("returns correct badge variants for payment methods", () => {
      expect(getPaymentMethodBadgeVariant("cash")).toBe("default");
      expect(getPaymentMethodBadgeVariant("card")).toBe("secondary");
      expect(getPaymentMethodBadgeVariant("transfer")).toBe("outline");
      expect(getPaymentMethodBadgeVariant("unknown")).toBe("outline");
    });

    it("handles case insensitive payment method variants", () => {
      expect(getPaymentMethodBadgeVariant("CASH")).toBe("default");
      expect(getPaymentMethodBadgeVariant("Card")).toBe("secondary");
      expect(getPaymentMethodBadgeVariant("TRANSFER")).toBe("outline");
    });
  });

  describe("Date Processing and Formatting", () => {
    const formatPaymentDate = (dateString: string | null): string => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US");
    };

    const formatCreatedDateTime = (dateString: string | null): { date: string; time: string } => {
      if (!dateString) return { date: "N/A", time: "N/A" };
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString("en-US"),
        time: date.toLocaleTimeString("en-US"),
      };
    };

    const isWithinDateRange = (paymentDate: string | null, range: DateRange): boolean => {
      if (!paymentDate || !range.from || !range.to) return false;
      
      const payment = new Date(paymentDate);
      const from = new Date(range.from);
      const to = new Date(range.to);
      
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      
      return payment >= from && payment <= to;
    };

    it("formats payment dates correctly", () => {
      expect(formatPaymentDate("2024-12-15")).toBe("12/15/2024");
      expect(formatPaymentDate("2024-12-16")).toBe("12/16/2024");
      expect(formatPaymentDate(null)).toBe("N/A");
    });

    it("formats created datetime correctly", () => {
      const result = formatCreatedDateTime("2024-12-15T10:30:00.000Z");
      expect(result.date).toBe("12/15/2024");
      expect(result.time).toMatch(/^\d{1,2}:\d{2}:\d{2}/); // Match time format
    });

    it("handles null datetime correctly", () => {
      const result = formatCreatedDateTime(null);
      expect(result.date).toBe("N/A");
      expect(result.time).toBe("N/A");
    });

    it("determines if payment is within date range", () => {
      const range: DateRange = {
        from: new Date("2024-12-14"),
        to: new Date("2024-12-16"),
      };

      expect(isWithinDateRange("2024-12-15", range)).toBe(true);
      expect(isWithinDateRange("2024-12-14", range)).toBe(true);
      expect(isWithinDateRange("2024-12-16", range)).toBe(true);
      expect(isWithinDateRange("2024-12-13", range)).toBe(false);
      expect(isWithinDateRange("2024-12-17", range)).toBe(false);
      expect(isWithinDateRange(null, range)).toBe(false);
    });

    it("handles incomplete date ranges", () => {
      const incompleteRange: DateRange = { from: new Date("2024-12-15"), to: undefined };
      expect(isWithinDateRange("2024-12-15", incompleteRange)).toBe(false);
    });
  });

  describe("Payment Data Validation", () => {
    const validatePaymentData = (payment: PaymentWithDetails): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      // Validate payment basic info
      if (!payment.id) {
        errors.push("Payment ID is required");
      }
      if (typeof payment.amount !== 'number' || payment.amount < 0) {
        errors.push("Payment amount must be a non-negative number");
      }
      if (!payment.payment_method) {
        errors.push("Payment method is required");
      }

      // Validate vehicle data
      if (!payment.vehicle?.id) {
        errors.push("Vehicle ID is required");
      }
      if (!payment.vehicle?.license_plate) {
        errors.push("Vehicle license plate is required");
      }

      // Validate customer data
      if (!payment.vehicle?.customer?.id) {
        errors.push("Customer ID is required");
      }
      if (!payment.vehicle?.customer?.name) {
        errors.push("Customer name is required");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    };

    it("validates correct payment data", () => {
      const validation = validatePaymentData(mockPaymentData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("detects missing payment ID", () => {
      const invalidPayment = { ...mockPaymentData, id: "" };
      const validation = validatePaymentData(invalidPayment);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Payment ID is required");
    });

    it("detects invalid payment amount", () => {
      const invalidPayment = { ...mockPaymentData, amount: -100 };
      const validation = validatePaymentData(invalidPayment);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Payment amount must be a non-negative number");
    });

    it("detects missing payment method", () => {
      const invalidPayment = { ...mockPaymentData, payment_method: "" };
      const validation = validatePaymentData(invalidPayment);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Payment method is required");
    });

    it("detects missing vehicle information", () => {
      const invalidPayment = {
        ...mockPaymentData,
        vehicle: { ...mockPaymentData.vehicle, id: "", license_plate: "" },
      };
      const validation = validatePaymentData(invalidPayment);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Vehicle ID is required");
      expect(validation.errors).toContain("Vehicle license plate is required");
    });

    it("detects missing customer information", () => {
      const invalidPayment = {
        ...mockPaymentData,
        vehicle: {
          ...mockPaymentData.vehicle,
          customer: { ...mockPaymentData.vehicle.customer, id: "", name: "" },
        },
      };
      const validation = validatePaymentData(invalidPayment);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Customer ID is required");
      expect(validation.errors).toContain("Customer name is required");
    });

    it("handles zero amount as valid", () => {
      const validation = validatePaymentData(mockPaymentDataZeroAmount);
      expect(validation.isValid).toBe(true);
    });
  });

  describe("Payment Aggregation and Statistics", () => {
    const calculateTotalPayments = (payments: PaymentWithDetails[]): number => {
      return payments.reduce((sum, payment) => sum + payment.amount, 0);
    };

    const calculateAveragePayment = (payments: PaymentWithDetails[]): number => {
      if (payments.length === 0) return 0;
      return calculateTotalPayments(payments) / payments.length;
    };

    const getPaymentMethodDistribution = (payments: PaymentWithDetails[]) => {
      const distribution = payments.reduce((acc, payment) => {
        const method = payment.payment_method;
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return distribution;
    };

    const getPaymentStatistics = (payments: PaymentWithDetails[]) => {
      const totalAmount = calculateTotalPayments(payments);
      const averageAmount = calculateAveragePayment(payments);
      const paymentCount = payments.length;
      const methodDistribution = getPaymentMethodDistribution(payments);

      const maxPayment = payments.length > 0 
        ? Math.max(...payments.map(p => p.amount))
        : 0;
      const minPayment = payments.length > 0 
        ? Math.min(...payments.map(p => p.amount))
        : 0;

      return {
        totalAmount,
        averageAmount,
        paymentCount,
        maxPayment,
        minPayment,
        methodDistribution,
      };
    };

    it("calculates total payments correctly", () => {
      expect(calculateTotalPayments(mockPaymentsArray)).toBe(3071.50);
      expect(calculateTotalPayments(mockPaymentsEmptyArray)).toBe(0);
      expect(calculateTotalPayments([mockPaymentData])).toBe(545.00);
    });

    it("calculates average payment correctly", () => {
      expect(calculateAveragePayment(mockPaymentsArray)).toBeCloseTo(614.30, 2);
      expect(calculateAveragePayment(mockPaymentsEmptyArray)).toBe(0);
      expect(calculateAveragePayment([mockPaymentData])).toBe(545.00);
    });

    it("calculates payment method distribution correctly", () => {
      const distribution = getPaymentMethodDistribution(mockPaymentsArray);
      expect(distribution["cash"]).toBe(2);
      expect(distribution["card"]).toBe(2);
      expect(distribution["transfer"]).toBe(1);
    });

    it("generates comprehensive payment statistics", () => {
      const stats = getPaymentStatistics(mockPaymentsArray);
      
      expect(stats.totalAmount).toBe(3071.50);
      expect(stats.paymentCount).toBe(5);
      expect(stats.averageAmount).toBeCloseTo(614.30, 2);
      expect(stats.maxPayment).toBe(1200.75);
      expect(stats.minPayment).toBe(150.25);
      expect(stats.methodDistribution["cash"]).toBe(2);
      expect(stats.methodDistribution["card"]).toBe(2);
      expect(stats.methodDistribution["transfer"]).toBe(1);
    });

    it("handles empty payments array", () => {
      const stats = getPaymentStatistics(mockPaymentsEmptyArray);
      
      expect(stats.totalAmount).toBe(0);
      expect(stats.paymentCount).toBe(0);
      expect(stats.averageAmount).toBe(0);
      expect(stats.maxPayment).toBe(0);
      expect(stats.minPayment).toBe(0);
      expect(Object.keys(stats.methodDistribution)).toHaveLength(0);
    });

    it("handles single payment correctly", () => {
      const stats = getPaymentStatistics([mockPaymentData]);
      
      expect(stats.totalAmount).toBe(545.00);
      expect(stats.paymentCount).toBe(1);
      expect(stats.averageAmount).toBe(545.00);
      expect(stats.maxPayment).toBe(545.00);
      expect(stats.minPayment).toBe(545.00);
      expect(stats.methodDistribution["cash"]).toBe(1);
    });
  });

  describe("Payment Filtering and Sorting", () => {
    const filterPaymentsByDateRange = (payments: PaymentWithDetails[], range: DateRange): PaymentWithDetails[] => {
      if (!range.from || !range.to) return payments;

      return payments.filter(payment => {
        if (!payment.payment_date) return false;
        
        const paymentDate = new Date(payment.payment_date);
        const from = new Date(range.from!);
        const to = new Date(range.to!);
        
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        
        return paymentDate >= from && paymentDate <= to;
      });
    };

    const filterPaymentsByMethod = (payments: PaymentWithDetails[], method: string): PaymentWithDetails[] => {
      return payments.filter(payment => payment.payment_method === method);
    };

    const sortPaymentsByDate = (payments: PaymentWithDetails[], ascending: boolean = false): PaymentWithDetails[] => {
      return [...payments].sort((a, b) => {
        const dateA = new Date(a.payment_date || 0);
        const dateB = new Date(b.payment_date || 0);
        return ascending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      });
    };

    const sortPaymentsByAmount = (payments: PaymentWithDetails[], ascending: boolean = true): PaymentWithDetails[] => {
      return [...payments].sort((a, b) => {
        return ascending ? a.amount - b.amount : b.amount - a.amount;
      });
    };

    it("filters payments by date range correctly", () => {
      const range: DateRange = {
        from: new Date("2024-12-15"),
        to: new Date("2024-12-17"),
      };

      const filtered = filterPaymentsByDateRange(mockPaymentsArray, range);
      expect(filtered).toHaveLength(3);
      expect(filtered.map(p => p.id)).toEqual(
        expect.arrayContaining(["payment-001", "payment-002", "payment-003"])
      );
    });

    it("returns all payments when date range is incomplete", () => {
      const incompleteRange: DateRange = { from: new Date("2024-12-15"), to: undefined };
      const filtered = filterPaymentsByDateRange(mockPaymentsArray, incompleteRange);
      expect(filtered).toHaveLength(mockPaymentsArray.length);
    });

    it("filters payments by payment method correctly", () => {
      const cashPayments = filterPaymentsByMethod(mockPaymentsArray, "cash");
      expect(cashPayments).toHaveLength(2);
      expect(cashPayments.every(p => p.payment_method === "cash")).toBe(true);

      const cardPayments = filterPaymentsByMethod(mockPaymentsArray, "card");
      expect(cardPayments).toHaveLength(2);
      expect(cardPayments.every(p => p.payment_method === "card")).toBe(true);

      const transferPayments = filterPaymentsByMethod(mockPaymentsArray, "transfer");
      expect(transferPayments).toHaveLength(1);
      expect(transferPayments[0].payment_method).toBe("transfer");
    });

    it("sorts payments by date correctly", () => {
      const sortedDesc = sortPaymentsByDate(mockPaymentsArray, false);
      expect(sortedDesc[0].payment_date).toBe("2024-12-17");
      expect(sortedDesc[1].payment_date).toBe("2024-12-16");
      expect(sortedDesc[2].payment_date).toBe("2024-12-15");

      const sortedAsc = sortPaymentsByDate(mockPaymentsArray, true);
      expect(sortedAsc[sortedAsc.length - 1].payment_date).toBe("2024-12-17");
    });

    it("sorts payments by amount correctly", () => {
      const sortedAsc = sortPaymentsByAmount(mockPaymentsArray, true);
      expect(sortedAsc[0].amount).toBe(150.25);
      expect(sortedAsc[sortedAsc.length - 1].amount).toBe(1200.75);

      const sortedDesc = sortPaymentsByAmount(mockPaymentsArray, false);
      expect(sortedDesc[0].amount).toBe(1200.75);
      expect(sortedDesc[sortedDesc.length - 1].amount).toBe(150.25);
    });

    it("handles null payment dates in sorting", () => {
      const paymentsWithNull = [...mockPaymentsArray];
      const sorted = sortPaymentsByDate(paymentsWithNull, false);
      
      // Should not throw error and should handle null dates
      expect(sorted).toHaveLength(paymentsWithNull.length);
    });
  });

  describe("Profile Information Processing", () => {
    const getCreatedByDisplayName = (profile?: { full_name: string | null; email: string }): string => {
      if (!profile) return "Unknown";
      return profile.full_name || "Unknown";
    };

    const getCreatedByEmail = (profile?: { full_name: string | null; email: string }): string => {
      if (!profile) return "";
      return profile.email || "";
    };

    const formatCreatedByInfo = (profile?: { full_name: string | null; email: string }) => {
      const displayName = getCreatedByDisplayName(profile);
      const email = getCreatedByEmail(profile);
      
      return {
        displayName,
        email,
        hasValidProfile: Boolean(profile && (profile.full_name || profile.email)),
      };
    };

    it("handles complete profile information", () => {
      const info = formatCreatedByInfo(mockPaymentData.created_by_profile);
      expect(info.displayName).toBe("Admin User");
      expect(info.email).toBe("admin@garage.com");
      expect(info.hasValidProfile).toBe(true);
    });

    it("handles profile with no full name", () => {
      const info = formatCreatedByInfo(mockPaymentDataMissingInfo.created_by_profile);
      expect(info.displayName).toBe("Unknown");
      expect(info.email).toBe("noname@garage.com");
      expect(info.hasValidProfile).toBe(true); // Has email
    });

    it("handles undefined profile", () => {
      const info = formatCreatedByInfo(mockPaymentDataNoProfile.created_by_profile);
      expect(info.displayName).toBe("Unknown");
      expect(info.email).toBe("");
      expect(info.hasValidProfile).toBe(false);
    });

    it("handles profile with only email", () => {
      const profileEmailOnly = { full_name: null, email: "test@example.com" };
      const info = formatCreatedByInfo(profileEmailOnly);
      expect(info.displayName).toBe("Unknown");
      expect(info.email).toBe("test@example.com");
      expect(info.hasValidProfile).toBe(true);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("handles payments with extreme amounts", () => {
      const largePaymentStats = {
        totalAmount: mockPaymentDataLargeAmount.amount,
        formattedAmount: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(mockPaymentDataLargeAmount.amount),
      };

      expect(largePaymentStats.totalAmount).toBe(999999.99);
      expect(largePaymentStats.formattedAmount).toBe("$999,999.99");
    });

    it("handles payments with very small amounts", () => {
      const smallPaymentStats = {
        totalAmount: mockPaymentDataSmallAmount.amount,
        formattedAmount: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(mockPaymentDataSmallAmount.amount),
      };

      expect(smallPaymentStats.totalAmount).toBe(0.01);
      expect(smallPaymentStats.formattedAmount).toBe("$0.01");
    });

    it("handles zero amount payments", () => {
      expect(mockPaymentDataZeroAmount.amount).toBe(0);
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(mockPaymentDataZeroAmount.amount);
      expect(formatted).toBe("$0.00");
    });

    it("handles malformed date strings gracefully", () => {
      const formatDate = (dateString: string | null): string => {
        if (!dateString) return "N/A";
        try {
          const date = new Date(dateString);
          return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString("en-US");
        } catch {
          return "Invalid Date";
        }
      };

      expect(formatDate("invalid-date")).toBe("Invalid Date");
      expect(formatDate("2024-13-32")).toBe("Invalid Date");
      expect(formatDate(null)).toBe("N/A");
      expect(formatDate("2024-12-15")).toBe("12/15/2024");
    });

    it("handles payments with missing required nested data", () => {
      const incompletePayment = {
        ...mockPaymentData,
        vehicle: {
          ...mockPaymentData.vehicle,
          customer: {
            id: "",
            name: "",
            phone: null,
            email: null,
            address: null,
            created_at: null,
          },
        },
      };

      const hasValidCustomer = Boolean(
        incompletePayment.vehicle.customer.id && 
        incompletePayment.vehicle.customer.name
      );

      expect(hasValidCustomer).toBe(false);
    });
  });
});
