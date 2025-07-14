"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PaymentWithDetails } from "@/types";
import { ReactNode } from "react";

interface InvoiceDialogProps {
  trigger: ReactNode;
  payment: PaymentWithDetails;
}

export function InvoiceDialog({ trigger, payment }: InvoiceDialogProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Receipt</DialogTitle>
          <DialogDescription>
            Receipt for payment #{payment.id.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-0">
          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-10 p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-semibold mb-2">Payment Information</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <Label>Amount:</Label>
                  <Label className="font-medium text-green-600">
                    {formatCurrency(payment.amount)}
                  </Label>
                </div>
                <div className="flex justify-between">
                  <Label>Method:</Label>
                  <Label className="capitalize">{payment.payment_method}</Label>
                </div>
                <div className="flex justify-between">
                  <Label>Date:</Label>
                  <Label>{formatDate(payment.payment_date)}</Label>
                </div>
                <div className="flex justify-between">
                  <Label>Processed:</Label>
                  <Label>{formatDate(payment.created_at)}</Label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Vehicle Information</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <Label>License Plate:</Label>
                  <Label className="font-medium">
                    {payment.vehicle.license_plate}
                  </Label>
                </div>
                <div className="flex justify-between">
                  <Label>Brand:</Label>
                  <Label>{payment.vehicle.brand}</Label>
                </div>
                <div className="flex justify-between">
                  <Label>Customer:</Label>
                  <Label className="font-medium">
                    {payment.vehicle.customer.name}
                  </Label>
                </div>
                {payment.vehicle.customer.phone && (
                  <div className="flex justify-between">
                    <Label>Phone:</Label>
                    <Label>{payment.vehicle.customer.phone}</Label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Created By */}
          {payment.created_by_profile && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Processed By</h3>
              <div className="text-sm">
                <div className="flex justify-between">
                  <Label>Employee:</Label>
                  <Label>
                    {payment.created_by_profile.full_name || "Unknown"}
                  </Label>
                </div>
                {payment.created_by_profile.email && (
                  <div className="flex justify-between">
                    <Label>Email:</Label>
                    <Label>{payment.created_by_profile.email}</Label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
