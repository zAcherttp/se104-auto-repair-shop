/**
 * Payments Data Processing Tests
 * 
 * This test suite focuses on validating the data processing and transformation logic
 * used in the payments functionality. Tests core business logic without UI dependencies.
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

// Helper function for payment data validation
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

describe("Payments Data Processing", () => {
  describe("Currency Formatting Logic", () => {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    };

    it("formats standard amounts correctly", () => {
      expect(formatCurrency(545.00)).toBe("$545.00");
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
      expect(formatCurrency(0.99)).toBe("$0.99");
    });

    it("formats zero amount correctly", () => {
      expect(formatCurrency(0)).toBe("$0.00");
    });

    it("formats large amounts with proper separators", () => {
      expect(formatCurrency(123456.78)).toBe("$123,456.78");
      expect(formatCurrency(1000000)).toBe("$1,000,000.00");
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
        case "bank-transfer":
          return "outline";
        default:
          return "outline";
      }
    };

    it("capitalizes payment methods correctly", () => {
      expect(capitalizePaymentMethod("cash")).toBe("Cash");
      expect(capitalizePaymentMethod("card")).toBe("Card");
      expect(capitalizePaymentMethod("transfer")).toBe("Transfer");
      expect(capitalizePaymentMethod("bank-transfer")).toBe("Bank-transfer");
    });

    it("returns correct badge variants for payment methods", () => {
      expect(getPaymentMethodBadgeVariant("cash")).toBe("default");
      expect(getPaymentMethodBadgeVariant("card")).toBe("secondary");
      expect(getPaymentMethodBadgeVariant("transfer")).toBe("outline");
      expect(getPaymentMethodBadgeVariant("bank-transfer")).toBe("outline");
      expect(getPaymentMethodBadgeVariant("unknown")).toBe("outline");
    });

    it("handles case-insensitive payment method variants", () => {
      expect(getPaymentMethodBadgeVariant("CASH")).toBe("default");
      expect(getPaymentMethodBadgeVariant("Card")).toBe("secondary");
      expect(getPaymentMethodBadgeVariant("TRANSFER")).toBe("outline");
    });
  });

  describe("Date Processing and Formatting", () => {
    const formatPaymentDate = (dateString: string | null): string => {
      if (!dateString) return "N/A";
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch {
        return "Invalid Date";
      }
    };

    const isDateInRange = (dateString: string | null, range: DateRange): boolean => {
      if (!dateString || !range.from || !range.to) return false;
      
      const paymentDate = new Date(dateString);
      const fromDate = new Date(range.from);
      const toDate = new Date(range.to);
      
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
      
      return paymentDate >= fromDate && paymentDate <= toDate;
    };

    it("formats valid dates correctly", () => {
      expect(formatPaymentDate("2024-12-15")).toBe("Dec 15, 2024");
      expect(formatPaymentDate("2024-01-01")).toBe("Jan 1, 2024");
      expect(formatPaymentDate("2024-12-31")).toBe("Dec 31, 2024");
    });

    it("handles null and invalid dates", () => {
      expect(formatPaymentDate(null)).toBe("N/A");
      expect(formatPaymentDate("invalid-date")).toBe("Invalid Date");
      expect(formatPaymentDate("")).toBe("N/A"); // Empty string gets converted to null/falsy
    });

    it("validates date range inclusion correctly", () => {
      const range: DateRange = {
        from: new Date("2024-12-15"),
        to: new Date("2024-12-17"),
      };

      expect(isDateInRange("2024-12-15", range)).toBe(true);
      expect(isDateInRange("2024-12-16", range)).toBe(true);
      expect(isDateInRange("2024-12-17", range)).toBe(true);
      expect(isDateInRange("2024-12-14", range)).toBe(false);
      expect(isDateInRange("2024-12-18", range)).toBe(false);
    });

    it("handles incomplete date ranges", () => {
      const incompleteRange: DateRange = { from: new Date("2024-12-15"), to: undefined };
      
      expect(isDateInRange("2024-12-15", incompleteRange)).toBe(false);
      expect(isDateInRange("2024-12-16", incompleteRange)).toBe(false);
    });
  });

  describe("Payment Data Validation", () => {
    it("validates complete payment data correctly", () => {
      const validation = validatePaymentData(mockPaymentData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("detects missing payment information", () => {
      const incompletePayment = {
        ...mockPaymentData,
        id: "",
        amount: -100,
        payment_method: "",
      };

      const validation = validatePaymentData(incompletePayment);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Payment ID is required");
      expect(validation.errors).toContain("Payment amount must be a non-negative number");
      expect(validation.errors).toContain("Payment method is required");
    });

    it("detects missing vehicle information", () => {
      const incompletePayment = {
        ...mockPaymentData,
        vehicle: {
          ...mockPaymentData.vehicle,
          id: "",
          license_plate: "",
        },
      };

      const validation = validatePaymentData(incompletePayment);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Vehicle ID is required");
      expect(validation.errors).toContain("Vehicle license plate is required");
    });

    it("detects missing customer information", () => {
      const incompletePayment = {
        ...mockPaymentData,
        vehicle: {
          ...mockPaymentData.vehicle,
          customer: {
            ...mockPaymentData.vehicle.customer,
            id: "",
            name: "",
          },
        },
      };

      const validation = validatePaymentData(incompletePayment);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Customer ID is required");
      expect(validation.errors).toContain("Customer name is required");
    });

    it("handles zero amount payments", () => {
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
      const paymentsWithNullDate = [
        mockPaymentData,
        mockPaymentDataMissingInfo, // has null payment_date
        mockPaymentDataCard,
      ];

      const sorted = sortPaymentsByDate(paymentsWithNullDate, false);
      expect(sorted).toHaveLength(3);
      // Null dates should be treated as earliest (epoch 0)
      expect(sorted[sorted.length - 1].payment_date).toBeNull();
    });
  });

  describe("Profile Information Processing", () => {
    const getCreatedByDisplayName = (payment: PaymentWithDetails): string => {
      if (payment.created_by_profile?.full_name) {
        return payment.created_by_profile.full_name;
      }
      
      if (payment.created_by_profile?.email) {
        return payment.created_by_profile.email;
      }
      
      if (payment.created_by === null) {
        return "Public Payment";
      }
      
      return "Unknown";
    };

    const getCreatedByEmail = (payment: PaymentWithDetails): string | null => {
      return payment.created_by_profile?.email || null;
    };

    it("displays full name when available", () => {
      expect(getCreatedByDisplayName(mockPaymentData)).toBe("Admin User");
      expect(getCreatedByDisplayName(mockPaymentDataCard)).toBe("Employee User");
    });

    it("falls back to email when full name is not available", () => {
      expect(getCreatedByDisplayName(mockPaymentDataMissingInfo)).toBe("noname@garage.com");
    });

    it("handles public payments correctly", () => {
      const publicPayment = {
        ...mockPaymentData,
        created_by: null,
        created_by_profile: undefined,
      };
      
      expect(getCreatedByDisplayName(publicPayment)).toBe("Public Payment");
    });

    it("handles missing profile information", () => {
      expect(getCreatedByDisplayName(mockPaymentDataNoProfile)).toBe("Unknown");
    });

    it("extracts email information correctly", () => {
      expect(getCreatedByEmail(mockPaymentData)).toBe("admin@garage.com");
      expect(getCreatedByEmail(mockPaymentDataCard)).toBe("employee@garage.com");
      expect(getCreatedByEmail(mockPaymentDataNoProfile)).toBeNull();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("handles extremely large payment amounts", () => {
      const validation = validatePaymentData(mockPaymentDataLargeAmount);
      expect(validation.isValid).toBe(true);
      
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(mockPaymentDataLargeAmount.amount);
      expect(formatted).toBe("$999,999.99");
    });

    it("handles very small payment amounts", () => {
      const validation = validatePaymentData(mockPaymentDataSmallAmount);
      expect(validation.isValid).toBe(true);
      
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(mockPaymentDataSmallAmount.amount);
      expect(formatted).toBe("$0.01");
    });

    it("handles special characters in customer names", () => {
      const specialCharPayment = {
        ...mockPaymentData,
        vehicle: {
          ...mockPaymentData.vehicle,
          customer: {
            ...mockPaymentData.vehicle.customer,
            name: "José María Ñuñez",
            email: "josé@email.com",
          },
        },
      };

      const validation = validatePaymentData(specialCharPayment);
      expect(validation.isValid).toBe(true);
      expect(specialCharPayment.vehicle.customer.name).toBe("José María Ñuñez");
    });

    it("handles missing optional fields gracefully", () => {
      const paymentWithMissingOptionals = {
        ...mockPaymentData,
        vehicle: {
          ...mockPaymentData.vehicle,
          customer: {
            ...mockPaymentData.vehicle.customer,
            phone: null,
            email: null,
            address: null,
          },
        },
      };

      const validation = validatePaymentData(paymentWithMissingOptionals);
      expect(validation.isValid).toBe(true);
    });

    it("handles concurrent payment operations in statistics", () => {
      const duplicatePayments = [
        mockPaymentData,
        mockPaymentData,
        mockPaymentDataCard,
      ];

      const total = duplicatePayments.reduce((sum, p) => sum + p.amount, 0);
      expect(total).toBe(1940.50); // 545 + 545 + 850.50
      
      const methodDistribution = duplicatePayments.reduce((acc, payment) => {
        const method = payment.payment_method;
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      expect(methodDistribution["cash"]).toBe(2);
      expect(methodDistribution["card"]).toBe(1);
    });
  });
});
