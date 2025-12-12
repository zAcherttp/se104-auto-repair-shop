"use client";

import { ChevronDown } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { validateMonthlyUsage } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { LineItem } from "./columns";

// Stable constants to prevent recreation
const READONLY_CELL_STYLE =
  "px-3 py-2 text-right font-medium text-muted-foreground min-w-0";
const ERROR_BORDER_CLASS = "border-red-500 focus:border-red-500";
const BUTTON_CLASSES = "w-full justify-between min-w-0";
const ERROR_TEXT_CLASSES = "text-xs text-red-500 mt-1";
const INPUT_CLASSES = "w-full min-w-0";

// Validation messages - stable references
const VALIDATION_MESSAGES = {
  DESCRIPTION_REQUIRED: "Description is required",
  SPARE_PART_REQUIRED: "Spare part is required",
  LABOR_TYPE_REQUIRED: "Labor type is required",
  QUANTITY_MIN: "Quantity must be at least 1",
} as const;

// Readonly field IDs - stable array
const READONLY_FIELDS = ["unitPrice", "laborCost", "total"] as const;

// Currency formatter - stable reference
const formatCurrency = (val: unknown): string => {
  if (typeof val === "number") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  }
  return "$0.00";
};

interface EditCellProps {
  getValue: () => unknown;
  row: { index: number; original: LineItem };
  column: { id: string };
  table: {
    options: {
      meta?: {
        updateData?: (
          rowIndex: number,
          columnId: string,
          value: unknown,
        ) => void;
      };
    };
  };
  spareParts?: Array<{ id: string; name: string; price: number }>;
  laborTypes?: Array<{ id: string; name: string; cost: number }>;
  employees?: Array<{ id: string; full_name: string; role: string }>;
}

