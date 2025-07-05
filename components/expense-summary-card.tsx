import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderDataProps } from "@/types";

type ExpenseSummaryCardProps = {
  orderData: OrderDataProps;
};

const ExpenseSummaryCard = ({ orderData }: ExpenseSummaryCardProps) => {
  const { vehicle, RepairOrderWithItemsDetails } = orderData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Calculate total expense across all repair orders
  const totalExpense = RepairOrderWithItemsDetails.reduce(
    (sum, order) => sum + (order.total_amount || 0),
    0
  );

  // Calculate total paid amount from all payments
  const totalPaid =
    vehicle.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

  // Calculate remaining amount
  const remainingAmount = totalExpense - totalPaid;

  return (
    <Card className="mb-6 border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Expense */}
          <div className="bg-expense-info p-4 rounded-lg text-center">
            <div className="text-sm font-medium mb-2">Total Expense</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalExpense)}
            </div>
          </div>

          <div className="bg-expense-success p-4 rounded-lg text-center">
            <div className="text-sm font-medium mb-2">Amount Paid</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </div>
          </div>

          <div className="p-4 rounded-lg text-center">
            <div className="text-sm font-medium mb-2">
              {remainingAmount > 0
                ? "Amount Due"
                : remainingAmount < 0
                ? "Overpaid"
                : "Paid in Full"}
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(Math.abs(remainingAmount))}
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <strong>Total Repair Orders:</strong>{" "}
              {RepairOrderWithItemsDetails.length}
            </div>
            <div>
              <strong>Payment Status:</strong>
              <span
                className={`ml-2 font-medium ${
                  remainingAmount > 0
                    ? "text-expense-error-foreground"
                    : remainingAmount < 0
                    ? "text-expense-warning-foreground"
                    : "text-expense-success-foreground"
                }`}
              >
                {remainingAmount > 0
                  ? "Outstanding"
                  : remainingAmount < 0
                  ? "Overpaid"
                  : "Paid in Full"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseSummaryCard;
