"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { LineItem } from "./columns";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
          value: unknown
        ) => void;
      };
    };
  };
  spareParts?: Array<{ id: string; name: string; price: number }>;
  laborTypes?: Array<{ id: string; name: string; cost: number }>;
}

export function EditCell({
  getValue,
  row,
  column,
  table,
  spareParts = [],
  laborTypes = [],
}: EditCellProps) {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Validate field value
  const validateField = (fieldValue: unknown, fieldId: string): string => {
    if (fieldId === "description") {
      return !fieldValue ||
        (typeof fieldValue === "string" && !fieldValue.trim())
        ? "Description is required"
        : "";
    }
    if (fieldId === "sparePart") {
      return !fieldValue ||
        (typeof fieldValue === "string" && !fieldValue.trim())
        ? "Spare part is required"
        : "";
    }
    if (fieldId === "laborType") {
      return !fieldValue ||
        (typeof fieldValue === "string" && !fieldValue.trim())
        ? "Labor type is required"
        : "";
    }
    if (fieldId === "quantity") {
      const num =
        typeof fieldValue === "string"
          ? parseInt(fieldValue)
          : Number(fieldValue);
      return isNaN(num) || num < 1 ? "Quantity must be at least 1" : "";
    }
    return "";
  };

  // Auto-update data as user types (for real-time calculations)
  const handleValueChange = (newValue: unknown) => {
    setValue(newValue);

    // Validate the new value
    const validationError = validateField(newValue, column.id);
    setError(validationError);

    if (table.options.meta?.updateData) {
      table.options.meta.updateData(row.index, column.id, newValue);
    }
  };

  const handleSparePartSelect = (selectedPart: string) => {
    setValue(selectedPart);
    setError(""); // Clear error when a valid selection is made

    const part = spareParts.find((p) => p.name === selectedPart);
    if (part && table.options.meta?.updateData) {
      // Auto-update unit price
      table.options.meta.updateData(row.index, "unitPrice", part.price);
    }
    if (table.options.meta?.updateData) {
      table.options.meta.updateData(row.index, column.id, selectedPart);
    }
    setOpen(false);
  };

  const handleLaborTypeSelect = (selectedLabor: string) => {
    setValue(selectedLabor);
    setError(""); // Clear error when a valid selection is made

    const labor = laborTypes.find((l) => l.name === selectedLabor);
    if (labor && table.options.meta?.updateData) {
      // Auto-update labor cost
      table.options.meta.updateData(row.index, "laborCost", labor.cost);
    }
    if (table.options.meta?.updateData) {
      table.options.meta.updateData(row.index, column.id, selectedLabor);
    }
    setOpen(false);
  };

  // Read-only fields that are auto-calculated
  if (
    column.id === "unitPrice" ||
    column.id === "laborCost" ||
    column.id === "total"
  ) {
    const formatValue = (val: unknown) => {
      if (typeof val === "number") {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(val);
      }
      return "$0.00";
    };

    return (
      <div className="px-3 py-2 text-right font-medium text-muted-foreground">
        {formatValue(value)}
      </div>
    );
  }

  const renderInput = () => {
    if (column.id === "sparePart") {
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={`w-full justify-between ${
                error ? "border-red-500 focus:border-red-500" : ""
              }`}
            >
              {(value as string) || "Select spare part..."}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
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
                      <div className="flex justify-between w-full">
                        <span>{part.name}</span>
                        <span className="text-muted-foreground">
                          ${part.price.toFixed(2)}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );
    }

    if (column.id === "laborType") {
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={`w-full justify-between ${
                error ? "border-red-500 focus:border-red-500" : ""
              }`}
            >
              {(value as string) || "Select labor type..."}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
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
                      <div className="flex justify-between w-full">
                        <span>{labor.name}</span>
                        <span className="text-muted-foreground">
                          ${labor.cost.toFixed(2)}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <Input
        value={value as string}
        onChange={(e) => handleValueChange(e.target.value)}
        type={column.id === "quantity" ? "number" : "text"}
        min={column.id === "quantity" ? "1" : undefined}
        placeholder={
          column.id === "description" ? "Enter description..." : undefined
        }
        className={error ? "border-red-500 focus:border-red-500" : ""}
      />
    );
  };

  return (
    <div className="w-full">
      {renderInput()}
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </div>
  );
}
