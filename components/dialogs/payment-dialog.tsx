"use client";

import React, { useState } from "react";
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
import { handleRepairOrderPayment } from "@/app/actions/vehicles";
import { useQueryClient } from "@tanstack/react-query";
import { VEHICLE_REGISTRATION_QUERY_KEY } from "@/hooks/use-vehicle-registration";

export function PaymentDialog({ trigger, data }: VehicleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const query = useQueryClient();

  const handlePaymentSuccess = async () => {
    setIsLoading(true);
    try {
      const result = await handleRepairOrderPayment(
        data.repair_order.id,
        debtAmount
      );

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      query.invalidateQueries({
        queryKey: [VEHICLE_REGISTRATION_QUERY_KEY],
      });
      toast.success("Payment confirmed successfully");
      setOpen(false);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
    } finally {
      setIsLoading(false);
    }
  };

  const debtAmount = data.debt;

  // Don't render if there's no debt
  if (debtAmount <= 0) {
    return null;
  }

  const paymentImgUrl = getPaymentImageURL({
    bankCode: process.env.NEXT_PUBLIC_VIETQR_BANKCODE || "N/A",
    destinationAccount:
      process.env.NEXT_PUBLIC_VIETQR_DESTINATION_ACCOUNT || "N/A",
    amount: debtAmount,
    description: `Payment for ${data.vehicle.license_plate}`,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-80 sm:w-full  sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Payment QR Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vehicle Info */}
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Vehicle:</span>
              <span className="font-medium">{data.vehicle.license_plate}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-medium">{data.customer.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Brand:</span>
              <span className="font-medium">{data.vehicle.brand}</span>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border">
            <p className="text-muted-foreground mb-2">Amount Due:</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(debtAmount)}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center p-4 bg-white rounded-lg border">
            <ZoomableImage src={paymentImgUrl} alt="Payment QR Code" />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <SubmitButton
              disabled={isLoading}
              onClick={handlePaymentSuccess}
              type="button"
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Payment
            </SubmitButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
