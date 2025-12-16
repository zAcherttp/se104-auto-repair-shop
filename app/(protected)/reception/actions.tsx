"use client";

import { Edit, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { UpdateDialog } from "@/components/dialogs/update-repair-order";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import type { VehicleRegistration } from "./columns";

interface ActionsProps {
  vehicleRegistration: VehicleRegistration;
}

export function Actions({ vehicleRegistration }: ActionsProps) {
  const t = useTranslations("reception");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Label className="sr-only">{t("openMenu")}</Label>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <UpdateDialog
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Edit className="mr-2 h-4 w-4" />
              {t("actions.update")}
            </DropdownMenuItem>
          }
          data={vehicleRegistration}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
