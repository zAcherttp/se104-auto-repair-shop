"use client";

import * as React from "react";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";

interface MonthYearPickerProps {
  onUpdate: (values: { range: DateRange }) => void;
  initialMonth?: number;
  initialYear?: number;
  align?: "start" | "center" | "end";
}

const MONTHS = [
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" },
];

const getCurrentYear = () => 2025; // Use stable default to avoid hydration issues
const getCurrentMonth = () => 5; // June (0-indexed) - use stable default

export default function MonthYearPicker({
  onUpdate,
  initialMonth = getCurrentMonth(),
  initialYear = getCurrentYear(),
  align = "start",
}: MonthYearPickerProps) {
  const [selectedMonth, setSelectedMonth] = React.useState(initialMonth);
  const [selectedYear, setSelectedYear] = React.useState(initialYear);
  const onUpdateRef = React.useRef(onUpdate);

  // Keep ref up to date
  React.useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

  // Generate year options (2015 to 2027 - stable range)
  const years = React.useMemo(() => {
    const yearOptions = [];
    for (let year = 2015; year <= 2027; year++) {
      yearOptions.push(year);
    }
    return yearOptions;
  }, []);

  const getDateRange = React.useCallback(
    (month: number, year: number): DateRange => {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0); // Last day of the month

      return {
        from: startDate,
        to: endDate,
      };
    },
    []
  );

  const handleMonthChange = (month: string) => {
    const monthValue = parseInt(month);
    setSelectedMonth(monthValue);

    const range = getDateRange(monthValue, selectedYear);
    onUpdateRef.current({ range });
  };

  const handleYearChange = (year: string) => {
    const yearValue = parseInt(year);
    setSelectedYear(yearValue);

    const range = getDateRange(selectedMonth, yearValue);
    onUpdateRef.current({ range });
  };

  const formatDisplayText = () => {
    const monthName = MONTHS.find((m) => m.value === selectedMonth)?.label;
    return `${monthName} ${selectedYear}`;
  };

  // Initialize with current selection only once
  React.useEffect(() => {
    const range = getDateRange(selectedMonth, selectedYear);
    onUpdateRef.current({ range });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - only run once on mount

  return (
    <div className="flex items-center justify-end gap-2 ml-auto">
      <Button
        variant="outline"
        className="justify-start text-left font-normal w-48"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {formatDisplayText()}
      </Button>

      <Select
        value={selectedMonth.toString()}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align={align}>
          {MONTHS.map((month) => (
            <SelectItem key={month.value} value={month.value.toString()}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align={align}>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
