"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Preset {
  name: string;
  label: string;
}

const PRESETS: Preset[] = [
  { name: "today", label: "Today" },
  { name: "yesterday", label: "Yesterday" },
  { name: "last7", label: "Last 7 days" },
  { name: "last14", label: "Last 14 days" },
  { name: "last30", label: "Last 30 days" },
  { name: "thisWeek", label: "This Week" },
  { name: "lastWeek", label: "Last Week" },
  { name: "thisMonth", label: "This Month" },
  { name: "lastMonth", label: "Last Month" },
];

interface DateRangePickerProps {
  /** Click handler for applying the updates from DateRangePicker. */
  onUpdate?: (values: { range: DateRange }) => void;
  /** Initial value for start date */
  initialDateFrom?: Date | string;
  /** Initial value for end date */
  initialDateTo?: Date | string;
  /** Alignment of popover */
  align?: "start" | "center" | "end";
  /** Option for locale */
  locale?: string;
  /** Disable future dates */
  disableFuture?: boolean;
}

const formatDate = (date: Date, locale = "en-us"): string => {
  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getDateAdjustedForTimezone = (dateInput: Date | string): Date => {
  if (typeof dateInput === "string") {
    const parts = dateInput.split("-").map((part) => Number.parseInt(part, 10));
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date;
  }
  return dateInput;
};

// Helper function to normalize date range with proper times
const normalizeDateRange = (range: { from?: Date; to?: Date }): DateRange => {
  const normalizedRange: { from?: Date; to?: Date } = {};

  if (range.from) {
    const fromDate = new Date(range.from);
    fromDate.setHours(0, 0, 0, 0);
    normalizedRange.from = fromDate;
  }

  if (range.to) {
    const toDate = new Date(range.to);
    toDate.setHours(23, 59, 59, 999);
    normalizedRange.to = toDate;
  } else if (range.from) {
    // If no 'to' date, use 'from' date with end of day time
    const toDate = new Date(range.from);
    toDate.setHours(23, 59, 59, 999);
    normalizedRange.to = toDate;
  }

  return normalizedRange as DateRange;
};

export default function DateRangePicker({
  initialDateFrom = new Date(new Date().setHours(0, 0, 0, 0)),
  initialDateTo,
  onUpdate,
  align = "end",
  locale = "en-US",
  disableFuture = true,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Helper to get normalized initial dates
  const getInitialRange = () => {
    const fromDate = getDateAdjustedForTimezone(initialDateFrom);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = initialDateTo
      ? getDateAdjustedForTimezone(initialDateTo)
      : new Date(fromDate);
    toDate.setHours(23, 59, 59, 999);

    return { from: fromDate, to: toDate };
  };

  const initialRange = getInitialRange();

  // Committed range - only updated when user clicks Update button
  const [committedRange, setCommittedRange] =
    React.useState<DateRange>(initialRange);

  // Working range - changes as user selects dates in the picker
  const [range, setRange] = React.useState<DateRange>(initialRange);

  // Refs to store the values of range when the date picker is opened
  const openedRangeRef = React.useRef<DateRange | undefined>(undefined);

  const [selectedPreset, setSelectedPreset] = React.useState<
    string | undefined
  >(undefined);

  const [isSmallScreen, setIsSmallScreen] = React.useState(
    typeof window !== "undefined" ? window.innerWidth < 960 : false,
  );

  React.useEffect(() => {
    const handleResize = (): void => {
      setIsSmallScreen(window.innerWidth < 960);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getPresetRange = (presetName: string): DateRange => {
    const preset = PRESETS.find(({ name }) => name === presetName);
    if (!preset) throw new Error(`Unknown date range preset: ${presetName}`);
    const from = new Date();
    const to = new Date();
    const first = from.getDate() - from.getDay();

    switch (preset.name) {
      case "today":
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "yesterday":
        from.setDate(from.getDate() - 1);
        from.setHours(0, 0, 0, 0);
        to.setDate(to.getDate() - 1);
        to.setHours(23, 59, 59, 999);
        break;
      case "last7":
        from.setDate(from.getDate() - 6);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "last14":
        from.setDate(from.getDate() - 13);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "last30":
        from.setDate(from.getDate() - 29);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "thisWeek":
        from.setDate(first);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "lastWeek":
        from.setDate(from.getDate() - 7 - from.getDay());
        to.setDate(to.getDate() - to.getDay() - 1);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "thisMonth":
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "lastMonth":
        from.setMonth(from.getMonth() - 1);
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        to.setDate(0);
        to.setHours(23, 59, 59, 999);
        break;
    }

    return { from, to };
  };

  const setPreset = (preset: string): void => {
    const presetRange = getPresetRange(preset);
    const normalizedRange = normalizeDateRange(presetRange);
    setRange(normalizedRange);
  };

  const checkPreset = React.useCallback((): void => {
    for (const preset of PRESETS) {
      const presetRange = getPresetRange(preset.name);

      if (!range.from || !presetRange.from) continue;

      const normalizedRangeFrom = new Date(range.from);
      normalizedRangeFrom.setHours(0, 0, 0, 0);
      const normalizedPresetFrom = new Date(presetRange.from);
      normalizedPresetFrom.setHours(0, 0, 0, 0);

      const normalizedRangeTo = new Date(range.to ?? range.from);
      normalizedRangeTo.setHours(0, 0, 0, 0);
      const normalizedPresetTo = new Date(presetRange.to ?? presetRange.from);
      normalizedPresetTo.setHours(0, 0, 0, 0);

      if (
        normalizedRangeFrom.getTime() === normalizedPresetFrom.getTime() &&
        normalizedRangeTo.getTime() === normalizedPresetTo.getTime()
      ) {
        setSelectedPreset(preset.name);
        return;
      }
    }

    setSelectedPreset(undefined);
  }, [range]);

  const resetValues = (): void => {
    const initialFrom = getDateAdjustedForTimezone(initialDateFrom);
    initialFrom.setHours(0, 0, 0, 0);

    const initialTo = initialDateTo
      ? getDateAdjustedForTimezone(initialDateTo)
      : new Date(initialFrom);
    initialTo.setHours(23, 59, 59, 999);

    const resetRange = { from: initialFrom, to: initialTo };
    setRange(resetRange);
    setCommittedRange(resetRange);
  };

  React.useEffect(() => {
    checkPreset();
  }, [checkPreset]);

  // Helper function to check if two date ranges are equal
  const areRangesEqual = (a?: DateRange, b?: DateRange): boolean => {
    // If either is undefined/null, they're only equal if both are
    if (!a || !b) return a === b;

    // If either doesn't have a 'from' date, they're not equal
    if (!a.from || !b.from) return false;

    // Compare 'from' dates
    if (a.from.getTime() !== b.from.getTime()) return false;

    // Compare 'to' dates - both must be null/undefined or both must have equal times
    if (!a.to && !b.to) return true; // Both are open-ended ranges
    if (!a.to || !b.to) return false; // One is open-ended, other isn't

    return a.to.getTime() === b.to.getTime();
  };

  React.useEffect(() => {
    if (isOpen) {
      openedRangeRef.current = range;
    }
  }, [isOpen, range]);

  return (
    <Popover
      modal={true}
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
          // Reset working range to committed range when closing without update
          setRange(committedRange);
        }
        setIsOpen(open);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline">
          <div className="text-right">
            <div>
              <div>{`${
                committedRange.from
                  ? formatDate(committedRange.from, locale)
                  : ""
              }${
                committedRange.to != null
                  ? " - " + formatDate(committedRange.to, locale)
                  : ""
              }`}</div>
            </div>
          </div>
          <div className="-mr-2 scale-125 pr-1 pl-1 opacity-60">
            {isOpen ? <ChevronUp width={24} /> : <ChevronDown width={24} />}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto">
        <div className="flex flex-col">
          <div className="flex justify-center">
            <Calendar
              mode="range"
              onSelect={(value: { from?: Date; to?: Date } | undefined) => {
                if (value?.from != null) {
                  const normalizedRange = normalizeDateRange(value);
                  setRange(normalizedRange);
                }
              }}
              selected={range}
              numberOfMonths={isSmallScreen ? 1 : 2}
              defaultMonth={
                new Date(
                  new Date().setMonth(
                    new Date().getMonth() - (isSmallScreen ? 0 : 1),
                  ),
                )
              }
              disabled={disableFuture ? { after: new Date() } : undefined}
            />
          </div>
          <div
            className={`flex px-2 py-2 ${
              isSmallScreen ? "flex-col gap-2" : "items-center justify-between"
            } `}
          >
            <Select
              value={selectedPreset}
              onValueChange={(value) => {
                setPreset(value);
              }}
            >
              <SelectTrigger
                className={`${isSmallScreen ? "w-full" : "w-[180px]"}`}
              >
                <SelectValue placeholder="Select preset..." />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map((preset) => (
                  <SelectItem key={preset.name} value={preset.name}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className={`flex gap-2 ${isSmallScreen ? "mt-2" : ""}`}>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  resetValues();
                }}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  const normalizedRange = normalizeDateRange(range);
                  setCommittedRange(normalizedRange);
                  if (!areRangesEqual(committedRange, openedRangeRef.current)) {
                    onUpdate?.({ range: normalizedRange });
                  }
                }}
                className={isSmallScreen ? "ml-auto" : ""}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
