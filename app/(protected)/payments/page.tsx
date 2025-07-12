"use client";

import { DateRange } from "react-day-picker";
import { createColumns } from "./columns";
import { PaymentsDataTable } from "./data-table";
import { usePayments } from "@/hooks/use-payments";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("payments");

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
      <div className="w-full p-4">
        <p className="text-red-500">{t("error")}</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <PaymentsDataTable
        columns={createColumns(t)}
        data={payments || []}
        isLoading={isLoading}
        dateRange={dateRange}
        onDateRangeChange={updateDateRange}
      />
    </div>
  );
}
