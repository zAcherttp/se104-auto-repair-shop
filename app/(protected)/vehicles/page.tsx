"use client";

import { useVehicles } from "@/hooks/use-vehicles";
import { createColumns } from "./columns";
import { VehiclesDataTable } from "./data-table";
import { toast } from "sonner";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function VehiclesPage() {
  const { data: vehicles, isLoading, error } = useVehicles();
  const t = useTranslations("vehicles");

  useEffect(() => {
    if (error) {
      toast.error(t("error"));
    }
  }, [error, t]);

  return (
    <div className="w-full p-4">
      <VehiclesDataTable
        columns={createColumns(t)}
        data={vehicles || []}
        isLoading={isLoading}
      />
    </div>
  );
}
