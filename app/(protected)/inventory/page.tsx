"use client";

import { columns } from "./columns";
import { InventoryDataTable } from "./data-table";
import { useInventory } from "@/hooks/use-inventory";
import { AddPartDialog } from "@/components/dialogs/add-part-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Page() {
  const { data: spareParts, isLoading, error, refetch } = useInventory();

  const handleAddSuccess = () => {
    refetch(); // Refresh the inventory list after successful addition
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
      <InventoryDataTable
        columns={columns}
        data={spareParts || []}
        isLoading={isLoading}
        renderAddButton={() => (
          <AddPartDialog
            trigger={
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Part
              </Button>
            }
            onSuccess={handleAddSuccess}
          />
        )}
      />
    </div>
  );
}
