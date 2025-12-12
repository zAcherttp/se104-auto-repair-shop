"use client";

import { EditIcon, TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteLaborType, getLaborTypes } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LaborType } from "@/types/settings";
import { AddLaborTypeDialog } from "./add-labor-type-dialog";
import { EditLaborTypeDialog } from "./edit-labor-type-dialog";

export default function LaborTypesTab() {
  const t = useTranslations("settings.labor");
  const [laborTypes, setLaborTypes] = useState<LaborType[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLaborType, setSelectedLaborType] = useState<LaborType | null>(
    null,
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
            <div className="h-6 w-6 animate-spin rounded-full border-primary border-b-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <div className="mb-2 flex justify-between">
            <Label className="self-start pl-2">{t("title")}</Label>
            <Button className="h-8" onClick={() => setAddDialogOpen(true)}>
              {t("addButton")}
            </Button>
          </div>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>{t("table.name")}</TableHead>
                <TableHead>{t("table.cost")}</TableHead>
                <TableHead>{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laborTypes.map((laborType) => (
                <TableRow key={laborType.id}>
                  <TableCell className="font-medium">
                    {laborType.name}
                  </TableCell>
                  <TableCell>${laborType.cost.toFixed(2)}</TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
