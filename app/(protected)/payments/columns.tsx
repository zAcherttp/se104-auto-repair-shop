"use client";

import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { PaymentWithDetails } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft } from "lucide-react";
import { Actions } from "./actions";

export const columns: ColumnDef<PaymentWithDetails>[] = [
  {
    accessorKey: "vehicle.license_plate",
    header: "License Plate",
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
          title="Amount"
        />
      );
    },
    accessorKey: "amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return (
        <div className="text-right font-medium flex items-center justify-end gap-2">
          <ArrowLeft className="h-4 w-4 text-green-600" />
          <span className="text-green-600">{formatted}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "payment_method",
    header: "Payment Method",
    cell: ({ row }) => {
      const method = row.getValue("payment_method") as string;
      return (
        <Badge variant="outline" className="capitalize">
          {method}
        </Badge>
      );
    },
  },
  {
    id: "payment_date",
    accessorFn: (row) => row.payment_date,
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Payment Date" />;
    },
    cell: ({ row }) => {
      const paymentDate = row.original.payment_date;
      if (!paymentDate) return "N/A";

      const date = new Date(paymentDate);
      return date.toLocaleDateString();
    },
  },
  {
    id: "created_at",
    accessorFn: (row) => row.created_at,
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Created At" />;
    },
    cell: ({ row }) => {
      const createdAt = row.original.created_at;
      if (!createdAt) return "N/A";

      const date = new Date(createdAt);
      return (
        <div className="flex flex-col">
          <span>{date.toLocaleDateString()}</span>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleTimeString()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "created_by_profile.full_name",
    header: "Created By",
    cell: ({ row }) => {
      const fullName = row.original.created_by_profile?.full_name;
      const email = row.original.created_by_profile?.email;

      if (!fullName && !email) return "N/A";

      return (
        <div className="flex flex-col">
          <span>{fullName || "Unknown"}</span>
          {email && (
            <span className="text-xs text-muted-foreground">{email}</span>
          )}
        </div>
      );
    },
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;
      return <Actions payment={payment} />;
    },
  },
];
