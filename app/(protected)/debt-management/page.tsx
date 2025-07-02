"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { columns } from "./columns";
import { DebtManagementDataTable } from "./data-table";
import { useDebtManagement } from "@/hooks/use-debt-management";

export default function DebtManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Set default date range to last 30 days
  const getDefaultDateRange = (): DateRange => {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setDate(today.getDate() - 30);
    lastMonth.setHours(0, 0, 0, 0);
    today.setHours(23, 59, 59, 999);
    return { from: lastMonth, to: today };
  };

  const {
    data: vehicleDebts,
    isLoading,
    error,
    dateRange,
    updateDateRange,
    refetch,
  } = useDebtManagement({
    initialDateRange: getDefaultDateRange(),
    searchTerm,
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handlePaymentSuccess = () => {
    refetch(); // Refresh the debt list after successful payment
  };

  if (error) {
    return (
      <div className="w-full p-6">
        <p className="text-red-500">Error: {error.message || String(error)}</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Debt Management</h1>
        <p className="text-muted-foreground">
          Manage outstanding debts and process payments for all vehicles.
        </p>
      </div>

      <DebtManagementDataTable
        columns={columns}
        data={vehicleDebts || []}
        isLoading={isLoading}
        dateRange={dateRange}
        onDateRangeChange={updateDateRange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
