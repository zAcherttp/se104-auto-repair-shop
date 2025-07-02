"use client";

import { useVehicles } from "@/hooks/use-vehicles";
import { columns } from "./columns";
import { VehiclesDataTable } from "./data-table";
import { toast } from "sonner";
import { useEffect } from "react";

export default function VehiclesPage() {
  const { data: vehicles, isLoading, error } = useVehicles();

  useEffect(() => {
    if (error) {
      toast.error("Failed to load vehicles");
    }
  }, [error]);

  return (
    <div className="w-full p-6">
      <VehiclesDataTable
        columns={columns}
        data={vehicles || []}
        isLoading={isLoading}
      />
    </div>
  );
}
