"use client";

import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { SparePart } from "@/types/types";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// Extended type to include calculated ending stock
export interface SparePartWithEndingStock extends SparePart {
  endingStock?: number;
}

export const createColumns = (
  t: (key: string) => string
): ColumnDef<SparePartWithEndingStock>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title={t("columns.partName")} />
      );
    },
  },
  {
    header: ({ column }) => {
      return (
        <DataTableColumnHeader
          className="justify-end"
          column={column}
          title={t("columns.price")}
        />
      );
    },
    accessorKey: "price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    header: ({ column }) => {
      return (
        <DataTableColumnHeader
          className="justify-center"
          column={column}
          title={t("columns.endingStock")}
        />
      );
    },
    accessorKey: "endingStock",
    cell: ({ row }) => {
      const endingStock = row.getValue("endingStock") as number | undefined;
      const quantity =
        endingStock ?? (row.getValue("stock_quantity") as number) ?? 0;

      const getStockStatusTextColor = (qty: number) => {
        if (qty === 0) return "text-red-600";
        if (qty <= 5) return "text-yellow-600";
        return "text-green-600";
      };

      const getStockText = (qty: number) => {
        if (qty === 0) return t("stockStatus.outOfStock");
        if (qty <= 5) return t("stockStatus.lowStock");
        return t("stockStatus.inStock");
      };

      return (
        <div className="text-center">
          <Badge
            variant="secondary"
            className={cn(getStockStatusTextColor(quantity), "mb-1")}
          >
            {getStockText(quantity)}
          </Badge>
          <div className="text-sm font-medium">
            {quantity} {t("stockStatus.units")}
          </div>
        </div>
      );
    },
  },
  {
    id: "created_at",
    accessorFn: (row) => row.created_at,
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title={t("columns.createdAt")} />
      );
    },
    cell: ({ row }) => {
      const createdAt = row.original.created_at;
      if (!createdAt) return "N/A";

      const date = new Date(createdAt);
      return (
        <div className="flex flex-col">
          <Label>{date.toLocaleDateString()}</Label>
          <Label className="text-xs text-muted-foreground">
            {date.toLocaleTimeString()}
          </Label>
        </div>
      );
    },
  },
];
