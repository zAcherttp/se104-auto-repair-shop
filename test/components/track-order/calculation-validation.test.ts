/**
 * Track Order Calculation Validation Tests
 * 
 * This test suite focuses on validating the financial calculations used in the track-order functionality.
 * It tests the core business logic for expense calculations, payment tracking, and debt management.
 */

import {
  mockOrderData,
  mockOrderDataMultipleOrders,
  mockOrderDataOverpaid,
  mockOrderDataWithDebt,
  mockOrderDataPaidInFull,
  mockRepairOrders,
  mockPayments,
} from "@/test/mocks/track-order-data";
import type { OrderDataProps } from "@/types";

describe("Track Order Calculation Logic", () => {
  describe("Total Expense Calculations", () => {
    it("calculates single repair order total correctly", () => {
      const totalExpense = mockOrderData.RepairOrderWithItemsDetails.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );

      expect(totalExpense).toBe(545.00);
    });

    it("calculates multiple repair orders total correctly", () => {
      const totalExpense = mockOrderDataMultipleOrders.RepairOrderWithItemsDetails.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );

      // First order: $545.00, Second order: $300.00
      expect(totalExpense).toBe(845.00);
    });

    it("handles null total amounts correctly", () => {
      const mockDataWithNull = {
        ...mockOrderData,
        RepairOrderWithItemsDetails: [
          {
            ...mockOrderData.RepairOrderWithItemsDetails[0],
            total_amount: null,
          }
        ],
      };

      const totalExpense = mockDataWithNull.RepairOrderWithItemsDetails.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );

      expect(totalExpense).toBe(0);
    });

    it("handles empty repair orders array", () => {
      const totalExpense = [].reduce(
        (sum: number, order: any) => sum + (order.total_amount || 0),
        0
      );

      expect(totalExpense).toBe(0);
    });
  });

  describe("Payment Total Calculations", () => {
    it("calculates total payments correctly", () => {
      const totalPaid = mockOrderData.vehicle.payments?.reduce(
        (sum, payment) => sum + payment.amount,
        0
      ) || 0;

      // $200.00 + $150.00 = $350.00
      expect(totalPaid).toBe(350.00);
    });

    it("handles empty payments array", () => {
      const totalPaid = [].reduce(
        (sum: number, payment: any) => sum + payment.amount,
        0
      );

      expect(totalPaid).toBe(0);
    });

    it("calculates large payment amounts correctly", () => {
      const largePayments = [
        { amount: 999999.99 },
        { amount: 0.01 },
      ];

      const totalPaid = largePayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      expect(totalPaid).toBe(1000000.00);
    });
  });

  describe("Remaining Amount Calculations", () => {
    it("calculates outstanding debt correctly", () => {
      const totalExpense = mockOrderDataWithDebt.RepairOrderWithItemsDetails.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );
      const totalPaid = mockOrderDataWithDebt.vehicle.payments?.reduce(
        (sum, payment) => sum + payment.amount,
        0
      ) || 0;
      const remainingAmount = totalExpense - totalPaid;

      // $545.00 - $200.00 = $345.00
      expect(remainingAmount).toBe(345.00);
      expect(remainingAmount > 0).toBe(true); // Should be positive (debt)
    });

    it("calculates overpayment correctly", () => {
      const totalExpense = mockOrderDataOverpaid.RepairOrderWithItemsDetails.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );
      const totalPaid = mockOrderDataOverpaid.vehicle.payments?.reduce(
        (sum, payment) => sum + payment.amount,
        0
      ) || 0;
      const remainingAmount = totalExpense - totalPaid;

      // $545.00 - $650.00 = -$105.00
      expect(remainingAmount).toBe(-105.00);
      expect(remainingAmount < 0).toBe(true); // Should be negative (overpaid)
    });

    it("calculates exact payment correctly", () => {
      const totalExpense = mockOrderDataPaidInFull.RepairOrderWithItemsDetails.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );
      const totalPaid = mockOrderDataPaidInFull.vehicle.payments?.reduce(
        (sum, payment) => sum + payment.amount,
        0
      ) || 0;
      const remainingAmount = totalExpense - totalPaid;

      // $545.00 - $545.00 = $0.00
      expect(remainingAmount).toBe(0.00);
      expect(remainingAmount === 0).toBe(true); // Should be exactly zero
    });
  });

  describe("Repair Order Item Calculations", () => {
    it("validates individual item totals", () => {
      const firstItem = mockRepairOrders[0].repair_order_items[0];
      const expectedTotal = (firstItem.unit_price || 0) * (firstItem.quantity || 0) + (firstItem.labor_cost || 0);

      // (150 * 2) + 160 = 460
      expect(firstItem.total_amount).toBe(expectedTotal);
      expect(firstItem.total_amount).toBe(460.00);
    });

    it("validates item totals sum to order total", () => {
      const order = mockRepairOrders[0];
      const itemsTotal = order.repair_order_items.reduce(
        (sum, item) => sum + item.total_amount,
        0
      );

      expect(itemsTotal).toBe(order.total_amount);
      expect(itemsTotal).toBe(545.00); // 460 + 85
    });

    it("handles zero quantities correctly", () => {
      const mockItemZeroQuantity = {
        unit_price: 100,
        quantity: 0,
        labor_cost: 50,
      };

      const expectedTotal = (mockItemZeroQuantity.unit_price * mockItemZeroQuantity.quantity) + mockItemZeroQuantity.labor_cost;
      expect(expectedTotal).toBe(50.00); // 0 + 50
    });

    it("handles zero labor cost correctly", () => {
      const mockItemZeroLabor = {
        unit_price: 100,
        quantity: 2,
        labor_cost: 0,
      };

      const expectedTotal = (mockItemZeroLabor.unit_price * mockItemZeroLabor.quantity) + mockItemZeroLabor.labor_cost;
      expect(expectedTotal).toBe(200.00); // 200 + 0
    });
  });

  describe("Decimal Precision", () => {
    it("maintains precision with decimal calculations", () => {
      const amount1 = 123.45;
      const amount2 = 67.89;
      const total = amount1 + amount2;

      expect(total).toBe(191.34);
      expect(Number(total.toFixed(2))).toBe(191.34);
    });

    it("handles floating point arithmetic correctly", () => {
      const amount1 = 0.1;
      const amount2 = 0.2;
      const total = Math.round((amount1 + amount2) * 100) / 100;

      expect(total).toBe(0.3);
    });

    it("rounds currency amounts correctly", () => {
      const amount = 123.456789;
      const rounded = Math.round(amount * 100) / 100;

      expect(rounded).toBe(123.46);
    });
  });

  describe("Business Logic Edge Cases", () => {
    it("handles scenario with no payments but has orders", () => {
      const mockNoPayments: OrderDataProps = {
        vehicle: {
          ...mockOrderData.vehicle,
          payments: [],
        },
        customer: mockOrderData.customer,
        RepairOrderWithItemsDetails: mockOrderData.RepairOrderWithItemsDetails,
      };

      const totalExpense = mockNoPayments.RepairOrderWithItemsDetails.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );
      const totalPaid = mockNoPayments.vehicle.payments?.reduce(
        (sum, payment) => sum + payment.amount,
        0
      ) || 0;
      const remainingAmount = totalExpense - totalPaid;

      expect(totalExpense).toBe(545.00);
      expect(totalPaid).toBe(0);
      expect(remainingAmount).toBe(545.00);
    });

    it("handles scenario with payments but no orders", () => {
      const mockNoOrders: OrderDataProps = {
        vehicle: mockOrderData.vehicle,
        customer: mockOrderData.customer,
        RepairOrderWithItemsDetails: [],
      };

      const totalExpense = mockNoOrders.RepairOrderWithItemsDetails.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );
      const totalPaid = mockNoOrders.vehicle.payments?.reduce(
        (sum, payment) => sum + payment.amount,
        0
      ) || 0;
      const remainingAmount = totalExpense - totalPaid;

      expect(totalExpense).toBe(0);
      expect(totalPaid).toBe(350.00);
      expect(remainingAmount).toBe(-350.00); // All payments are overpayment
    });

    it("handles large numbers correctly", () => {
      const largeAmount = 999999999.99;
      const calculation = largeAmount + 0.01;

      expect(calculation).toBe(1000000000.00);
    });

    it("handles negative amounts correctly", () => {
      // Negative amounts shouldn't occur in normal business logic,
      // but we should handle them gracefully if they do
      const negativeAmount = -100;
      const positiveAmount = 200;
      const total = negativeAmount + positiveAmount;

      expect(total).toBe(100);
    });
  });

  describe("Status Determination Logic", () => {
    it("correctly determines outstanding status", () => {
      const totalExpense = 545.00;
      const totalPaid = 200.00;
      const remainingAmount = totalExpense - totalPaid;

      const status = remainingAmount > 0 ? "Outstanding" : 
                    remainingAmount < 0 ? "Overpaid" : "Paid in Full";

      expect(status).toBe("Outstanding");
    });

    it("correctly determines overpaid status", () => {
      const totalExpense = 545.00;
      const totalPaid = 650.00;
      const remainingAmount = totalExpense - totalPaid;

      const status = remainingAmount > 0 ? "Outstanding" : 
                    remainingAmount < 0 ? "Overpaid" : "Paid in Full";

      expect(status).toBe("Overpaid");
    });

    it("correctly determines paid in full status", () => {
      const totalExpense = 545.00;
      const totalPaid = 545.00;
      const remainingAmount = totalExpense - totalPaid;

      const status = remainingAmount > 0 ? "Outstanding" : 
                    remainingAmount < 0 ? "Overpaid" : "Paid in Full";

      expect(status).toBe("Paid in Full");
    });
  });
});
