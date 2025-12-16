"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/date-range-picker";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useRepairOrders,
  useUpdateRepairOrderStatus,
} from "@/hooks/use-repair-orders";
import type { RepairOrderStatus } from "@/types/types";

export default function Page() {
  // Default to current day
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: today,
    to: new Date(new Date().setHours(23, 59, 59, 999)),
  });
  const [searchFilter, setSearchFilter] = useState("");
  const updateRepairOrderStatus = useUpdateRepairOrderStatus();

  const { data: orders = [], error, isLoading } = useRepairOrders(dateRange);

  // Filter orders based on search input
  const filteredOrders = orders.filter((order) => {
    if (!searchFilter) return true;

    const searchTerm = searchFilter.toLowerCase();
    return (
      order.vehicle.license_plate?.toLowerCase().includes(searchTerm) ||
      order.vehicle.brand?.toLowerCase().includes(searchTerm) ||
      order.vehicle.customer?.name?.toLowerCase().includes(searchTerm) ||
      order.vehicle.customer?.phone?.toLowerCase().includes(searchTerm) ||
      order.notes?.toLowerCase().includes(searchTerm) ||
      order.status?.toLowerCase().includes(searchTerm)
    );
  });

  const handleDateRangeUpdate = ({ range }: { range: DateRange }) => {
    setDateRange(range);
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: RepairOrderStatus,
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
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center space-x-2">
          <div className="relative w-80">
            <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
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
        repairOrders={filteredOrders}
        onStatusChange={handleStatusChange}
        isLoading={isLoading}
      />
    </div>
  );
}
