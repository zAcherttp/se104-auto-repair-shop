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
import { VehicleDialogProps } from "@/types/dialog";
import SubmitButton from "@/components/submit-button";
import { toast } from "sonner";
import { handleVehiclePayment } from "@/app/actions/vehicles";
import { useQueryClient } from "@tanstack/react-query";
import { VEHICLES_QUERY_KEY } from "@/hooks/use-vehicles";
import CurrencyInput from "react-currency-input-field";
import { useTranslations } from "next-intl";
import { Label } from "../ui/label";

export function PaymentDialog({ trigger, data }: VehicleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [showQRCode, setShowQRCode] = useState(false);
  const query = useQueryClient();
  const t = useTranslations("paymentDialog");

  const handleProceedToPayment = () => {
    if (paymentAmount <= 0) {
      toast.error(t("paymentAmountMustBeGreaterThanZero"));
      return;
    }

    if (paymentAmount > debtAmount) {
      toast.error(t("paymentAmountCannotExceedDebt"));
      return;
    }

    setShowQRCode(true);
  };

  const handlePaymentSuccess = async () => {
    if (paymentAmount <= 0) {
      toast.error(t("paymentAmountMustBeGreaterThanZero"));
      return;
    }

    if (paymentAmount > debtAmount) {
      toast.error(t("paymentAmountCannotExceedDebt"));
      return;
    }

    setIsLoading(true);
    try {
      const result = await handleVehiclePayment(data.vehicle.id, paymentAmount);

      if (result?.error) {
        toast.error(t("failedToProcessPayment"));
        return;
      }

      query.invalidateQueries({
        queryKey: [VEHICLES_QUERY_KEY],
      });
      toast.success(t("paymentConfirmedSuccessfully"));
      setOpen(false);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(t("failedToProcessPayment"));
    } finally {
      setIsLoading(false);
    }
  };

  const debtAmount = data.debt;

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
      <DialogContent className="w-80 sm:w-full  sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vehicle Info */}
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <Label className="text-muted-foreground">{t("vehicle")}:</Label>
              <Label className="font-medium">
                {data.vehicle.license_plate}
              </Label>
            </div>
            <div className="flex justify-between items-center text-sm">
              <Label className="text-muted-foreground">{t("customer")}:</Label>
              <Label className="font-medium">{data.customer.name}</Label>
            </div>
            <div className="flex justify-between items-center text-sm">
              <Label className="text-muted-foreground">{t("brand")}:</Label>
              <Label className="font-medium">{data.vehicle.brand}</Label>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border">
            <p className="text-muted-foreground mb-4">{t("paymentAmount")}:</p>
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
                placeholder={t("enterAmount")}
                step={0.01}
              />
              <div className="text-sm text-muted-foreground">
                {t("max")}:{" "}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(debtAmount)}
              </div>
              {paymentAmount > debtAmount && (
                <p className="text-sm text-red-500">
                  {t("paymentCannotExceedDebt")}
                </p>
              )}
              {paymentAmount <= 0 && (
                <p className="text-sm text-red-500">
                  {t("paymentMustBeGreaterThanZero")}
                </p>
              )}
              {!showQRCode && (
                <Button
                  onClick={handleProceedToPayment}
                  disabled={paymentAmount <= 0 || paymentAmount > debtAmount}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  {t("proceedToPayment")}
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
                  description: `Payment for ${data.vehicle.license_plate}`,
                })}
                alt="Payment QR Code"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button variant="outline">{t("cancel")}</Button>
            </DialogClose>
            {showQRCode ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setShowQRCode(false)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {t("backToEdit")}
                </Button>
                <SubmitButton
                  disabled={isLoading}
                  onClick={handlePaymentSuccess}
                  type="button"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {t("confirmPayment")}
                </SubmitButton>
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
