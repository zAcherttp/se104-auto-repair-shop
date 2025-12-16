"use client";

import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import type { SparePart } from "@/types/types";

interface ActionsProps {
  sparePart: SparePart;
}

export function Actions({ sparePart }: ActionsProps) {
  const t = useTranslations("inventory");

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log("Edit spare part:", sparePart.id);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log("Delete spare part:", sparePart.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Label className="sr-only">{t("openMenu")}</Label>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          {t("actions.edit")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-red-600 focus:text-red-600 dark:text-red-400"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t("actions.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
