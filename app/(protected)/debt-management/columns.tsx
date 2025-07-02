"use client";

import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { VehicleDebt } from "@/types/debt-management";
import { ColumnDef } from "@tanstack/react-table";
import { Actions } from "./actions";

export const columns: ColumnDef<VehicleDebt>[] = [
  {
    accessorKey: "vehicle.license_plate",
    header: "License Plate",
  },
  {
    accessorKey: "vehicle.brand",
    header: "Brand",
  },
  {
    accessorKey: "vehicle.customer.name",
    header: "Customer Name",
  },
  {
    accessorKey: "vehicle.customer.phone",
    header: "Phone",
  },
  {
    header: ({ column }) => {
      return (
        <DataTableColumnHeader
          className="justify-end"
          column={column}
          title="Total Debt"
        />
      );
    },
    accessorKey: "total_debt",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_debt"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return (
        <div className="text-right font-medium text-red-600">{formatted}</div>
      );
    },
  },
  {
    header: ({ column }) => {
      return (
        <DataTableColumnHeader
          className="justify-end"
          column={column}
          title="Total Paid"
        />
      );
    },
    accessorKey: "total_paid",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_paid"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return (
        <div className="text-right font-medium text-green-600">{formatted}</div>
      );
    },
  },
  {
    header: ({ column }) => {
      return (
        <DataTableColumnHeader
          className="justify-end"
          column={column}
          title="Remaining Debt"
        />
      );
    },
    accessorKey: "remaining_debt",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("remaining_debt"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      // Color coding based on debt amount
      const colorClass =
        amount > 0 ? "text-orange-600 font-semibold" : "text-green-600";

      return (
        <div className={`text-right font-medium ${colorClass}`}>
          {formatted}
        </div>
      );
    },
  },
  {
    id: "repair_orders_count",
    header: "Orders",
    cell: ({ row }) => {
      const ordersCount = row.original.repair_orders.length;
      return (
        <Badge variant="outline">
          {ordersCount} order{ordersCount !== 1 ? "s" : ""}
        </Badge>
      );
    },
  },
  {
    id: "last_order_date",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Last Order" />;
    },
    cell: ({ row }) => {
      const lastOrder = row.original.repair_orders[0]; // Assuming sorted by date desc
      if (!lastOrder?.reception_date) return "N/A";

      const date = new Date(lastOrder.reception_date);
      return date.toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const vehicleDebt = row.original;
      return <Actions vehicleDebt={vehicleDebt} />;
    },
  },
];
