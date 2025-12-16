"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { toast } from "sonner";
import { handleVehiclePayment } from "@/app/actions/vehicles";
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
import { VEHICLES_QUERY_KEY } from "@/hooks/use-vehicles";
import { getPaymentImageURL } from "@/lib/utils";
import type { VehicleDialogProps } from "@/types/dialog";
import { Label } from "../ui/label";
import ZoomableImage from "../zoomable-image";

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
      <DialogContent className="w-80 sm:w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vehicle Info */}
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
            <div className="flex items-center justify-between text-sm">
              <Label className="text-muted-foreground">{t("vehicle")}:</Label>
              <Label className="font-medium">
                {data.vehicle.license_plate}
              </Label>
            </div>
            <div className="flex items-center justify-between text-sm">
              <Label className="text-muted-foreground">{t("customer")}:</Label>
              <Label className="font-medium">{data.customer.name}</Label>
            </div>
            <div className="flex items-center justify-between text-sm">
              <Label className="text-muted-foreground">{t("brand")}:</Label>
              <Label className="font-medium">{data.vehicle.brand}</Label>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 p-4 text-center dark:from-green-950 dark:to-emerald-950">
            <p className="mb-4 text-muted-foreground">{t("paymentAmount")}:</p>
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
                placeholder={t("enterAmount")}
                step={0.01}
              />
              <div className="text-muted-foreground text-sm">
                {t("max")}:{" "}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(debtAmount)}
              </div>
              {paymentAmount > debtAmount && (
                <p className="text-red-500 text-sm">
                  {t("paymentCannotExceedDebt")}
                </p>
              )}
              {paymentAmount <= 0 && (
                <p className="text-red-500 text-sm">
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
            <div className="flex justify-center rounded-lg border bg-white p-4">
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
