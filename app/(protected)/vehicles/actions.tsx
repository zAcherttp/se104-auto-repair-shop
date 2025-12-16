"use client";

import { CreditCard, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { PaymentDialog } from "@/components/dialogs/payment-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import type { VehicleWithDebt } from "@/types/types";
import type { VehicleRegistration } from "../reception/columns";

interface ActionsProps {
  vehicle: VehicleWithDebt;
}

export function Actions({ vehicle }: ActionsProps) {
  const t = useTranslations("vehicles");

  // Transform vehicle data to match VehicleRegistration format for PaymentDialog
  const vehicleRegistration: VehicleRegistration = {
    vehicle: {
      id: vehicle.id,
      license_plate: vehicle.license_plate,
      brand: vehicle.brand,
      customer_id: null, // Not needed for payment dialog
      created_at: vehicle.created_at,
      total_paid: vehicle.total_paid,
    },
    customer: {
      ...vehicle.customer,
      address: null,
      created_at: null,
    },
    repair_order: {
      id: "temp",
      vehicle_id: vehicle.id,
      status: "pending",
      reception_date: new Date().toISOString().split("T")[0],
      total_amount: vehicle.total_repair_cost,
      created_at: vehicle.created_at,
      updated_at: vehicle.created_at,
      completion_date: null,
      notes: null,
      created_by: null,
    },
    debt: vehicle.total_debt,
  };

  const hasDebt = vehicle.total_debt > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Label className="sr-only">{t("openMenu")}</Label>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {hasDebt ? (
          <PaymentDialog
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <CreditCard className="mr-2 h-4 w-4" />
                {t("actions.makePayment")}
              </DropdownMenuItem>
            }
            data={vehicleRegistration}
          />
        ) : (
          <DropdownMenuItem disabled className="text-muted-foreground">
            <CreditCard className="mr-2 h-4 w-4" />
            {t("actions.makePayment")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
