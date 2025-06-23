"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, User } from "lucide-react";
import { useLineItems } from "@/hooks/use-line-items";
import { ScrollArea } from "../../ui/scroll-area";
import { LineItemDataTable } from "./data-table";
import { lineItemColumns, LineItem } from "./columns";
import { Textarea } from "@/components/ui/textarea";
import { UpdateDialogProps, UpdateData } from "@/types/dialog";
import SubmitButton from "@/components/submit-button";
import { toast } from "sonner";
import { updateRepairOrderSmart } from "@/app/actions/vehicles";
import { useQueryClient } from "@tanstack/react-query";
import { VEHICLE_REGISTRATION_QUERY_KEY } from "@/hooks/use-vehicle-registration";

export function UpdateDialog({ trigger, data, onSuccess }: UpdateDialogProps) {
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
        changes
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
      toast.success("Repair order updated successfully");
      setOpen(false);
    } catch (error) {
      console.error("Error updating repair order:", error);
      toast.error("Failed to update repair order");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="p-0 max-h-[80vh] max-w-[80vw] md:max-h-[80vh] md:max-w-[50vw] lg:max-w-[60vw]">
        <ScrollArea className="max-h-[80vh]">
          <div className="p-6">
            <DialogHeader className="pb-6">
              <DialogTitle>Update Repair Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card className="p-6 gap-0">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="flex items-center gap-1.5 font-medium">
                      <Car className="h-4 w-4" />
                      Vehicle
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">License:</span>
                      <span className="font-medium">
                        {data.vehicle.license_plate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Brand:</span>
                      <span className="font-medium">{data.vehicle.brand}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-6 gap-0">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="flex items-center gap-1.5 font-medium">
                      <User className="h-4 w-4" />
                      Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-1 ">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{data.customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{data.customer.phone}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>{" "}
              <Card>
                <CardContent>
                  {isLoadingItems ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading repair items...</p>
                      </div>
                    </div>
                  ) : (
                    <LineItemDataTable
                      columns={lineItemColumns}
                      data={lineItems}
                      spareParts={spareParts}
                      laborTypes={laborTypes}
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
                  <CardTitle className="font-medium">Notes</CardTitle>{" "}
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes here..."
                    className="w-full h-24 border rounded-md resize-none"
                  />
                </CardContent>{" "}
              </Card>
            </div>

            {/* Total Summary */}
            <div className="flex justify-end">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  Total Amount
                </div>
                <div className="text-lg font-semibold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(getTotalAmount())}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>{" "}
              <SubmitButton
                disabled={isLoading}
                onClick={handleUpdate}
                type="button"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update Repair Order
              </SubmitButton>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
