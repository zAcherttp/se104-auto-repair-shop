"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getPaymentImageURL } from "@/lib/utils";
import ZoomableImage from "../zoomable-image";
import SubmitButton from "@/components/submit-button";
import { toast } from "sonner";
import CurrencyInput from "react-currency-input-field";
import { createClient } from "@/supabase/client";
import { Vehicle, Customer } from "@/types";

interface OrderTrackingPaymentDialogProps {
  trigger: React.ReactNode;
  vehicle: Vehicle;
  customer: Customer;
  debtAmount: number;
  onPaymentSuccess?: () => void;
}

export function OrderTrackingPaymentDialog({
  trigger,
  vehicle,
  customer,
  debtAmount,
  onPaymentSuccess,
}: OrderTrackingPaymentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [showQRCode, setShowQRCode] = useState(false);

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

      // Calculate current debt to ensure we don't overpay
      const { data: vehicleData, error: vehicleError } = await supabase
        .from("vehicles")
        .select(
          `
          id,
          total_paid,
          repair_orders (
            total_amount
          ),
          payments (
            amount
          )
        `
        )
        .eq("id", vehicle.id)
        .single();

      if (vehicleError) {
        toast.error("Failed to fetch vehicle data");
        return;
      }

      // Calculate current debt
      const totalRepairCosts =
        vehicleData.repair_orders?.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0
        ) || 0;
      const totalPaid =
        vehicleData.payments?.reduce(
          (sum, payment) => sum + payment.amount,
          0
        ) || 0;
      const remainingDebt = totalRepairCosts - totalPaid;

      if (remainingDebt <= 0) {
        toast.error("No outstanding debt found for this vehicle");
        return;
      }

      if (paymentAmount > remainingDebt) {
        toast.error(
          `Payment amount exceeds remaining debt of $${remainingDebt.toFixed(
            2
          )}`
        );
        return;
      }

      // Insert new payment record with created_by as null (public payment)
      const { error: paymentError } = await supabase.from("payments").insert({
        vehicle_id: vehicle.id,
        amount: paymentAmount,
        payment_method: "online",
        created_by: null, // Set to null for public order tracking payments
        payment_date: new Date().toISOString().split("T")[0],
      });

      if (paymentError) {
        toast.error("Failed to process payment");
        return;
      }

      // Update vehicle's total_paid
      const newTotalPaid = totalPaid + paymentAmount;
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
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Vehicle:</span>
              <span className="font-medium">{vehicle.license_plate}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-medium">{customer.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Brand:</span>
              <span className="font-medium">{vehicle.brand}</span>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border">
            <p className="text-muted-foreground mb-4">Payment Amount:</p>
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
                className="w-full text-center text-2xl font-bold bg-transparent border-0 outline-none focus:ring-2 focus:ring-green-500 rounded px-2 py-1 disabled:opacity-50"
                style={{
                  color: paymentAmount > debtAmount ? "#ef4444" : "#16a34a",
                }}
                placeholder="Enter amount"
                step={0.01}
              />
              <div className="text-sm text-muted-foreground">
                Max:{" "}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(debtAmount)}
              </div>
              {paymentAmount > debtAmount && (
                <p className="text-sm text-red-500">
                  Payment cannot exceed debt amount
                </p>
              )}
              {paymentAmount <= 0 && (
                <p className="text-sm text-red-500">
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
            <div className="flex justify-center p-4 bg-white rounded-lg border">
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
