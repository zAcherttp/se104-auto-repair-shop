import { CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import { OrderTrackingPaymentDialog } from "@/components/dialogs/order-tracking-payment-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVehicleDebt } from "@/hooks/use-vehicle-debt";
import type { OrderDataProps } from "@/types";
import { Label } from "./ui/label";

type ExpenseSummaryCardProps = {
  orderData: OrderDataProps;
  onPaymentSuccess?: () => void;
};

const ExpenseSummaryCard = ({
  orderData,
  onPaymentSuccess,
}: ExpenseSummaryCardProps) => {
  const t = useTranslations("auth.trackOrder.expense");
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
      0,
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
          <CardTitle className="flex items-center gap-2">
            {t("summary")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-gray-900 border-b-2" />
              <p className="text-muted-foreground">{t("loadingPaymentInfo")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t("summary")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Total Expense */}
          <div className="rounded-lg bg-expense-info p-4 text-center">
            <div className="mb-2 font-medium text-sm">{t("totalExpense")}</div>
            <div className="font-bold text-2xl text-green-600">
              {formatCurrency(totalExpense)}
            </div>
          </div>

          <div className="rounded-lg bg-expense-success p-4 text-center">
            <div className="mb-2 font-medium text-sm">{t("amountPaid")}</div>
            <div className="font-bold text-2xl text-green-600">
              {formatCurrency(totalPaid)}
            </div>
          </div>

          <div className="rounded-lg p-4 text-center">
            <div className="mb-2 font-medium text-sm">
              {remainingAmount > 0
                ? t("amountDue")
                : remainingAmount < 0
                  ? t("overpaid")
                  : t("paidInFull")}
            </div>
            <div className="font-bold text-2xl text-green-600">
              {formatCurrency(Math.abs(remainingAmount))}
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="mt-4 border-border border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-muted-foreground text-sm">
            <div>
              <strong>{t("totalRepairOrders")}:</strong>{" "}
              {RepairOrderWithItemsDetails.length}
            </div>
            <div>
              <strong>{t("paymentStatus")}:</strong>
              <Label
                className={`ml-2 font-medium ${
                  remainingAmount > 0
                    ? "text-expense-error-foreground"
                    : remainingAmount < 0
                      ? "text-expense-warning-foreground"
                      : "text-expense-success-foreground"
                }`}
              >
                {remainingAmount > 0
                  ? t("amountDue")
                  : remainingAmount < 0
                    ? t("overpaid")
                    : t("paidInFull")}
              </Label>
            </div>
          </div>

          {/* Payment Button */}
          {remainingAmount > 0 && (
            <div className="mt-4 text-center">
              <OrderTrackingPaymentDialog
                trigger={
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t("makePayment")}
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
