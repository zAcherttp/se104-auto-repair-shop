"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EditIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { getSpareParts, deleteSparePart } from "@/app/actions/settings";
import { AddPartDialog } from "./add-part-dialog";
import { EditPartDialog } from "./edit-part-dialog";
import type { SparePart } from "@/types/settings";

export default function PartsTab() {
  const t = useTranslations("settings.parts");
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
                    {t("table.price")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    {t("table.stock")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {parts.map((part) => (
                  <tr key={part.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{part.name}</td>
                    <td className="px-4 py-3 text-sm">
                      ${part.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {part.stock_quantity ?? "N/A"}
                    </td>
                    <td className="px-4 py-3">
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
