"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RepairOrderWithVehicleDetails } from "@/types/types";
import { useRepairOrderDetails } from "@/hooks/use-repair-order-details";
import {
  Calendar,
  Car,
  User,
  DollarSign,
  FileText,
  Wrench,
  Package,
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

interface RepairOrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: RepairOrderWithVehicleDetails | null;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export function RepairOrderDetailsDialog({
  open,
  onOpenChange,
  order,
}: RepairOrderDetailsDialogProps) {
  const {
    data: orderDetails,
    isLoading,
    error,
  } = useRepairOrderDetails(order?.id || null);

  if (!order) return null;

  const statusColor =
    statusColors[order.status as keyof typeof statusColors] ||
    statusColors.pending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-h-[80vh] max-w-[80vw] md:max-h-[80vh] md:max-w-[50vw] lg:max-w-[60vw]">
        <ScrollArea className="max-h-[80vh]">
          <div className="p-6">
            <DialogHeader className="pb-6">
              <DialogTitle className="flex items-center gap-3">
                <span>Repair Order #{order.id.slice(-8)}</span>
                <Badge className={`${statusColor}`}>
                  {order.status.replace("-", " ").toUpperCase()}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-6">
              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Reception Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.reception_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {order.completion_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Completion Date</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(
                              order.completion_date
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {order.total_amount && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Total Amount</p>
                          <p className="text-sm text-muted-foreground">
                            ${order.total_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                    {order.paid_amount && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Paid Amount</p>
                          <p className="text-sm text-muted-foreground">
                            ${order.paid_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Customer & Vehicle Information */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm text-muted-foreground">
                        {order.vehicle?.customer?.name}
                      </p>
                    </div>
                    {order.vehicle?.customer?.email && (
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">
                          {order.vehicle.customer.email}
                        </p>
                      </div>
                    )}
                    {order.vehicle?.customer?.phone && (
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">
                          {order.vehicle.customer.phone}
                        </p>
                      </div>
                    )}
                    {order.vehicle?.customer?.address && (
                      <div>
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">
                          {order.vehicle.customer.address}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Vehicle Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Brand</p>
                      <p className="text-sm text-muted-foreground">
                        {order.vehicle?.brand}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">License Plate</p>
                      <p className="text-sm text-muted-foreground">
                        {order.vehicle?.license_plate}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              {order.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{order.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Repair Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Repair Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : error ? (
                    <p className="text-sm text-muted-foreground">
                      Failed to load repair items
                    </p>
                  ) : orderDetails?.repair_order_items?.length ? (
                    <div className="space-y-4">
                      {orderDetails.repair_order_items.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              {item.spare_part && (
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">
                                      {item.spare_part.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Spare Part • Qty: {item.quantity} • $
                                      {item.spare_part.price.toFixed(2)} each
                                    </p>
                                  </div>
                                </div>
                              )}

                              {item.labor_type && (
                                <div className="flex items-center gap-2">
                                  <Wrench className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">
                                      {item.labor_type.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Labor • ${item.labor_type.cost.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                ${item.total_amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      <Separator />

                      <div className="flex justify-between items-center pt-2">
                        <p className="text-sm font-medium">Total</p>
                        <p className="text-sm font-bold">
                          $
                          {orderDetails.repair_order_items
                            .reduce((sum, item) => sum + item.total_amount, 0)
                            .toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No repair items found
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
