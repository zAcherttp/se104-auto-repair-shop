/**
 * Track Order Data Processing Tests
 *
 * This test suite focuses on validating the data processing and transformation logic
 * used in the track-order functionality. Tests core business logic without UI dependencies.
 */

import {
  mockOrderData,
  mockOrderDataMultipleOrders,
  mockOrderDataOverpaid,
  mockOrderDataPaidInFull,
  mockOrderDataWithDebt,
} from "@/test/mocks/track-order-data";
import type { OrderDataProps, RepairOrderWithItemsDetails } from "@/types";

describe("Track Order Data Processing", () => {
  describe("Expense Calculation Functions", () => {
    const calculateTotalExpense = (orderData: OrderDataProps): number => {
      return orderData.RepairOrderWithItemsDetails.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0,
      );
    };

    const calculateTotalPaid = (orderData: OrderDataProps): number => {
      return (
        orderData.vehicle.payments?.reduce(
          (sum, payment) => sum + payment.amount,
          0,
        ) || 0
      );
    };

    const calculateRemainingAmount = (orderData: OrderDataProps): number => {
      return calculateTotalExpense(orderData) - calculateTotalPaid(orderData);
    };

    it("calculates total expense correctly for single order", () => {
      const totalExpense = calculateTotalExpense(mockOrderData);
      expect(totalExpense).toBe(545.0);
    });

    it("calculates total expense correctly for multiple orders", () => {
      const totalExpense = calculateTotalExpense(mockOrderDataMultipleOrders);
      expect(totalExpense).toBe(845.0);
    });

    it("calculates total paid amount correctly", () => {
      const totalPaid = calculateTotalPaid(mockOrderData);
      expect(totalPaid).toBe(350.0);
    });

    it("calculates remaining amount for debt scenario", () => {
      const remaining = calculateRemainingAmount(mockOrderDataWithDebt);
      expect(remaining).toBe(345.0);
      expect(remaining > 0).toBe(true);
    });

    it("calculates remaining amount for overpaid scenario", () => {
      const remaining = calculateRemainingAmount(mockOrderDataOverpaid);
      expect(remaining).toBe(-105.0);
      expect(remaining < 0).toBe(true);
    });

    it("calculates remaining amount for paid in full scenario", () => {
      const remaining = calculateRemainingAmount(mockOrderDataPaidInFull);
      expect(remaining).toBe(0.0);
      expect(remaining === 0).toBe(true);
    });

    it("handles empty payments array", () => {
      const mockDataNoPayments = {
        ...mockOrderData,
        vehicle: {
          ...mockOrderData.vehicle,
          payments: [],
        },
      };

      const totalPaid = calculateTotalPaid(mockDataNoPayments);
      const remaining = calculateRemainingAmount(mockDataNoPayments);

      expect(totalPaid).toBe(0);
      expect(remaining).toBe(545.0);
    });

    it("handles undefined payments", () => {
      const mockDataUndefinedPayments = {
        ...mockOrderData,
        vehicle: {
          ...mockOrderData.vehicle,
          payments: undefined,
        },
      };

      const totalPaid = calculateTotalPaid(mockDataUndefinedPayments);
      expect(totalPaid).toBe(0);
    });

    it("handles empty repair orders array", () => {
      const mockDataNoOrders = {
        ...mockOrderData,
        RepairOrderWithItemsDetails: [],
      };

      const totalExpense = calculateTotalExpense(mockDataNoOrders);
      expect(totalExpense).toBe(0);
    });
  });

  describe("Payment Status Determination", () => {
    const getPaymentStatus = (orderData: OrderDataProps): string => {
      const totalExpense = orderData.RepairOrderWithItemsDetails.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0,
      );
      const totalPaid =
        orderData.vehicle.payments?.reduce(
          (sum, payment) => sum + payment.amount,
          0,
        ) || 0;
      const remainingAmount = totalExpense - totalPaid;

      if (remainingAmount > 0) return "Outstanding";
      if (remainingAmount < 0) return "Overpaid";
      return "Paid in Full";
    };

    it("determines outstanding status correctly", () => {
      const status = getPaymentStatus(mockOrderDataWithDebt);
      expect(status).toBe("Outstanding");
    });

    it("determines overpaid status correctly", () => {
      const status = getPaymentStatus(mockOrderDataOverpaid);
      expect(status).toBe("Overpaid");
    });

    it("determines paid in full status correctly", () => {
      const status = getPaymentStatus(mockOrderDataPaidInFull);
      expect(status).toBe("Paid in Full");
    });

    it("handles edge case with no payments", () => {
      const mockDataNoPayments = {
        ...mockOrderData,
        vehicle: {
          ...mockOrderData.vehicle,
          payments: [],
        },
      };

      const status = getPaymentStatus(mockDataNoPayments);
      expect(status).toBe("Outstanding");
    });

    it("handles edge case with no orders", () => {
      const mockDataNoOrders = {
        ...mockOrderData,
        RepairOrderWithItemsDetails: [],
      };

      const status = getPaymentStatus(mockDataNoOrders);
      expect(status).toBe("Overpaid"); // All payments are overpayment
    });
  });

  describe("Currency Formatting Logic", () => {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    };

    it("formats positive amounts correctly", () => {
      expect(formatCurrency(545.0)).toBe("$545.00");
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
    });

    it("formats zero amount correctly", () => {
      expect(formatCurrency(0)).toBe("$0.00");
    });

    it("formats negative amounts correctly", () => {
      expect(formatCurrency(-105.0)).toBe("-$105.00");
    });

    it("formats large amounts with commas", () => {
      expect(formatCurrency(1000000.5)).toBe("$1,000,000.50");
    });

    it("handles decimal precision correctly", () => {
      expect(formatCurrency(123.456)).toBe("$123.46"); // Rounds to 2 decimal places
      expect(formatCurrency(123.454)).toBe("$123.45");
    });
  });

  describe("Repair Order Item Processing", () => {
    const processRepairOrderItems = (order: RepairOrderWithItemsDetails) => {
      return order.repair_order_items.map((item) => ({
        ...item,
        calculatedTotal:
          (item.unit_price || 0) * (item.quantity || 0) +
          (item.labor_cost || 0),
      }));
    };

    it("processes repair order items correctly", () => {
      const order = mockOrderData.RepairOrderWithItemsDetails[0];
      const processedItems = processRepairOrderItems(order);

      expect(processedItems).toHaveLength(2);
      expect(processedItems[0].calculatedTotal).toBe(460.0); // (150 * 2) + 160
      expect(processedItems[1].calculatedTotal).toBe(85.0); // (50 * 1) + 35
    });

    it("validates item totals match stored totals", () => {
      const order = mockOrderData.RepairOrderWithItemsDetails[0];
      const processedItems = processRepairOrderItems(order);

      processedItems.forEach((item, index) => {
        expect(item.calculatedTotal).toBe(
          order.repair_order_items[index].total_amount,
        );
      });
    });

    it("handles zero quantities correctly", () => {
      const mockOrder: RepairOrderWithItemsDetails = {
        ...mockOrderData.RepairOrderWithItemsDetails[0],
        repair_order_items: [
          {
            ...mockOrderData.RepairOrderWithItemsDetails[0]
              .repair_order_items[0],
            quantity: 0,
            unit_price: 100,
            labor_cost: 50,
            total_amount: 50,
          },
        ],
      };

      const processedItems = processRepairOrderItems(mockOrder);
      expect(processedItems[0].calculatedTotal).toBe(50.0); // (100 * 0) + 50
    });

    it("handles zero labor cost correctly", () => {
      const mockOrder: RepairOrderWithItemsDetails = {
        ...mockOrderData.RepairOrderWithItemsDetails[0],
        repair_order_items: [
          {
            ...mockOrderData.RepairOrderWithItemsDetails[0]
              .repair_order_items[0],
            quantity: 2,
            unit_price: 100,
            labor_cost: 0,
            total_amount: 200,
          },
        ],
      };

      const processedItems = processRepairOrderItems(mockOrder);
      expect(processedItems[0].calculatedTotal).toBe(200.0); // (100 * 2) + 0
    });
  });

  describe("Data Validation Logic", () => {
    const validateOrderData = (
      orderData: OrderDataProps,
    ): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      // Validate vehicle data
      if (!orderData.vehicle?.id) {
        errors.push("Vehicle ID is required");
      }
      if (!orderData.vehicle?.license_plate) {
        errors.push("Vehicle license plate is required");
      }

      // Validate customer data
      if (!orderData.customer?.id) {
        errors.push("Customer ID is required");
      }
      if (!orderData.customer?.name) {
        errors.push("Customer name is required");
      }

      // Validate repair orders
      orderData.RepairOrderWithItemsDetails.forEach((order, index) => {
        if (!order.id) {
          errors.push(`Repair order ${index + 1} ID is required`);
        }
        if (typeof order.total_amount !== "number" || order.total_amount < 0) {
          errors.push(
            `Repair order ${index + 1} total amount must be a positive number`,
          );
        }
      });

      // Validate payments
      if (orderData.vehicle.payments) {
        orderData.vehicle.payments.forEach((payment, index) => {
          if (typeof payment.amount !== "number" || payment.amount <= 0) {
            errors.push(
              `Payment ${index + 1} amount must be a positive number`,
            );
          }
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    };

    it("validates correct order data", () => {
      const validation = validateOrderData(mockOrderData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("detects missing vehicle ID", () => {
      const invalidData = {
        ...mockOrderData,
        vehicle: {
          ...mockOrderData.vehicle,
          id: "",
        },
      };

      const validation = validateOrderData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Vehicle ID is required");
    });

    it("detects missing customer name", () => {
      const invalidData = {
        ...mockOrderData,
        customer: {
          ...mockOrderData.customer,
          name: "",
        },
      };

      const validation = validateOrderData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Customer name is required");
    });

    it("detects invalid payment amounts", () => {
      const invalidData = {
        ...mockOrderData,
        vehicle: {
          ...mockOrderData.vehicle,
          payments: [
            { ...mockOrderData.vehicle.payments![0], amount: -50 },
            { ...mockOrderData.vehicle.payments![1], amount: 0 },
          ],
        },
      };

      const validation = validateOrderData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(
        validation.errors.some((error) => error.includes("Payment 1 amount")),
      ).toBe(true);
      expect(
        validation.errors.some((error) => error.includes("Payment 2 amount")),
      ).toBe(true);
    });
  });

  describe("Data Aggregation Logic", () => {
    const aggregateOrderStatistics = (orderData: OrderDataProps) => {
      const totalExpense = orderData.RepairOrderWithItemsDetails.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0,
      );
      const totalPaid =
        orderData.vehicle.payments?.reduce(
          (sum, payment) => sum + payment.amount,
          0,
        ) || 0;
      const remainingAmount = totalExpense - totalPaid;

      const totalItems = orderData.RepairOrderWithItemsDetails.reduce(
        (sum, order) => sum + order.repair_order_items.length,
        0,
      );

      const averageOrderValue =
        orderData.RepairOrderWithItemsDetails.length > 0
          ? totalExpense / orderData.RepairOrderWithItemsDetails.length
          : 0;

      return {
        totalOrders: orderData.RepairOrderWithItemsDetails.length,
        totalItems,
        totalExpense,
        totalPaid,
        remainingAmount: Math.abs(remainingAmount),
        averageOrderValue,
        paymentStatus:
          remainingAmount > 0
            ? "Outstanding"
            : remainingAmount < 0
              ? "Overpaid"
              : "Paid in Full",
        paymentProgress:
          totalExpense > 0 ? (totalPaid / totalExpense) * 100 : 0,
      };
    };

    it("aggregates statistics correctly for single order", () => {
      const stats = aggregateOrderStatistics(mockOrderData);

      expect(stats.totalOrders).toBe(1);
      expect(stats.totalItems).toBe(2);
      expect(stats.totalExpense).toBe(545.0);
      expect(stats.totalPaid).toBe(350.0);
      expect(stats.remainingAmount).toBe(195.0);
      expect(stats.averageOrderValue).toBe(545.0);
      expect(stats.paymentStatus).toBe("Outstanding");
      expect(stats.paymentProgress).toBeCloseTo(64.22, 2); // (350/545) * 100
    });

    it("aggregates statistics correctly for multiple orders", () => {
      const stats = aggregateOrderStatistics(mockOrderDataMultipleOrders);

      expect(stats.totalOrders).toBe(2);
      expect(stats.totalExpense).toBe(845.0);
      expect(stats.averageOrderValue).toBe(422.5); // 845 / 2
    });

    it("handles overpaid scenario correctly", () => {
      const stats = aggregateOrderStatistics(mockOrderDataOverpaid);

      expect(stats.paymentStatus).toBe("Overpaid");
      expect(stats.remainingAmount).toBe(105.0); // Absolute value
      expect(stats.paymentProgress).toBeCloseTo(119.27, 2); // (650/545) * 100
    });

    it("handles paid in full scenario correctly", () => {
      const stats = aggregateOrderStatistics(mockOrderDataPaidInFull);

      expect(stats.paymentStatus).toBe("Paid in Full");
      expect(stats.remainingAmount).toBe(0);
      expect(stats.paymentProgress).toBe(100);
    });

    it("handles empty orders correctly", () => {
      const mockEmptyData = {
        ...mockOrderData,
        RepairOrderWithItemsDetails: [],
      };

      const stats = aggregateOrderStatistics(mockEmptyData);

      expect(stats.totalOrders).toBe(0);
      expect(stats.totalItems).toBe(0);
      expect(stats.totalExpense).toBe(0);
      expect(stats.averageOrderValue).toBe(0);
      expect(stats.paymentProgress).toBe(0);
    });
  });
});
