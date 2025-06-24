"use client";

import DateRangePicker from "@/components/date-range-picker";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { CardTitle } from "@/components/ui/card";
import {
  useRepairOrders,
  useUpdateRepairOrderStatus,
} from "@/hooks/use-repair-orders";
import { useState } from "react";
import { DateRange } from "react-day-picker";

import { RepairOrderStatus } from "@/types/types";

export default function Page() {
  // Default to current day
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: today,
    to: new Date(new Date().setHours(23, 59, 59, 999)),
  });
  const updateRepairOrderStatus = useUpdateRepairOrderStatus();

  const { data: orders = [], error, isLoading } = useRepairOrders(dateRange);

  const handleDateRangeUpdate = ({ range }: { range: DateRange }) => {
    setDateRange(range);
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: RepairOrderStatus
  ) => {
    // Find the current order to get its original status
    const orderToUpdate = orders.find((order) => order.id === orderId);
    if (!orderToUpdate || orderToUpdate.status === newStatus) return;

    updateRepairOrderStatus.mutate({ orderId, status: newStatus });
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <CardTitle>Error loading repair orders: {error.message}</CardTitle>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between pb-6">
        <div className="leading-none font-semibold pl-2">Repair Orders</div>
        <div className="flex items-center gap-4">
          <DateRangePicker
            onUpdate={handleDateRangeUpdate}
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            align="end"
          />
        </div>
      </div>
      <KanbanBoard
        repairOrders={orders}
        onStatusChange={handleStatusChange}
        isLoading={isLoading}
      />
    </div>
  );
}
