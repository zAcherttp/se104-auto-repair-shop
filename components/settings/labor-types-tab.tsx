"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { getLaborTypes, deleteLaborType } from "@/app/actions/settings";
import { AddLaborTypeDialog } from "./add-labor-type-dialog";
import { EditLaborTypeDialog } from "./edit-labor-type-dialog";
import type { LaborType } from "@/types/settings";

export default function LaborTypesTab() {
  const [laborTypes, setLaborTypes] = useState<LaborType[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLaborType, setSelectedLaborType] = useState<LaborType | null>(
    null
  );

  const fetchLaborTypes = useCallback(async () => {
    try {
      const response = await getLaborTypes();
      if (response.success && response.data) {
        setLaborTypes(response.data as LaborType[]);
      }
    } catch (error) {
      console.error("Error fetching labor types:", error);
      toast.error("Failed to load labor types");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLaborTypes();
  }, [fetchLaborTypes]);

  const handleDeleteLaborType = async (id: string) => {
    if (!confirm("Are you sure you want to delete this labor type?")) {
      return;
    }

    try {
      const response = await deleteLaborType(id);
      if (response.success) {
        toast.success("Labor type deleted successfully");
        await fetchLaborTypes();
      } else {
        toast.error(response.error || "Failed to delete labor type");
      }
    } catch (error) {
      console.error("Error deleting labor type:", error);
      toast.error("Failed to delete labor type");
    }
  };

  const handleEditLaborType = (laborType: LaborType) => {
    setSelectedLaborType(laborType);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedLaborType(null);
    fetchLaborTypes();
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
          <h2 className="text-2xl font-bold">Labor Types Management</h2>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Labor Type
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
                    Cost
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {laborTypes.map((laborType) => (
                  <tr key={laborType.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium">{laborType.name}</td>
                    <td className="px-6 py-4 text-sm">
                      ${laborType.cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditLaborType(laborType)}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLaborType(laborType.id)}
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

      <AddLaborTypeDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleDialogClose}
      />

      <EditLaborTypeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        laborType={selectedLaborType}
        onSuccess={handleDialogClose}
      />
    </>
  );
}
