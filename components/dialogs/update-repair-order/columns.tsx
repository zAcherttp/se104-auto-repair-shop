"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Actions } from "./actions";
import { TableCell } from "./table-cell";
import { EditCell } from "./edit-cell";
import { RowActions } from "./row-actions";

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

export const lineItemColumns: ColumnDef<LineItem>[] = [
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ getValue, row, column, table }) => {
      const isEditing = table.options.meta?.editedRows?.[row.index];
      return isEditing ? (
        <EditCell getValue={getValue} row={row} column={column} table={table} />
      ) : (
        <TableCell
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
        <EditCell
          getValue={getValue}
          row={row}
          column={column}
          table={table}
          spareParts={table.options.meta?.spareParts}
        />
      ) : (
        <TableCell
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
        <EditCell getValue={getValue} row={row} column={column} table={table} />
      ) : (
        <TableCell
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
    header: () => <div className="text-right">Unit Price</div>,
    cell: ({ getValue, row, column, table }) => {
      const isEditing = table.options.meta?.editedRows?.[row.index];
      return isEditing ? (
        <EditCell getValue={getValue} row={row} column={column} table={table} />
      ) : (
        <TableCell
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
        <EditCell
          getValue={getValue}
          row={row}
          column={column}
          table={table}
          laborTypes={table.options.meta?.laborTypes}
        />
      ) : (
        <TableCell
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
    header: () => <div className="text-right">Labor Cost</div>,
    cell: ({ getValue, row, column, table }) => {
      const isEditing = table.options.meta?.editedRows?.[row.index];
      return isEditing ? (
        <EditCell getValue={getValue} row={row} column={column} table={table} />
      ) : (
        <TableCell
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
    header: () => <div className="text-right">Total</div>,
    cell: ({ getValue, row, column, table }) => {
      // Total is always read-only
      return (
        <TableCell
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
        <RowActions row={row} table={table} />
      ) : (
        <Actions
          lineItem={row.original}
          onRemove={() => table.options.meta?.removeRow?.(row.index)}
        />
      );
    },
  },
];
