"use client";

import { DateRange } from "react-day-picker";
import { columns } from "./columns";
import { PaymentsDataTable } from "./data-table";
import { usePayments } from "@/hooks/use-payments";

export default function Page() {
  // Set default date range to today
  const getDefaultDateRange = (): DateRange => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);
    today.setHours(23, 59, 59, 999);
    return { from: lastWeek, to: today };
  };

  const {
    data: payments,
    isLoading,
    error,
    dateRange,
    updateDateRange,
  } = usePayments({
    initialDateRange: getDefaultDateRange(),
  });

  if (error) {
    return (
      <div className="w-full p-6">
        <p className="text-red-500">An error has occurred</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <PaymentsDataTable
        columns={columns}
        data={payments || []}
        isLoading={isLoading}
        dateRange={dateRange}
        onDateRangeChange={updateDateRange}
      />
    </div>
  );
}
