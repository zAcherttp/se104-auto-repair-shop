import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { OrderDataProps } from "@/types";
import { OrderTrackingPaymentDialog } from "@/components/dialogs/order-tracking-payment-dialog";
import { useVehicleDebt } from "@/hooks/use-vehicle-debt";

type ExpenseSummaryCardProps = {
  orderData: OrderDataProps;
  onPaymentSuccess?: () => void;
};

const ExpenseSummaryCard = ({
  orderData,
  onPaymentSuccess,
}: ExpenseSummaryCardProps) => {
  const { vehicle, RepairOrderWithItemsDetails } = orderData;

  // Use the vehicle debt hook to get real-time debt information
  const {
    data: debtData,
    isLoading: debtLoading,
    refetch: refetchDebt,
  } = useVehicleDebt({
    vehicleId: vehicle.id,
    enabled: true,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Use data from the hook if available, otherwise fallback to calculating from orderData
  const totalExpense =
    debtData?.totalExpense ||
    RepairOrderWithItemsDetails.reduce(
      (sum, order) => sum + (order.total_amount || 0),
      0
    );

  const totalPaid =
    debtData?.totalPaid ||
    vehicle.payments?.reduce((sum, payment) => sum + payment.amount, 0) ||
    0;

  const remainingAmount = debtData?.remainingDebt ?? totalExpense - totalPaid;

  // Enhanced onPaymentSuccess that refetches debt data
  const handlePaymentSuccess = async () => {
    await refetchDebt();
    onPaymentSuccess?.();
  };

  // Show loading state if debt data is being fetched
  if (debtLoading) {
    return (
      <Card className="mb-6 border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading payment information...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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

          {/* Payment Button */}
          {remainingAmount > 0 && (
            <div className="mt-4 text-center">
              <OrderTrackingPaymentDialog
                trigger={
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Make Payment
                  </Button>
                }
                vehicle={orderData.vehicle}
                customer={orderData.customer}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseSummaryCard;
