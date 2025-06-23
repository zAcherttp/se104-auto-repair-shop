"use client";

import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { LineItem } from "./columns";
import { Table } from "@tanstack/react-table";

interface TableCellProps {
  getValue: () => unknown;
  row: { index: number; original: LineItem };
  column: { id: string };
  table: Table<LineItem>; // Using Table type for better type safety
}

export function TableCell({ getValue, row, column, table }: TableCellProps) {
  const initialValue = getValue();
  const onEdit = () => {
    table.options.meta?.setEditedRows?.((old: Record<string, boolean>) => ({
      ...old,
      [row.index]: !old[row.index],
    }));
  };

  const formatValue = (value: unknown) => {
    if (typeof value === "number") {
      if (
        column.id === "unitPrice" ||
        column.id === "laborCost" ||
        column.id === "total"
      ) {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value);
      }
      return value.toString();
    }
    return (value as string) || "-";
  };

  return (
    <div className="flex items-center justify-between group">
      <span className={column.id === "total" ? "font-medium" : ""}>
        {formatValue(initialValue)}
      </span>
      {column.id !== "total" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
        >
          <Edit className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
