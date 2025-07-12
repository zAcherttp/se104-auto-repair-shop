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
                  <span>Amount:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="capitalize">{payment.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{formatDate(payment.payment_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processed:</span>
                  <span>{formatDate(payment.created_at)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Vehicle Information</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>License Plate:</span>
                  <span className="font-medium">
                    {payment.vehicle.license_plate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Brand:</span>
                  <span>{payment.vehicle.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-medium">
                    {payment.vehicle.customer.name}
                  </span>
                </div>
                {payment.vehicle.customer.phone && (
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span>{payment.vehicle.customer.phone}</span>
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
                  <span>Employee:</span>
                  <span>
                    {payment.created_by_profile.full_name || "Unknown"}
                  </span>
                </div>
                {payment.created_by_profile.email && (
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{payment.created_by_profile.email}</span>
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
