"use client";

import { columns } from "./columns";
import { InventoryDataTable } from "./data-table";
import { useInventoryWithEndingStock } from "@/hooks/use-inventory-with-ending-stock";

export default function Page() {
  const { data: spareParts, isLoading, error } = useInventoryWithEndingStock();

  if (error) {
    return (
      <div className="w-full p-6">
        <p className="text-red-500">Error: {error.message || String(error)}</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <InventoryDataTable
        columns={columns}
        data={spareParts || []}
        isLoading={isLoading}
        // Removed renderAddButton - parts can only be added through settings page
      />
    </div>
  );
}
