"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EditIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getLaborTypes, deleteLaborType } from "@/app/actions/settings";
import { AddLaborTypeDialog } from "./add-labor-type-dialog";
import { EditLaborTypeDialog } from "./edit-labor-type-dialog";
import type { LaborType } from "@/types/settings";

export default function LaborTypesTab() {
  const t = useTranslations("settings.labor");
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
    if (!confirm(t("confirmDelete"))) {
      return;
    }

    try {
      const response = await deleteLaborType(id);
      if (response.success) {
        toast.success(t("deleteSuccess"));
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
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <div className="flex justify-between mb-2">
            <Label className="self-start pl-2">{t("title")}</Label>
            <Button className="h-8" onClick={() => setAddDialogOpen(true)}>
              {t("addButton")}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    {t("table.name")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    {t("table.cost")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {laborTypes.map((laborType) => (
                  <tr key={laborType.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{laborType.name}</td>
                    <td className="px-4 py-3 text-sm">
                      ${laborType.cost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
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
