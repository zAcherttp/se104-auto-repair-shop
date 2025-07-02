"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CreditCard, Eye } from "lucide-react";
import { VehicleDebt } from "@/types/debt-management";
import { DebtPaymentDialog } from "@/components/debt-management/debt-payment-dialog";
import { DebtDetailsDialog } from "@/components/debt-management/debt-details-dialog";

interface ActionsProps {
  vehicleDebt: VehicleDebt;
}

export function Actions({ vehicleDebt }: ActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DebtDetailsDialog
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          }
          vehicleDebt={vehicleDebt}
        />

        {vehicleDebt.remaining_debt > 0 && (
          <DebtPaymentDialog
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <CreditCard className="mr-2 h-4 w-4" />
                Process Payment
              </DropdownMenuItem>
            }
            vehicleDebt={vehicleDebt}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
