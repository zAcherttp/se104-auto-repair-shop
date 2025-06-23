"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { columns } from "../vehicles/columns";
import { VehicleDataTable } from "@/app/(protected)/vehicles/data-table";
import { useVehicleRegistration } from "@/hooks/use-vehicle-registration";
import { ReceptionForm } from "@/components/vehicles/reception-form";

export default function Page() {
  const [isReceptionFormOpen, setIsReceptionFormOpen] = useState(false);

  // Set default date range to today
  const getDefaultDateRange = (): DateRange => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return { from: today, to: today };
  };

  const {
    data: vehicleRegistration,
    isLoading,
    error,
    dateRange,
    updateDateRange,
    refetch,
  } = useVehicleRegistration({
    initialDateRange: getDefaultDateRange(),
  });

  const handleReceptionSuccess = () => {
    refetch(); // Refresh the vehicle list after successful form submission
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
      <VehicleDataTable
        columns={columns}
        data={vehicleRegistration}
        isLoading={isLoading}
        dateRange={dateRange}
        onDateRangeChange={updateDateRange}
        onNewReception={() => setIsReceptionFormOpen(true)}
      />
      <ReceptionForm
        open={isReceptionFormOpen}
        onClose={() => setIsReceptionFormOpen(false)}
        onSuccess={handleReceptionSuccess}
      />
    </div>
  );
}
