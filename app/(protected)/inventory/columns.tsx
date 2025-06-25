"use client";

import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { SparePart } from "@/types/types";
import { ColumnDef } from "@tanstack/react-table";
import { Actions } from "./actions";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<SparePart>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Part Name" />;
    },
  },
  {
    header: ({ column }) => {
      return (
        <DataTableColumnHeader
          className="justify-end"
          column={column}
          title="Price"
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
          title="Stock Quantity"
        />
      );
    },
    accessorKey: "stock_quantity",
    cell: ({ row }) => {
      const quantity = row.getValue("stock_quantity") as number;

      // Color coding based on stock levels
      const getStockBadgeVariant = (qty: number) => {
        if (qty === 0) return "destructive";
        if (qty <= 5) return "outline";
        return "secondary";
      };

      const getStockStatusTextColor = (qty: number) => {
        if (qty === 0) return "text-red-600";
        if (qty <= 5) return "text-yellow-600";
        return "text-green-600";
      };

      const getStockText = (qty: number) => {
        if (qty === 0) return "Out of Stock";
        if (qty <= 5) return "Low Stock";
        return "In Stock";
      };

      return (
        <div className="text-center">
          <Badge
            variant={getStockBadgeVariant(quantity)}
            className={cn(getStockStatusTextColor(quantity), "mb-1")}
          >
            {getStockText(quantity)}
          </Badge>
          <div className="text-sm font-medium">{quantity} units</div>
        </div>
      );
    },
  },
  {
    id: "created_at",
    accessorFn: (row) => row.created_at,
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Created At" />;
    },
    cell: ({ row }) => {
      const createdAt = row.original.created_at;
      if (!createdAt) return "N/A";

      const date = new Date(createdAt);
      return (
        <div className="flex flex-col">
          <span>{date.toLocaleDateString()}</span>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleTimeString()}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const sparePart = row.original;
      return <Actions sparePart={sparePart} />;
    },
  },
];
