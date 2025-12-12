"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Car, User } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { toast } from "sonner";
import { updateRepairOrderSmart } from "@/app/actions/vehicles";
import SubmitButton from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useEmployees } from "@/hooks/use-employees";
import { useLineItems } from "@/hooks/use-line-items";
import { VEHICLE_REGISTRATION_QUERY_KEY } from "@/hooks/use-vehicle-registration";
import type { UpdateData, UpdateDialogProps } from "@/types/dialog";
import { ScrollArea } from "../../ui/scroll-area";
import { createLineItemColumns, type LineItem } from "./columns";
import { LineItemDataTable } from "./data-table";

export function UpdateDialog({ trigger, data, onSuccess }: UpdateDialogProps) {
  const t = useTranslations("updateRepairOrder");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const query = useQueryClient();

  const {
    lineItems,
    addRow,
    updateData,
    revertData,
    removeRow,
    getTotalAmount,
    loadExistingItems,
    getChangedData,
    spareParts,
    laborTypes,
    isLoadingItems,
  } = useLineItems();

  const { data: employees = [] } = useEmployees() as {
    data: Array<{ id: string; full_name: string; role: string }>;
  };

  // Load existing items when dialog opens
  React.useEffect(() => {
    if (open && data.repair_order?.id) {
      loadExistingItems(data.repair_order.id);
    }
  }, [open, data.repair_order?.id, loadExistingItems]);
  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      // Get the changes to determine what to insert, update, or delete
      const { newItems, updatedItems, deletedItemIds } = getChangedData(); // Transform line items to match server action format
      const formatItem = (item: LineItem) => ({
        description: item.description || "",
        spare_part_id:
          spareParts.find((p) => p.name === item.sparePart)?.id || null,
        quantity: item.quantity || 1,
        unit_price: item.unitPrice || 0,
        labor_type_id:
          laborTypes.find((l) => l.name === item.laborType)?.id || null,
        labor_cost: item.laborCost || 0,
        total_amount: item.total || 0,
        assigned_to:
          employees.find((e) => e.full_name === item.assignedTo)?.id || null,
      });

      const changes = {
        newItems: newItems.map(formatItem),
        updatedItems: updatedItems.map((item) => ({
          id: item.id!,
          ...formatItem(item),
        })),
        deletedItemIds,
      };

      const result = await updateRepairOrderSmart(
        data.repair_order.id,
        getTotalAmount(),
        changes,
      );

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      const updates: UpdateData = {
        status: "updated",
        notes,
        totalAmount: getTotalAmount(),
        paidAmount: 0,
        lineItems,
      };

      onSuccess?.(data, updates);
      query.invalidateQueries({
        queryKey: [VEHICLE_REGISTRATION_QUERY_KEY],
      });
      toast.success(t("updateSuccess"));
      setOpen(false);
    } catch (error) {
      console.error("Error updating repair order:", error);
      toast.error(t("updateError"));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-[90vw] p-0 md:max-h-[85vh] md:max-w-[70vw] lg:max-w-[70vw]">
        <ScrollArea className="max-h-[80vh]">
          <div className="p-4">
            <DialogHeader className="pb-4">
              <DialogTitle>{t("title")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card className="gap-0 p-4">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="flex items-center gap-1.5 font-medium">
                      <Car className="h-4 w-4" />
                      {t("vehicle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 p-0">
                    <div className="flex justify-between">
                      <Label className="text-muted-foreground">
                        {t("license")}
                      </Label>
                      <Label className="font-medium">
                        {data.vehicle.license_plate}
                      </Label>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-muted-foreground">
                        {t("brand")}
                      </Label>
                      <Label className="font-medium">
                        {data.vehicle.brand}
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <Card className="gap-0 p-4">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="flex items-center gap-1.5 font-medium">
                      <User className="h-4 w-4" />
                      {t("customer")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 p-0">
                    <div className="flex justify-between">
                      <Label className="text-muted-foreground">
                        {t("name")}
                      </Label>
                      <Label className="font-medium">
                        {data.customer.name}
                      </Label>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-muted-foreground">
                        {t("phone")}
                      </Label>
                      <Label className="font-medium">
                        {data.customer.phone}
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent>
                  {isLoadingItems ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-blue-600 border-b-2" />
                        <p className="text-gray-500">
                          {t("loadingRepairItems")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <LineItemDataTable
                      columns={createLineItemColumns(t)}
                      data={lineItems}
                      spareParts={spareParts}
                      laborTypes={laborTypes}
                      employees={employees}
                      onUpdateData={updateData}
                      onRevertData={revertData}
                      onRemoveRow={removeRow}
                      onAddRow={addRow}
                    />
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="font-medium">{t("notes")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("notesPlaceholder")}
                    className="h-24 w-full resize-none rounded-md border"
                  />
                  <Separator />
                  {/* Total Summary */}
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{t("totalAmount")}</p>
                    <p className="font-bold text-xl">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(getTotalAmount())}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <DialogClose asChild>
                <Button variant="outline">{t("cancel")}</Button>
              </DialogClose>
              <SubmitButton
                disabled={isLoading}
                onClick={handleUpdate}
                type="button"
                className="w-45 bg-blue-600 hover:bg-blue-700"
              >
                {t("updateButton")}
              </SubmitButton>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
