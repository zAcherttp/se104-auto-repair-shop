"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PaymentWithDetails } from "@/types";
import { ReactNode, useState } from "react";
import { usePaymentReceipt } from "@/hooks/use-payment-receipt";
import LoadingSpinner from "@/components/loading-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Package, Wrench } from "lucide-react";

interface InvoiceDialogProps {
  trigger: ReactNode;
  payment: PaymentWithDetails;
}

export function InvoiceDialog({ trigger, payment }: InvoiceDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    data: receiptData,
    isLoading,
    error,
  } = usePaymentReceipt({
    paymentId: payment.id,
    enabled: open,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="p-6 max-h-[85vh] max-w-[60vw] md:max-h-[85vh] md:max-w-[50vw] lg:max-w-[50vw] overflow-y-scroll overflow-x-auto">
        <DialogHeader>
          <DialogTitle>Payment Receipt</DialogTitle>
          <DialogDescription>
            Receipt for payment #{payment.id.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : null}

        {error ? (
          <div className="text-red-500 text-center py-4">
            Error loading receipt details: {error.message}
          </div>
        ) : null}

        {receiptData ? (
          <div className="space-y-6 p-0">
            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-10 p-4 bg-muted rounded-lg">
              <div>
                <h3 className="font-semibold mb-2">Payment Information</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <Label>Amount:</Label>
                    <Label className="font-medium text-green-600">
                      {formatCurrency(receiptData.amount)}
                    </Label>
                  </div>
                  <div className="flex justify-between">
                    <Label>Method:</Label>
                    <Label className="capitalize">
                      {receiptData.payment_method}
                    </Label>
                  </div>
                  <div className="flex justify-between">
                    <Label>Date:</Label>
                    <Label>{formatDate(receiptData.payment_date)}</Label>
                  </div>
                  <div className="flex justify-between">
                    <Label>Processed:</Label>
                    <Label>{formatDate(receiptData.created_at)}</Label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Vehicle Information</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <Label>License Plate:</Label>
                    <Label className="font-medium">
                      {receiptData.vehicle.license_plate}
                    </Label>
                  </div>
                  <div className="flex justify-between">
                    <Label>Brand:</Label>
                    <Label>{receiptData.vehicle.brand}</Label>
                  </div>
                  <div className="flex justify-between">
                    <Label>Customer:</Label>
                    <Label className="font-medium">
                      {receiptData.vehicle.customer.name}
                    </Label>
                  </div>
                  {receiptData.vehicle.customer.phone && (
                    <div className="flex justify-between">
                      <Label>Phone:</Label>
                      <Label>{receiptData.vehicle.customer.phone}</Label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Repair Orders and Items */}
            {receiptData.repair_orders &&
              receiptData.repair_orders.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">
                    Services & Parts Covered by This Payment
                  </h3>
                  {receiptData.repair_orders.map((order) => (
                    <Card key={order.id} className="mb-4">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Calendar className="w-4 h-4" />
                          Order #{order.id.slice(0, 8)}
                          <span className="text-sm font-normal text-muted-foreground">
                            - {formatDate(order.reception_date)}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {order.repair_order_items &&
                        order.repair_order_items.length > 0 ? (
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/50">
                                  <TableHead className="w-[50px]">
                                    Type
                                  </TableHead>
                                  <TableHead>Description</TableHead>
                                  <TableHead className="w-[80px] text-center">
                                    Qty
                                  </TableHead>
                                  <TableHead className="w-[100px] text-right">
                                    Unit Price
                                  </TableHead>
                                  <TableHead className="w-[100px] text-right">
                                    Total
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {order.repair_order_items.map((item) => (
                                  <TableRow key={item.id} className="text-sm">
                                    <TableCell>
                                      {item.spare_part_id ? (
                                        <div className="flex items-center gap-1">
                                          <Package className="w-3 h-3 text-blue-600" />
                                          <span className="text-xs text-blue-600 font-medium">
                                            Part
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1">
                                          <Wrench className="w-3 h-3 text-orange-600" />
                                          <span className="text-xs text-orange-600 font-medium">
                                            Labor
                                          </span>
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div>
                                        <div className="font-medium">
                                          {item.description}
                                        </div>
                                        {item.spare_part && (
                                          <div className="text-xs text-muted-foreground">
                                            Part: {item.spare_part.name}
                                          </div>
                                        )}
                                        {item.labor_type && (
                                          <div className="text-xs text-muted-foreground">
                                            Service: {item.labor_type.name} ($
                                            {item.labor_type.cost}/hr)
                                          </div>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {item.quantity}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {formatCurrency(item.unit_price)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      {formatCurrency(item.total_amount)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            No items found for this order
                          </div>
                        )}

                        {/* Order Total */}
                        <div className="mt-4 pt-3 border-t flex justify-between items-center">
                          <Label className="font-medium">Order Total:</Label>
                          <Label className="font-bold text-lg">
                            {formatCurrency(order.total_amount || 0)}
                          </Label>
                        </div>

                        {order.completion_date && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Completed on: {formatDate(order.completion_date)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

            {/* Created By */}
            {receiptData.created_by_profile && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Processed By</h3>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <Label>Employee:</Label>
                    <Label>
                      {receiptData.created_by_profile.full_name || "Unknown"}
                    </Label>
                  </div>
                  {receiptData.created_by_profile.email && (
                    <div className="flex justify-between">
                      <Label>Email:</Label>
                      <Label>{receiptData.created_by_profile.email}</Label>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
