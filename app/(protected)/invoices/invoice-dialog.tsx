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
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice</DialogTitle>
          <DialogDescription>
            Invoice for payment #{payment.id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-medium text-muted-foreground">
              Invoice Generation
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Invoice functionality will be implemented soon.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
