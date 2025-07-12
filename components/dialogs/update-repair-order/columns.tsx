"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Actions } from "./actions";
import { TableCell } from "./table-cell";
import { EditCell } from "./edit-cell";
import { RowActions } from "./row-actions";

// Extend the TableMeta interface for our specific needs
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData> {
    editedRows?: Record<number, boolean>;
    setEditedRows?: React.Dispatch<
      React.SetStateAction<Record<number, boolean>>
    >;
    spareParts?: Array<{ id: string; name: string; price: number }>;
    laborTypes?: Array<{ id: string; name: string; cost: number }>;
    employees?: Array<{ id: string; full_name: string; role: string }>;
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
    revertData?: (rowIndex: number) => void;
    removeRow?: (rowIndex: number) => void;
    addRow?: () => { newRow: unknown; newIndex: number } | void;
  }
}

// This type is used to define the shape of our data.
export type LineItem = {
  id?: string;
  description: string;
  sparePart: string;
  quantity: number;
  unitPrice: number;
  laborType: string;
  laborCost: number;
  total: number;
  assignedTo?: string;
};

// Stable header components to prevent recreation
const createStableHeaders = (t: (key: string) => string) => {
  const UnitPriceHeader = React.memo(() => (
    <div className="text-right">{t("columns.unitPrice")}</div>
  ));
  UnitPriceHeader.displayName = "UnitPriceHeader";

  const LaborCostHeader = React.memo(() => (
    <div className="text-right">{t("columns.laborCost")}</div>
  ));
  LaborCostHeader.displayName = "LaborCostHeader";

  const TotalHeader = React.memo(() => (
    <div className="text-right">{t("columns.total")}</div>
  ));
  TotalHeader.displayName = "TotalHeader";

  return { UnitPriceHeader, LaborCostHeader, TotalHeader };
};

// Memoized component wrappers for better performance
const MemoizedEditCell = React.memo(EditCell);
const MemoizedTableCell = React.memo(TableCell);
const MemoizedActions = React.memo(Actions);
const MemoizedRowActions = React.memo(RowActions);

export const createLineItemColumns = (
  t: (key: string) => string
): ColumnDef<LineItem>[] => {
  const { UnitPriceHeader, LaborCostHeader, TotalHeader } =
    createStableHeaders(t);

  return [
    {
      accessorKey: "description",
      header: t("columns.description"),
      cell: ({ getValue, row, column, table }) => {
        const isEditing = table.options.meta?.editedRows?.[row.index];
        return isEditing ? (
          <MemoizedEditCell
            getValue={getValue}
            row={row}
            column={column}
            table={table}
          />
        ) : (
          <MemoizedTableCell
            getValue={getValue}
            row={row}
            column={column}
            table={table}
          />
        );
      },
    },
    {
      accessorKey: "sparePart",
      header: t("columns.sparePart"),
      cell: ({ getValue, row, column, table }) => {
        const isEditing = table.options.meta?.editedRows?.[row.index];
        return isEditing ? (
          <MemoizedEditCell
            getValue={getValue}
            row={row}
            column={column}
            table={table}
            spareParts={table.options.meta?.spareParts}
          />
        ) : (
          <MemoizedTableCell
            getValue={getValue}
            row={row}
            column={column}
            table={table}
          />
        );
      },
    },
    {
      accessorKey: "quantity",
      header: t("columns.quantity"),
      cell: ({ getValue, row, column, table }) => {
        const isEditing = table.options.meta?.editedRows?.[row.index];
        return isEditing ? (
          <MemoizedEditCell
            getValue={getValue}
            row={row}
            column={column}
            table={table}
          />
        ) : (
          <MemoizedTableCell
            getValue={getValue}
            row={row}
            column={column}
            table={table}
          />
        );
      },
    },
    {
      accessorKey: "unitPrice",
      header: UnitPriceHeader,
      cell: ({ getValue, row, column, table }) => {
        const isEditing = table.options.meta?.editedRows?.[row.index];
        return isEditing ? (
          <MemoizedEditCell
            getValue={getValue}
            row={row}
            column={column}
            table={table}
          />
        ) : (
          <MemoizedTableCell
            getValue={getValue}
            row={row}
            column={column}
            table={table}
          />
        );
      },
    },
    {
      accessorKey: "laborType",
      header: t("columns.laborType"),
      cell: ({ getValue, row, column, table }) => {
        const isEditing = table.options.meta?.editedRows?.[row.index];
        return isEditing ? (
          <MemoizedEditCell
            getValue={getValue}
            row={row}
            column={column}
            table={table}
            laborTypes={table.options.meta?.laborTypes}
          />
        ) : (
          <MemoizedTableCell
            getValue={getValue}
            row={row}
            column={column}
            table={table}
          />
        );
      },
    },
    {
      accessorKey: "assignedTo",
      header: t("columns.assignedTo"),
      cell: ({ getValue, row, column, table }) => {
        const isEditing = table.options.meta?.editedRows?.[row.index];
        return isEditing ? (
          <MemoizedEditCell
            getValue={getValue}
            row={row}
            column={column}
            table={table}
            employees={table.options.meta?.employees}
          />
        ) : (
          <MemoizedTableCell
            getValue={getValue}
            row={row}
            column={column}
            table={table}
          />
        );
      },
    },
    {
      accessorKey: "laborCost",
      header: LaborCostHeader,
      cell: ({ getValue, row, column, table }) => {
        const isEditing = table.options.meta?.editedRows?.[row.index];
        return isEditing ? (
          <MemoizedEditCell
            getValue={getValue}
            row={row}
            column={column}
            table={table}
          />
        ) : (
          <MemoizedTableCell
            getValue={getValue}
            row={row}
            column={column}
            table={table}
          />
        );
      },
    },
    {
      accessorKey: "total",
      header: TotalHeader,
      cell: ({ getValue, row, column, table }) => {
        // Total is always read-only
        return (
          <MemoizedTableCell
            getValue={getValue}
            row={row}
            column={column}
            table={table}
          />
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row, table }) => {
        const isEditing = table.options.meta?.editedRows?.[row.index];

        return isEditing ? (
          <MemoizedRowActions row={row} table={table} />
        ) : (
          <MemoizedActions
            lineItem={row.original}
            onRemove={() => table.options.meta?.removeRow?.(row.index)}
          />
        );
      },
    },
  ];
};

// Export the original columns for backward compatibility
export const lineItemColumns = createLineItemColumns((key: string) => {
  // Fallback to English strings if no translation is provided
  const fallbackTranslations: Record<string, string> = {
    "columns.description": "Description",
    "columns.sparePart": "Spare Part",
    "columns.quantity": "Quantity",
    "columns.unitPrice": "Unit Price",
    "columns.laborType": "Labor Type",
    "columns.assignedTo": "Assigned To",
    "columns.laborCost": "Labor Cost",
    "columns.total": "Total",
  };
  return fallbackTranslations[key] || key;
});
