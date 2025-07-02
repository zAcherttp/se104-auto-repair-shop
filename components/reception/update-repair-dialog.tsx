"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  VehicleWithDetails,
  SparePart,
  LaborType,
  RepairOrderItem,
} from "@/types/types";
import { LineItemFormSchema } from "@/lib/form/definitions";
import SubmitButton from "@/components/submit-button";
import { useSparePartsAndLaborTypes } from "@/hooks/use-spare-parts-labor-types";

interface RepairOrderItemWithDetails extends RepairOrderItem {
  spare_part?: SparePart;
  labor_type?: LaborType;
}
import {
  fetchExistingRepairOrderItems,
  updateRepairOrder,
} from "@/app/actions/vehicles";

interface UpdateRepairDialogProps {
  vehicle: VehicleWithDetails | undefined;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface LineItem {
  id: string;
  description: string;
  sparePart: string;
  quantity: number;
  unitPrice: number;
  laborType: string;
  laborCost: number;
  total: number;
}

export function UpdateRepairDialog({
  vehicle,
  open,
  onClose,
  onSuccess,
}: UpdateRepairDialogProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Get the latest repair order for this vehicle
  const latestRepairOrder = vehicle?.repair_orders?.[0];
  // Use TanStack Query hook for spare parts and labor types
  const { data: sparePartsAndLaborData, isLoading: isLoadingData } =
    useSparePartsAndLaborTypes();

  const spareParts = sparePartsAndLaborData?.spareParts || [];
  const laborTypes = sparePartsAndLaborData?.laborTypes || [];
  useEffect(() => {
    const fetchExistingItems = async () => {
      // Only fetch existing items if we have a repair order and the dialog is open
      if (open && latestRepairOrder?.id) {
        try {
          const { items, error: itemsError } =
            await fetchExistingRepairOrderItems(latestRepairOrder.id);

          if (itemsError) {
            toast.error(itemsError);
            return;
          }

          if (items && items.length > 0) {
            const formattedItems: LineItem[] = items.map(
              (item: RepairOrderItemWithDetails) => ({
                id: item.id,
                description: item.description || "",
                sparePart: item.spare_part?.name || "",
                quantity: item.quantity || 1,
                unitPrice: item.unit_price || 0,
                laborType: item.labor_type?.name || "",
                laborCost: item.labor_cost || 0,
                total: item.total_amount || 0,
              })
            );
            setLineItems(formattedItems);
          }
        } catch (error) {
          console.error("Error fetching existing items:", error);
          toast.error("Failed to load existing repair items");
        }
      } else if (open && !latestRepairOrder?.id) {
        // Reset line items if no repair order exists
        setLineItems([]);
      }
    };
    fetchExistingItems();
  }, [open, latestRepairOrder?.id]);

  // Show loading if vehicle is not available
  if (!vehicle && open) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading vehicle data...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!open || !vehicle) return null;

  const addLineItem = () => {
    // Validate the form first
    const newLineItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      sparePart: "",
      quantity: 1,
      unitPrice: 0,
      laborType: "",
      laborCost: 0,
      total: 0,
    };

    // Validate using Zod schema
    const validation = LineItemFormSchema.safeParse({
      description: newLineItem.description,
      sparePart: newLineItem.sparePart,
      quantity: newLineItem.quantity,
      unitPrice: newLineItem.unitPrice,
      laborType: newLineItem.laborType,
      laborCost: newLineItem.laborCost,
    });

    if (!validation.success) {
      // For new items, we'll allow empty values initially
      // Validation will happen on submit
    }