export const EditCell = React.memo<EditCellProps>(function EditCell({
  getValue,
  row,
  column,
  table,
  spareParts = [],
  laborTypes = [],
  employees = [],
}) {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Memoized validation function
  const validateField = useCallback(
    (fieldValue: unknown, fieldId: string): string => {
      if (fieldId === "description") {
        return !fieldValue ||
          (typeof fieldValue === "string" && !fieldValue.trim())
          ? VALIDATION_MESSAGES.DESCRIPTION_REQUIRED
          : "";
      }
      if (fieldId === "sparePart") {
        return !fieldValue ||
          (typeof fieldValue === "string" && !fieldValue.trim())
          ? VALIDATION_MESSAGES.SPARE_PART_REQUIRED
          : "";
      }
      if (fieldId === "laborType") {
        return !fieldValue ||
          (typeof fieldValue === "string" && !fieldValue.trim())
          ? VALIDATION_MESSAGES.LABOR_TYPE_REQUIRED
          : "";
      }
      if (fieldId === "quantity") {
        const num =
          typeof fieldValue === "string"
            ? Number.parseInt(fieldValue)
            : Number(fieldValue);
        return isNaN(num) || num < 1 ? VALIDATION_MESSAGES.QUANTITY_MIN : "";
      }
      return "";
    },
    [],
  );

  // Memoized handlers for stable references
  const handleValueChange = useCallback(
    (newValue: unknown) => {
      setValue(newValue);

      // Validate the new value
      const validationError = validateField(newValue, column.id);
      setError(validationError);

      if (table.options.meta?.updateData) {
        table.options.meta.updateData(row.index, column.id, newValue);
      }
    },
    [validateField, column.id, table.options.meta, row.index],
  );

  const handleSparePartSelect = useCallback(
    async (selectedPart: string) => {
      const part = spareParts.find((p) => p.name === selectedPart);
      if (!part) return;

      // Validate monthly usage limits before allowing selection
      const validation = await validateMonthlyUsage(part.id, null);

      if (!validation.success) {
        toast.error("Failed to validate usage limits");
        return;
      }

      if (!validation.data?.canAddPart) {
        toast.error(
          validation.data?.messages?.[0] || "Part usage limit exceeded",
        );
        return;
      }

      setValue(selectedPart);
      setError("");

      if (table.options.meta?.updateData) {
        table.options.meta.updateData(row.index, "unitPrice", part.price);
      }
      if (table.options.meta?.updateData) {
        table.options.meta.updateData(row.index, column.id, selectedPart);
      }
      setOpen(false);
    },
    [spareParts, table.options.meta, row.index, column.id],
  );

  const handleLaborTypeSelect = useCallback(
    async (selectedLabor: string) => {
      const labor = laborTypes.find((l) => l.name === selectedLabor);
      if (!labor) return;

      // Validate monthly usage limits before allowing selection
      const validation = await validateMonthlyUsage(null, labor.id);

      if (!validation.success) {
        toast.error("Failed to validate usage limits");
        return;
      }

      if (!validation.data?.canAddLabor) {
        toast.error(
          validation.data?.messages?.[0] || "Labor type usage limit exceeded",
        );
        return;
      }

      setValue(selectedLabor);
      setError("");

      if (table.options.meta?.updateData) {
        table.options.meta.updateData(row.index, "laborCost", labor.cost);
      }
      if (table.options.meta?.updateData) {
        table.options.meta.updateData(row.index, column.id, selectedLabor);
      }
      setOpen(false);
    },
    [laborTypes, table.options.meta, row.index, column.id],
  );

  const handleEmployeeSelect = useCallback(
    (selectedEmployee: string) => {
      setValue(selectedEmployee);
      setError("");

      if (table.options.meta?.updateData) {
        table.options.meta.updateData(row.index, column.id, selectedEmployee);
      }
      setOpen(false);
    },
    [table.options.meta, row.index, column.id],
  );

  // Memoized check for readonly fields
  const isReadonly = useMemo(
    () =>
      READONLY_FIELDS.includes(column.id as (typeof READONLY_FIELDS)[number]),
    [column.id],
  );

  // Memoized classes
  const buttonClassName = useMemo(
    () => `${BUTTON_CLASSES} ${error ? ERROR_BORDER_CLASS : ""}`,
    [error],
  );

  const inputClassName = useMemo(
    () => `${INPUT_CLASSES} ${error ? ERROR_BORDER_CLASS : ""}`,
    [error],
  );

  // Render readonly fields early return - but keep hooks above
  if (isReadonly) {
    return <div className={READONLY_CELL_STYLE}>{formatCurrency(value)}</div>;
  }

  return (
    <div className="w-full">
      {column.id === "sparePart" ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={buttonClassName}
            >
              <Label className="truncate">
                {(value as string) || "Select spare part..."}
              </Label>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-[90vw] p-0">
            <Command>
              <CommandInput placeholder="Search spare parts..." />
              <CommandList>
                <CommandEmpty>No spare part found.</CommandEmpty>
                <CommandGroup>
                  {spareParts.map((part) => (
                    <CommandItem
                      key={part.id}
                      value={part.name}
                      onSelect={handleSparePartSelect}
                    >
                      <div className="flex w-full justify-between">
                        <Label className="truncate">{part.name}</Label>
                        <Label className="ml-2 flex-shrink-0 text-muted-foreground">
                          ${part.price.toFixed(2)}
                        </Label>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      ) : column.id === "laborType" ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={buttonClassName}
            >
              <Label className="truncate">
                {(value as string) || "Select labor type..."}
              </Label>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-[90vw] p-0">
            <Command>
              <CommandInput placeholder="Search labor types..." />
              <CommandList>
                <CommandEmpty>No labor type found.</CommandEmpty>
                <CommandGroup>
                  {laborTypes.map((labor) => (
                    <CommandItem
                      key={labor.id}
                      value={labor.name}
                      onSelect={handleLaborTypeSelect}
                    >
                      <div className="flex w-full justify-between">
                        <Label className="truncate">{labor.name}</Label>
                        <Label className="ml-2 flex-shrink-0 text-muted-foreground">
                          ${labor.cost.toFixed(2)}
                        </Label>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      ) : column.id === "assignedTo" ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={buttonClassName}
            >
              <Label className="truncate">
                {(value as string) || "Select employee..."}
              </Label>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-[90vw] p-0">
            <Command>
              <CommandInput placeholder="Search employees..." />
              <CommandList>
                <CommandEmpty>No employee found.</CommandEmpty>
                <CommandGroup>
                  {employees.map((employee) => (
                    <CommandItem
                      key={employee.id}
                      value={employee.full_name}
                      onSelect={handleEmployeeSelect}
                    >
                      <div className="flex w-full justify-between">
                        <Label className="truncate">{employee.full_name}</Label>
                        <Label className="ml-2 flex-shrink-0 text-muted-foreground">
                          {employee.role}
                        </Label>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      ) : (
        <Input
          value={value as string}
          onChange={(e) => handleValueChange(e.target.value)}
          type={column.id === "quantity" ? "number" : "text"}
          min={column.id === "quantity" ? "1" : undefined}
          placeholder={
            column.id === "description" ? "Enter description..." : undefined
          }
          className={inputClassName}
        />
      )}
      {error ? <div className={ERROR_TEXT_CLASSES}>{error}</div> : null}
    </div>
  );
});
