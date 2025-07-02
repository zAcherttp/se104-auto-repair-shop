"use client";

import React from "react";
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

export const TableCell = React.memo<TableCellProps>(function TableCell({
  getValue,
  row,
  column,
  table,
}) {
  const initialValue = getValue();

  const onEdit = React.useCallback(() => {
    table.options.meta?.setEditedRows?.((old: Record<string, boolean>) => ({
      ...old,
      [row.index]: !old[row.index],
    }));
  }, [table.options.meta, row.index]);

  const formatValue = React.useCallback(
    (value: unknown) => {
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
    },
    [column.id]
  );

  const isTotal = column.id === "total";
  const formattedValue = formatValue(initialValue);

  return (
    <div className="flex items-center justify-between group">
      <span className={isTotal ? "font-medium" : ""}>{formattedValue}</span>
      {!isTotal && (
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
});
