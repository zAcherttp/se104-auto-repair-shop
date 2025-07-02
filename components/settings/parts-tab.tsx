"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { getSpareParts, deleteSparePart } from "@/app/actions/settings";
import { AddPartDialog } from "./add-part-dialog";
import { EditPartDialog } from "./edit-part-dialog";
import type { SparePart } from "@/types/settings";

export default function PartsTab() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);

  const fetchParts = useCallback(async () => {
    try {
      const response = await getSpareParts();
      if (response.success && response.data) {
        setParts(response.data as SparePart[]);
      }
    } catch (error) {
      console.error("Error fetching spare parts:", error);
      toast.error("Failed to load spare parts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const handleDeletePart = async (id: string) => {
    if (!confirm("Are you sure you want to delete this part?")) {
      return;
    }

    try {
      const response = await deleteSparePart(id);
      if (response.success) {
        toast.success("Part deleted successfully");
        await fetchParts();
      } else {
        toast.error(response.error || "Failed to delete part");
      }
    } catch (error) {
      console.error("Error deleting part:", error);
      toast.error("Failed to delete part");
    }
  };

  const handleEditPart = (part: SparePart) => {
    setSelectedPart(part);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedPart(null);
    fetchParts();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Spare Parts Management</h2>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Part
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {parts.map((part) => (
                  <tr key={part.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium">{part.name}</td>
                    <td className="px-6 py-4 text-sm">
                      ${part.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {part.stock_quantity ?? "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPart(part)}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePart(part.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddPartDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleDialogClose}
      />

      <EditPartDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        part={selectedPart}
        onSuccess={handleDialogClose}
      />
    </>
  );
}
