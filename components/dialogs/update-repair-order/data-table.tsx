"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Plus,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  spareParts?: Array<{ id: string; name: string; price: number }>;
  laborTypes?: Array<{ id: string; name: string; cost: number }>;
  employees?: Array<{ id: string; full_name: string; role: string }>;
  onUpdateData?: (rowIndex: number, columnId: string, value: unknown) => void;
  onRevertData?: (rowIndex: number) => void;
  onRemoveRow?: (rowIndex: number) => void;
  onAddRow?: () => { newRow: unknown; newIndex: number } | void;
}

// Memoized data table component to prevent unnecessary re-renders
export const LineItemDataTable = React.memo(function LineItemDataTable<
  TData,
  TValue
>({
  columns,
  data,
  spareParts = [],
  laborTypes = [],
  employees = [],
  onUpdateData,
  onRevertData,
  onRemoveRow,
  onAddRow,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations("updateRepairOrder");
  const [editedRows, setEditedRows] = useState<Record<string, boolean>>({});

  const handleAddRow = useCallback(() => {
    if (onAddRow) {
      const result = onAddRow();
      // If the addRow function returns a newIndex, automatically enter edit mode
      if (result && typeof result === "object" && "newIndex" in result) {
        setEditedRows((prev) => ({
          ...prev,
          [result.newIndex as number]: true,
        }));
      }
    }
  }, [onAddRow]);

  const tableMeta = useMemo(
    () => ({
      editedRows,
      setEditedRows,
      spareParts,
      laborTypes,
      employees,
      updateData: onUpdateData,
      revertData: onRevertData,
      removeRow: onRemoveRow,
      addRow: onAddRow,
    }),
    [
      editedRows,
      spareParts,
      laborTypes,
      employees,
      onUpdateData,
      onRevertData,
      onRemoveRow,
      onAddRow,
    ]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: tableMeta,
  });

  return (
    <>
      <div className="font-medium pb-4 flex justify-between items-center w-full">
        <Label>{t("repairLineItems")}</Label>
        <Button size="sm" onClick={handleAddRow}>
          <Plus className="h-4 w-4 mr-2" />
          {t("addItem")}
        </Button>
      </div>
      <div className="rounded-md border w-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t("noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">{t("rowsPerPage")}</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            {t("page")} {table.getState().pagination.pageIndex + 1} {t("of")}{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <Label className="sr-only">{t("goToFirstPage")}</Label>
              <ChevronsLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <Label className="sr-only">{t("goToPreviousPage")}</Label>
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <Label className="sr-only">{t("goToNextPage")}</Label>
              <ChevronRightIcon />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <Label className="sr-only">{t("goToLastPage")}</Label>
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}) as <TData, TValue>(
  props: DataTableProps<TData, TValue>
) => React.JSX.Element;
