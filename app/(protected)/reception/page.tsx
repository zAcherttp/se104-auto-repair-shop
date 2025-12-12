"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { VehicleDataTable } from "@/app/(protected)/reception/data-table";
import { ReceptionForm } from "@/components/reception/reception-form";
import { useVehicleRegistration } from "@/hooks/use-vehicle-registration";
import { createColumns } from "./columns";

export default function Page() {
  const t = useTranslations("reception");
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

  const columns = createColumns(t);

  //console.log("Vehicle Registration Data:", vehicleRegistration);

  if (error) {
    return (
      <div className="w-full p-4">
        <p className="text-red-500">
          {t("error")}: {error.message || String(error)}
        </p>
      </div>
    );
  }
  return (
    <div className="w-full p-4">
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
