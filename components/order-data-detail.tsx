import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Car, User, Calendar } from "lucide-react";
import {
  OrderDataProps,
  RepairOrderItemWithDetails,
  RepairOrderWithItemsDetails,
} from "@/types";

type OrderDataDetailsProps = {
  orderData: OrderDataProps;
  onBack: () => void;
};

const OrderDetails = ({ orderData, onBack }: OrderDataDetailsProps) => {
  const { vehicle, customer, RepairOrderWithItemsDetails } = orderData;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (
    !RepairOrderWithItemsDetails ||
    RepairOrderWithItemsDetails.length === 0
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="container mx-auto max-w-4xl">
          <Button onClick={onBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
          <Card>
            <CardContent className="text-center py-12">
              <Car className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No Repair Orders Found
              </h3>
              <p className="text-gray-600">
                This vehicle has no repair orders in our system.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <Button onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>

        {/* Vehicle & Customer Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>License Plate:</strong> {vehicle.license_plate}
                </div>
                <div>
                  <strong>Brand:</strong> {vehicle.brand}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>Name:</strong> {customer.name}
                </div>
                {customer.phone && (
                  <div>
                    <strong>Phone:</strong> {customer.phone}
                  </div>
                )}
                {customer.email && (
                  <div>
                    <strong>Email:</strong> {customer.email}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Repair Orders */}
        {RepairOrderWithItemsDetails.map(
          (order: RepairOrderWithItemsDetails) => (
            <Card key={order.id} className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Repair Order #{order.id.slice(0, 8)}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Reception Date:
                      {new Date(
                        order.reception_date || ""
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace("-", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {order && order.repair_order_items.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Services & Parts</h4>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.repair_order_items.map(
                            (item: RepairOrderItemWithDetails) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  {item.description}
                                  {item.spare_part_id && (
                                    <div className="text-sm text-gray-600">
                                      Part: {item.spare_part.name} (Qty:
                                      {item.quantity})
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {item.spare_part ? "Parts" : "Labor"}
                                  {item.labor_type && (
                                    <div className="text-sm text-gray-600">
                                      {item.labor_type.name}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(item.total_amount)}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <Separator className="my-6" />

                {/* Payment Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(order.total_amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Paid Amount:</span>
                    <span className="text-green-600 font-semibold">
                      {formatCurrency(order.paid_amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Outstanding Balance:</span>
                    <span
                      className={`font-semibold ${
                        (order.total_amount || 0) - (order.paid_amount || 0) > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(
                        (order.total_amount || 0) - (order.paid_amount || 0)
                      )}
                    </span>
                  </div>
                </div>

                {order.completion_date && (
                  <div className="mt-4 text-sm text-gray-600">
                    <strong>Completed on:</strong>
                    {new Date(order.completion_date).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
