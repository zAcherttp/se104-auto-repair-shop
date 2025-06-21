"use client";

import { VehiclesList } from "@/components/vehicles/vehicles-list";

export default function VehiclesPage() {
  return (
    <div className="flex-1 w-full flex flex-col p-6">
      <VehiclesList />
    </div>
  );
}