    setLineItems([...lineItems, newLineItem]);
  };

  const removeLineItem = (id: string) => {
    setLineItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (
    id: string,
    field: string,
    value: string | number
  ) => {
    setLineItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          if (field === "sparePart") {
            const part = spareParts.find((p) => p.name === value);
            if (part) {
              updatedItem.unitPrice = part.price || 0;
            }
          }

          if (field === "laborType") {
            const labor = laborTypes.find((l) => l.name === value);
            if (labor) {
              updatedItem.laborCost = labor.cost || 0;
            }
          }

          updatedItem.total =
            updatedItem.quantity * updatedItem.unitPrice +
            updatedItem.laborCost;

          return updatedItem;
        }
        return item;
      })
    );
  };

  const grandTotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!latestRepairOrder?.id) {
      toast.error("No repair order found for this vehicle");
      return;
    }

    // Validate all line items
    const validationErrors: string[] = [];
    lineItems.forEach((item, index) => {
      const validation = LineItemFormSchema.safeParse({
        description: item.description,
        sparePart: item.sparePart,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        laborType: item.laborType,
        laborCost: item.laborCost,
      });

      if (!validation.success) {
        validation.error.issues.forEach((issue) => {
          validationErrors.push(`Item ${index + 1}: ${issue.message}`);
        });
      }
    });

    if (validationErrors.length > 0) {
      toast.error(`Validation errors: ${validationErrors.join(", ")}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = lineItems.map((item) => ({
        description: item.description,
        spare_part_id:
          spareParts.find((p) => p.name === item.sparePart)?.id || null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        labor_type_id:
          laborTypes.find((l) => l.name === item.laborType)?.id || null,
        labor_cost: item.laborCost,
        total_amount: item.total,
      }));

      const { error } = await updateRepairOrder(
        latestRepairOrder.id,
        grandTotal,
        orderItems
      );

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Repair order updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error updating repair order:", error);
      toast.error("Failed to update repair order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-800">
            Modify Repair Order - {vehicle.license_plate}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">License Plate:</span>
                    <div>{vehicle.license_plate}</div>
                  </div>
                  <div>
                    <span className="font-semibold">Brand:</span>
                    <div>{vehicle.brand}</div>
                  </div>
                  <div>
                    <span className="font-semibold">Owner:</span>
                    <div>{vehicle.customer?.name}</div>
                  </div>
                  <div>
                    <span className="font-semibold">Phone:</span>
                    <div>{vehicle.customer?.phone}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Repair Line Items
                  <Button
                    onClick={addLineItem}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isLoadingData}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading repair order data...
                  </div>
                ) : lineItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No repair items added yet. Click &quot;Add Item&quot; to get
                    started.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Spare Part</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Labor Type</TableHead>
                          <TableHead>Labor Cost</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Textarea
                                value={item.description}
                                onChange={(e) =>
                                  updateLineItem(
                                    item.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Describe the work"
                                rows={2}
                                className="min-w-[200px]"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={item.sparePart}
                                onValueChange={(value) =>
                                  updateLineItem(item.id, "sparePart", value)
                                }
                              >
                                <SelectTrigger className="min-w-[150px]">
                                  <SelectValue placeholder="Select part" />
                                </SelectTrigger>
                                <SelectContent>
                                  {spareParts.map((part) => (
                                    <SelectItem key={part.id} value={part.name}>
                                      {part.name} - ${part.price}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateLineItem(
                                    item.id,
                                    "quantity",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                min="0"
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  updateLineItem(
                                    item.id,
                                    "unitPrice",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                step="0.01"
                                min="0"
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={item.laborType}
                                onValueChange={(value) =>
                                  updateLineItem(item.id, "laborType", value)
                                }
                              >
                                <SelectTrigger className="min-w-[150px]">
                                  <SelectValue placeholder="Select labor" />
                                </SelectTrigger>
                                <SelectContent>
                                  {laborTypes.map((labor) => (
                                    <SelectItem
                                      key={labor.id}
                                      value={labor.name}
                                    >
                                      {labor.name} - ${labor.cost}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.laborCost}
                                onChange={(e) =>
                                  updateLineItem(
                                    item.id,
                                    "laborCost",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                step="0.01"
                                min="0"
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-blue-600">
                                ${item.total.toFixed(2)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeLineItem(item.id);
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {lineItems.length > 0 && (
              <Card className="bg-green-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Grand Total:</span>
                    <span className="text-2xl font-bold text-green-700">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <SubmitButton
                disabled={
                  isSubmitting || lineItems.length === 0 || isLoadingData
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update
              </SubmitButton>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
