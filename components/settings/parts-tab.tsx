"use client";

import { EditIcon, TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteSparePart, getSpareParts } from "@/app/actions/settings";
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
import type { SparePart } from "@/types/settings";
import { AddPartDialog } from "./add-part-dialog";
import { EditPartDialog } from "./edit-part-dialog";

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
                <TableHead>{t("table.price")}</TableHead>
                <TableHead>{t("table.stock")}</TableHead>
                <TableHead>{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell className="font-medium">{part.name}</TableCell>
                  <TableCell>${part.price.toFixed(2)}</TableCell>
                  <TableCell>{part.stock_quantity ?? "N/A"}</TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
