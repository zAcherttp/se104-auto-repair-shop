"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  FileText,
  DollarSign,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ReceptionForm } from "./reception-form";
import {
  handleRepairOrderPayment,
  removeVehicle,
} from "@/app/actions/vehicles";
import {
  RepairOrderWithVehicleDetails,
  VehicleWithDetails,
} from "@/types/types";
import { useVehicles } from "@/hooks/use-vehicles";
import DateRangePicker from "@/components/date-range-picker";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import PaymentDialog from "../payment-dialog";

export function VehiclesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showReceptionForm, setShowReceptionForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedRepairOrder, setSelectedRepairOrder] = useState<
    RepairOrderWithVehicleDetails | undefined
  >(undefined);

  // Date range state - default to today
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: today,
    to: today,
  });
  // Format dates for API
  const dateFrom = dateRange.from
    ? format(dateRange.from, "yyyy-MM-dd")
    : format(today, "yyyy-MM-dd");
  const dateTo = dateRange.to
    ? format(dateRange.to, "yyyy-MM-dd")
    : format(today, "yyyy-MM-dd");

  //console.log("Current date range:", { dateFrom, dateTo, dateRange });

  // Use TanStack Query for data fetching
  const {
    data: vehicles = [],
    isLoading,
    error,
    refetch,
  } = useVehicles(dateFrom, dateTo);
  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getDebtColor = (debt: number) => {
    if (debt === 0) return "text-green-600 dark:text-green-400";
    if (debt < 1000) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };
  const handleDateRangeUpdate = ({ range }: { range: DateRange }) => {
    console.log("Date range updated:", range);
    setDateRange(range);
  };

  const handleReceptionSuccess = () => {
    setShowReceptionForm(false);
    refetch(); // Refetch data instead of page reload
    toast.success("Vehicle reception created successfully!");
  };
  const handleCreateRepair = (vehicle: VehicleWithDetails) => {
    console.log("Creating repair for vehicle:", vehicle);
    toast.info("Repair creation feature coming soon!");
  };

  const handleProcessPayment = (repairOrder: RepairOrderWithVehicleDetails) => {
    setSelectedRepairOrder(repairOrder);
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentDialog(false);

    try {
      if (!selectedRepairOrder) {
        toast.error("No repair order selected for payment");
        return;
      }

      const { error } = await handleRepairOrderPayment(
        selectedRepairOrder.id,
        selectedRepairOrder.total_amount || 0
      );

      if (error) {
        toast.error(error);
        return;
      }
    } catch (error) {
      console.error("Error updating repair order:", error);
      toast.error("Failed to update repair order status");
    }

    refetch();
    toast.success("Payment confirmed!");
  };

  const handleRemoveVehicle = async (vehicleId: string) => {
    setLoading(true);
    try {
      const result = await removeVehicle(vehicleId);

      if (result.error) {
        toast.error(result.error);
      } else {
        // Refetch data to update the list
        await refetch();
        toast.success("Vehicle removed successfully");
      }
    } catch (error) {
      console.error("Error removing vehicle:", error);
      toast.error("Failed to remove vehicle");
    } finally {
      setLoading(false);
    }
  };
  // Handle loading state - render skeleton table rows
  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
        </TableCell>
        <TableCell className="text-right">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16 ml-auto"></div>
        </TableCell>
        <TableCell>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-18"></div>
        </TableCell>
        <TableCell className="text-right">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-8 ml-auto"></div>
        </TableCell>
      </TableRow>
    ));
  };

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="bg-destructive/10 text-destructive text-sm p-3 px-5 rounded-md flex gap-3 items-center">
              Error loading vehicles: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Vehicle Reception & Registry
            <div className="flex items-center gap-4">
              <DateRangePicker
                initialDateFrom={dateRange.from}
                initialDateTo={dateRange.to}
                onUpdate={handleDateRangeUpdate}
                align="end"
              />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by license plate, customer, or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button
                onClick={() => setShowReceptionForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Reception
              </Button>
            </div>
          </CardTitle>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing vehicles with repair orders from {dateFrom} to {dateTo}.
            Total vehicles: {filteredVehicles.length}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Debt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Service</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? renderSkeletonRows()
                  : filteredVehicles
                      .filter((vehicle) => {
                        return (
                          vehicle.repair_orders &&
                          vehicle.repair_orders.length > 0
                        );
                      })
                      .map((vehicle) => {
                        // Calculate total debt from all unpaid repair orders in the date range
                        const totalDebt =
                          vehicle.repair_orders?.reduce((acc, order) => {
                            const orderDebt =
                              (order.total_amount || 0) -
                              (order.paid_amount || 0);
                            return acc + orderDebt;
                          }, 0) || 0;

                        const latestOrder = vehicle.repair_orders?.[0];
                        const repairOrderWithVehicle: RepairOrderWithVehicleDetails =
                          {
                            ...latestOrder,
                            vehicle: {
                              id: vehicle.id,
                              license_plate: vehicle.license_plate,
                              brand: vehicle.brand,
                              created_at: vehicle.created_at,
                              customer_id: vehicle.customer_id,
                            },
                          };
                        return (
                          <TableRow
                            key={vehicle.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => {
                              if (latestOrder) {
                                setSelectedRepairOrder(repairOrderWithVehicle);
                              }
                            }}
                          >
                            <TableCell className="font-mono font-semibold">
                              {vehicle.license_plate}
                            </TableCell>
                            <TableCell>{vehicle.brand}</TableCell>
                            <TableCell className="font-medium">
                              {vehicle.customer?.name}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              {vehicle.customer?.phone}
                            </TableCell>
                            <TableCell
                              className={`text-right font-semibold ${getDebtColor(
                                totalDebt
                              )}`}
                            >
                              ${totalDebt.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusColor(latestOrder.status)}
                              >
                                {latestOrder.status.replace("-", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              {latestOrder?.reception_date || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={loading}
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {" "}
                                    <DropdownMenuItem
                                      onClick={() => {
                                        // Prevent execution if disabled
                                        if (loading || totalDebt > 0) return;
                                        handleRemoveVehicle(vehicle.id);
                                      }}
                                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                                      disabled={loading || totalDebt > 0}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Remove
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        // Prevent execution if disabled
                                        if (loading) return;
                                        handleCreateRepair(vehicle);
                                      }}
                                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                      disabled={loading}
                                    >
                                      <FileText className="w-4 h-4 mr-2" />
                                      Modify order
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        // Prevent execution if disabled
                                        if (totalDebt <= 0 || loading) return;

                                        const repairOrderWithVehicle: RepairOrderWithVehicleDetails =
                                          {
                                            ...latestOrder,
                                            vehicle: {
                                              id: vehicle.id,
                                              license_plate:
                                                vehicle.license_plate,
                                              brand: vehicle.brand,
                                              created_at: vehicle.created_at,
                                              customer_id: vehicle.customer_id,
                                            },
                                          };
                                        handleProcessPayment(
                                          repairOrderWithVehicle
                                        );
                                      }}
                                      className="text-green-600 hover:text-green-700 dark:text-green-400"
                                      disabled={totalDebt <= 0 || loading}
                                    >
                                      <DollarSign className="w-4 h-4 mr-2" />
                                      Process Payment
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
              </TableBody>
            </Table>
          </div>
          {!isLoading && filteredVehicles.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {vehicles.length === 0
                ? `No vehicles found with repair orders between ${dateFrom} and ${dateTo}.`
                : "No vehicles found matching your search criteria."}
            </div>
          )}
        </CardContent>
      </Card>

      <ReceptionForm
        open={showReceptionForm}
        onClose={() => setShowReceptionForm(false)}
        onSuccess={handleReceptionSuccess}
      />
      <PaymentDialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        onSuccess={handlePaymentSuccess}
        selectedRepairOrderWithVehicleDetail={selectedRepairOrder}
      />
    </div>
  );
}
