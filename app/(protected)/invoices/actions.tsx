"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CreditCard, FileText } from "lucide-react";
import { PaymentWithDetails } from "@/types";
import { PaymentDialog } from "@/components/dialogs/payment-dialog";
import { InvoiceDialog } from "./invoice-dialog";
import { VehicleRegistration } from "../vehicles/columns";

interface ActionsProps {
  payment: PaymentWithDetails;
}

export function Actions({ payment }: ActionsProps) {
  // Transform payment data to match VehicleRegistration format for PaymentDialog
  const vehicleRegistration: VehicleRegistration = {
    vehicle: payment.repair_order.vehicle,
    customer: payment.repair_order.vehicle.customer,
    repair_order: payment.repair_order,
    debt: 0, // Assuming no debt for existing payments, but this could be calculated
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <PaymentDialog
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay
            </DropdownMenuItem>
          }
          data={vehicleRegistration}
        />

        <InvoiceDialog
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <FileText className="mr-2 h-4 w-4" />
              Show Invoice
            </DropdownMenuItem>
          }
          payment={payment}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
