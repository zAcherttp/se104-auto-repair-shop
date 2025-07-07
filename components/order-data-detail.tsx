import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Car, User, Calendar } from "lucide-react";
import {
  OrderDataProps,
  RepairOrderItemWithDetails,
  RepairOrderWithItemsDetails,
} from "@/types";
import ExpenseSummaryCard from "./expense-summary-card";
import { useTranslations } from "next-intl";

type OrderDataDetailsProps = {
  orderData: OrderDataProps;
  onBack: () => void;
  onPaymentSuccess?: () => void;
};

const OrderDetails = ({
  orderData,
  onBack,
  onPaymentSuccess,
}: OrderDataDetailsProps) => {
  const t = useTranslations("auth.trackOrder");
  const { vehicle, customer, RepairOrderWithItemsDetails } = orderData;

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
      <div className="min-h-screen bg-gradient-to-br p-4">
        <div className="container mx-auto max-w-4xl">
          <Button onClick={onBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToSearch")}
          </Button>
          <Card>
            <CardContent className="text-center py-12">
              <Car className="w-16 h-16 mx-auto  mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {t("noOrders.title")}
              </h3>
              <p>{t("noOrders.description")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br p-4">
      <div className="container mx-auto max-w-4xl">
        <Button onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("backToSearch")}
        </Button>

        {/* Vehicle & Customer Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                {t("vehicleInfo.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>{t("vehicleInfo.licensePlate")}:</strong>{" "}
                  {vehicle.license_plate}
                </div>
                <div>
                  <strong>{t("vehicleInfo.brand")}:</strong> {vehicle.brand}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t("customerInfo.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>{t("customerInfo.name")}:</strong> {customer.name}
                </div>
                {customer.phone && (
                  <div>
                    <strong>{t("customerInfo.phone")}:</strong> {customer.phone}
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

        {/* Consolidated Expense Summary */}
        <ExpenseSummaryCard
          orderData={orderData}
          onPaymentSuccess={onPaymentSuccess}
        />

        {/* Repair Orders */}
        {RepairOrderWithItemsDetails.map(
          (order: RepairOrderWithItemsDetails) => (
            <Card key={order.id} className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {t("repairHistory.orderId")} #{order.id.slice(0, 8)}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {t("repairHistory.date")}:
                      {new Date(
                        order.reception_date || ""
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {order && order.repair_order_items.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">
                      {t("repairHistory.serviceLabor")} &{" "}
                      {t("repairHistory.parts")}
                    </h4>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {t("repairHistory.description")}
                            </TableHead>
                            <TableHead>{t("repairHistory.type")}</TableHead>
                            <TableHead className="text-right">
                              {t("repairHistory.amount")}
                            </TableHead>
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
                                      {t("repairHistory.partLabel")}:{" "}
                                      {item.spare_part.name} (
                                      {t("repairHistory.quantity")}:
                                      {item.quantity})
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {item.spare_part
                                    ? t("repairHistory.partsType")
                                    : t("repairHistory.laborType")}
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

                {/* Order Total */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      {t("repairHistory.orderTotal")}:
                    </span>
                    <span className="text-lg font-bold">
                      {formatCurrency(order.total_amount || 0)}
                    </span>
                  </div>
                </div>

                {order.completion_date && (
                  <div className="mt-4 text-sm text-gray-600">
                    <strong>{t("repairHistory.completedOn")}:</strong>
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
