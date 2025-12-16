"use client";

import {
  Calendar,
  Car,
  DollarSign,
  FileText,
  Package,
  User,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepairOrderDetails } from "@/hooks/use-repair-order-details";
import type { RepairOrderWithVehicleDetails } from "@/types/types";
import { Label } from "../ui/label";
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
      <DialogContent className="max-h-[80vh] max-w-[80vw] p-0 md:max-h-[80vh] md:max-w-[50vw] lg:max-w-[60vw]">
        <ScrollArea className="max-h-[80vh]">
          <div className="p-4">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-3">
                <Label>Repair Order #{order.id.slice(-8)}</Label>
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
                        <p className="font-medium text-sm">Reception Date</p>
                        <p className="text-muted-foreground text-sm">
                          {new Date(order.reception_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {order.completion_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">Completion Date</p>
                          <p className="text-muted-foreground text-sm">
                            {new Date(
                              order.completion_date,
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
                          <p className="font-medium text-sm">Total Amount</p>
                          <p className="text-muted-foreground text-sm">
                            ${order.total_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                    {order.vehicle.payments &&
                      order.vehicle.payments.length > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">
                              Vehicle Total Paid
                            </p>
                            <p className="text-muted-foreground text-sm">
                              $
                              {order.vehicle.payments
                                .reduce(
                                  (sum, payment) => sum + payment.amount,
                                  0,
                                )
                                .toFixed(2)}
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
                      <p className="font-medium text-sm">Name</p>
                      <p className="text-muted-foreground text-sm">
                        {order.vehicle?.customer?.name}
                      </p>
                    </div>
                    {order.vehicle?.customer?.email && (
                      <div>
                        <p className="font-medium text-sm">Email</p>
                        <p className="text-muted-foreground text-sm">
                          {order.vehicle.customer.email}
                        </p>
                      </div>
                    )}
                    {order.vehicle?.customer?.phone && (
                      <div>
                        <p className="font-medium text-sm">Phone</p>
                        <p className="text-muted-foreground text-sm">
                          {order.vehicle.customer.phone}
                        </p>
                      </div>
                    )}
                    {order.vehicle?.customer?.address && (
                      <div>
                        <p className="font-medium text-sm">Address</p>
                        <p className="text-muted-foreground text-sm">
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
                      <p className="font-medium text-sm">Brand</p>
                      <p className="text-muted-foreground text-sm">
                        {order.vehicle?.brand}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">License Plate</p>
                      <p className="text-muted-foreground text-sm">
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
                    <p className="text-muted-foreground text-sm">
                      Failed to load repair items
                    </p>
                  ) : orderDetails?.repair_order_items?.length ? (
                    <div className="space-y-4">
                      {orderDetails.repair_order_items.map((item) => (
                        <div key={item.id} className="rounded-lg border p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              {item.spare_part && (
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium text-sm">
                                      {item.spare_part.name}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
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
                                    <p className="font-medium text-sm">
                                      {item.labor_type.name}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                      Labor • ${item.labor_type.cost.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">
                                ${item.total_amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      <Separator />

                      <div className="flex items-center justify-between pt-2">
                        <p className="font-medium text-sm">Total</p>
                        <p className="font-bold text-sm">
                          $
                          {orderDetails.repair_order_items
                            .reduce((sum, item) => sum + item.total_amount, 0)
                            .toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
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
