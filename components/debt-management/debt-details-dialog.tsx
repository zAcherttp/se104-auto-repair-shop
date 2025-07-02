"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VehicleDebt } from "@/types/debt-management";

interface DebtDetailsDialogProps {
  trigger: React.ReactNode;
  vehicleDebt: VehicleDebt;
}

export function DebtDetailsDialog({
  trigger,
  vehicleDebt,
}: DebtDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Debt Details - {vehicleDebt.vehicle.license_plate}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vehicle and Customer Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Vehicle Information</h4>
              <p>
                <strong>License Plate:</strong>{" "}
                {vehicleDebt.vehicle.license_plate}
              </p>
              <p>
                <strong>Brand:</strong> {vehicleDebt.vehicle.brand}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Customer Information</h4>
              <p>
                <strong>Name:</strong> {vehicleDebt.vehicle.customer.name}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {vehicleDebt.vehicle.customer.phone || "N/A"}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {vehicleDebt.vehicle.customer.email || "N/A"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div>
            <h4 className="font-semibold mb-3">Debt Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Debt</p>
                <p className="text-lg font-semibold text-red-600">
                  ${vehicleDebt.total_debt.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-lg font-semibold text-green-600">
                  ${vehicleDebt.total_paid.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-lg font-semibold text-orange-600">
                  ${vehicleDebt.remaining_debt.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Repair Orders */}
          <div>
            <h4 className="font-semibold mb-3">Repair Orders</h4>
            <div className="space-y-3">
              {vehicleDebt.repair_orders.map((order) => (
                <div key={order.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.reception_date
                          ? new Date(order.reception_date).toLocaleDateString()
                          : "No date"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${order.total_amount.toFixed(2)}
                      </p>
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "default"
                            : order.status === "in-progress"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payments */}
          {vehicleDebt.payments.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3">Payment History</h4>
                <div className="space-y-2">
                  {vehicleDebt.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex justify-between items-center p-2 bg-green-50 rounded"
                    >
                      <div>
                        <p className="font-medium">
                          ${payment.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {payment.payment_method.replace("_", " ")}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
