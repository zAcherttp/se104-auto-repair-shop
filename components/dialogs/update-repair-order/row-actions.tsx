"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { LineItem } from "./columns";
import { LineItemFormSchema } from "@/lib/form/definitions";
import { z } from "zod";
import { useState } from "react";
import { Table } from "@tanstack/react-table";

interface RowActionsProps {
  row: { index: number; original: LineItem };
  table: Table<LineItem>; // Using Table type for better type safety
}

export function RowActions({ row, table }: RowActionsProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateRow = (lineItem: LineItem): string[] => {
    const validationErrors: string[] = [];

    // Check required fields
    if (!lineItem.description?.trim()) {
      validationErrors.push("Description is required");
    }
    if (!lineItem.sparePart?.trim()) {
      validationErrors.push("Spare part is required");
    }
    if (!lineItem.quantity || lineItem.quantity < 1) {
      validationErrors.push("Quantity must be at least 1");
    }
    if (!lineItem.laborType?.trim()) {
      validationErrors.push("Labor type is required");
    }

    // Validate using Zod schema
    try {
      LineItemFormSchema.parse(lineItem);
    } catch (err) {
      if (err instanceof z.ZodError) {
        validationErrors.push(...err.errors.map((e) => e.message));
      }
    }

    return validationErrors;
  };

  const onSave = () => {
    const validationErrors = validateRow(row.original);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    // Exit edit mode
    if (table.options.meta?.setEditedRows) {
      table.options.meta.setEditedRows((old: Record<string, boolean>) => ({
        ...old,
        [row.index]: false,
      }));
    }
  };

  const onCancel = () => {
    setErrors([]);

    // Check if this is a new empty row
    const isNewEmptyRow =
      !row.original.description &&
      !row.original.sparePart &&
      row.original.quantity === 1 &&
      row.original.unitPrice === 0 &&
      !row.original.laborType &&
      row.original.laborCost === 0;

    if (isNewEmptyRow) {
      // Remove the row if it's empty
      if (table.options.meta?.removeRow) {
        table.options.meta.removeRow(row.index);
      }
    } else {
      // Revert data
      if (table.options.meta?.revertData) {
        table.options.meta.revertData(row.index);
      }
    }

    // Exit edit mode
    if (table.options.meta?.setEditedRows) {
      table.options.meta.setEditedRows((old: Record<string, boolean>) => ({
        ...old,
        [row.index]: false,
      }));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={onSave}>
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
      {errors.length > 0 && (
        <div className="text-xs text-red-500 max-w-[200px]">
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}
    </div>
  );
}
