"use client";

import type React from "react";
import { useEffect, useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { toast } from "sonner";
import SubmitButton from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useVehicleDebt } from "@/hooks/use-vehicle-debt";
import { getPaymentImageURL } from "@/lib/utils";
import { createClient } from "@/supabase/client";
import type { Customer, Vehicle } from "@/types";
import { Label } from "../ui/label";
import ZoomableImage from "../zoomable-image";

interface OrderTrackingPaymentDialogProps {
  trigger: React.ReactNode;
  vehicle: Vehicle;
  customer: Customer;
  onPaymentSuccess?: () => void;
}

export function OrderTrackingPaymentDialog({
  trigger,
  vehicle,
  customer,
  onPaymentSuccess,
}: OrderTrackingPaymentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [showQRCode, setShowQRCode] = useState(false);

  // Use the vehicle debt hook to fetch and manage debt data
  const {
    data: debtData,
    isLoading: debtLoading,
    refetch: refetchDebt,
  } = useVehicleDebt({
    vehicleId: vehicle.id,
    enabled: open, // Only fetch when dialog is open
  });

  const debtAmount = debtData?.remainingDebt || 0;

  const handleProceedToPayment = () => {
    if (paymentAmount <= 0) {
      toast.error("Payment amount must be greater than 0");
      return;
    }

    if (paymentAmount > debtAmount) {
      toast.error("Payment amount cannot exceed debt amount");
      return;
    }

    setShowQRCode(true);
  };

  const handlePaymentSuccess = async () => {
    if (paymentAmount <= 0) {
      toast.error("Payment amount must be greater than 0");
      return;
    }

    if (paymentAmount > debtAmount) {
      toast.error("Payment amount cannot exceed debt amount");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();

      // Use the current debt data from the hook
      if (!debtData) {
        toast.error("Unable to fetch current debt information");
        return;
      }

      if (debtData.remainingDebt <= 0) {
        toast.error("No outstanding debt found for this vehicle");
        return;
      }

      if (paymentAmount > debtData.remainingDebt) {
        toast.error(
          `Payment amount exceeds remaining debt of $${debtData.remainingDebt.toFixed(
            2,
          )}`,
        );
        return;
      }

      // Insert new payment record with created_by as null (public payment)
      const { error: paymentError } = await supabase.from("payments").insert({
        vehicle_id: vehicle.id,
        amount: paymentAmount,
        payment_method: "bank-transfer",
        created_by: null, // Set to null for public order tracking payments
        payment_date: new Date().toISOString().split("T")[0],
      });

      if (paymentError) {
        toast.error("Failed to process payment");
        return;
      }

      // Update vehicle's total_paid
      const newTotalPaid = debtData.totalPaid + paymentAmount;
      const { error: updateError } = await supabase
        .from("vehicles")
        .update({ total_paid: newTotalPaid })
        .eq("id", vehicle.id);

      if (updateError) {
        toast.error("Failed to update payment records");
        return;
      }

      toast.success("Payment confirmed successfully");
      setOpen(false);

      // Refetch the debt data to get updated values
      await refetchDebt();

      // Call the parent callback to refresh order data
      onPaymentSuccess?.();
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize payment amount when dialog opens
  useEffect(() => {
    if (open) {
      setPaymentAmount(debtAmount);
      setShowQRCode(false);
    }
  }, [open, debtAmount]);

  // Don't render if there's no debt or if still loading
  if (debtLoading && open) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="w-80 sm:w-full sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-gray-900 border-b-2" />
              <p className="text-muted-foreground">
                Loading payment information...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Don't render if there's no debt
  if (debtAmount <= 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-80 sm:w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Payment QR Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vehicle Info */}
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
            <div className="flex items-center justify-between text-sm">
              <Label className="text-muted-foreground">Vehicle:</Label>
              <Label className="font-medium">{vehicle.license_plate}</Label>
            </div>
            <div className="flex items-center justify-between text-sm">
              <Label className="text-muted-foreground">Customer:</Label>
              <Label className="font-medium">{customer.name}</Label>
            </div>
            <div className="flex items-center justify-between text-sm">
              <Label className="text-muted-foreground">Brand:</Label>
              <Label className="font-medium">{vehicle.brand}</Label>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 p-4 text-center dark:from-green-950 dark:to-emerald-950">
            <p className="mb-4 text-muted-foreground">Payment Amount:</p>
            <div className="space-y-2">
              <CurrencyInput
                id="payment-amount"
                name="paymentAmount"
                value={paymentAmount}
                onValueChange={(value) => setPaymentAmount(Number(value) || 0)}
                prefix="$"
                decimalsLimit={2}
                decimalSeparator="."
                groupSeparator=","
                allowDecimals={true}
                allowNegativeValue={false}
                disabled={showQRCode}
                className="w-full rounded border-0 bg-transparent px-2 py-1 text-center font-bold text-2xl outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                style={{
                  color: paymentAmount > debtAmount ? "#ef4444" : "#16a34a",
                }}
                placeholder="Enter amount"
                step={0.01}
              />
              <div className="text-muted-foreground text-sm">
                Max:{" "}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(debtAmount)}
              </div>
              {paymentAmount > debtAmount && (
                <p className="text-red-500 text-sm">
                  Payment cannot exceed debt amount
                </p>
              )}
              {paymentAmount <= 0 && (
                <p className="text-red-500 text-sm">
                  Payment must be greater than 0
                </p>
              )}
              {!showQRCode && (
                <Button
                  onClick={handleProceedToPayment}
                  disabled={paymentAmount <= 0 || paymentAmount > debtAmount}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Proceed to Payment
                </Button>
              )}
            </div>
          </div>

          {/* QR Code */}
          {showQRCode && (
            <div className="flex justify-center rounded-lg border bg-white p-4">
              <ZoomableImage
                src={getPaymentImageURL({
                  bankCode: process.env.NEXT_PUBLIC_VIETQR_BANKCODE || "N/A",
                  destinationAccount:
                    process.env.NEXT_PUBLIC_VIETQR_DESTINATION_ACCOUNT || "N/A",
                  amount: paymentAmount,
                  description: `Payment for ${vehicle.license_plate}`,
                })}
                alt="Payment QR Code"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {showQRCode ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setShowQRCode(false)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Back to Edit
                </Button>
                <SubmitButton
                  disabled={isLoading}
                  onClick={handlePaymentSuccess}
                  type="button"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Confirm Payment
                </SubmitButton>
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
