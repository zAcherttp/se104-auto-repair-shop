"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText } from "lucide-react";
import { PaymentWithDetails } from "@/types";
import { InvoiceDialog } from "./invoice-dialog";
import { useTranslations } from "next-intl";

interface ActionsProps {
  payment: PaymentWithDetails;
}

export function Actions({ payment }: ActionsProps) {
  const t = useTranslations("payments.actions");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <InvoiceDialog
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <FileText className="mr-2 h-4 w-4" />
              {t("viewReceipt")}
            </DropdownMenuItem>
          }
          payment={payment}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
