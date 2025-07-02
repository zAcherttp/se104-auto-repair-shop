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
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
    removeRow?: (rowIndex: number) => void;
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
};

// Stable header components to prevent recreation
const UnitPriceHeader = () => <div className="text-right">Unit Price</div>;
const LaborCostHeader = () => <div className="text-right">Labor Cost</div>;
const TotalHeader = () => <div className="text-right">Total</div>;

// Memoized component wrappers for better performance
const MemoizedEditCell = React.memo(EditCell);
const MemoizedTableCell = React.memo(TableCell);
const MemoizedActions = React.memo(Actions);
const MemoizedRowActions = React.memo(RowActions);

export const lineItemColumns: ColumnDef<LineItem>[] = [
  {
    accessorKey: "description",
    header: "Description",
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
    header: "Spare Part",
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
    header: "Quantity",
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
    header: "Labor Type",
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
