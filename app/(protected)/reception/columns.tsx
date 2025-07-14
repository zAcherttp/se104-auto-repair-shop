"use client";

import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Customer, RepairOrder, Vehicle } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Actions } from "./actions";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type VehicleRegistration = {
  vehicle: Vehicle;
  customer: Customer;
  repair_order: RepairOrder;
  debt: number;
};

export const createColumns = (
  t: (key: string) => string
): ColumnDef<VehicleRegistration>[] => [
  {
    accessorKey: "vehicle.license_plate",
    header: t("columns.licensePlate"),
  },
  {
    accessorKey: "customer.name",
    header: t("columns.customerName"),
  },
  {
    accessorKey: "customer.phone",
    header: t("columns.phoneNumber"),
  },
  {
    accessorKey: "customer.address",
    header: t("columns.address"),
    cell: ({ row }) => {
      const address = row.original.customer.address;
      return <div>{address || "N/A"}</div>;
    },
  },
  {
    accessorKey: "vehicle.brand",
    header: t("columns.carBrand"),
  },
  {
    header: ({ column }) => {
      return (
        <DataTableColumnHeader
          className="justify-end"
          column={column}
          title={t("columns.total")}
        />
      );
    },
    accessorKey: "repair_order.total_amount",
    cell: ({ row }) => {
      const amount = row.original.repair_order.total_amount || 0;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return (
        <div className="text-right text-green-600  font-medium px-2 py-1 rounded">
          {formatted}
        </div>
      );
    },
  },
  // {
  //   id: "status",
  //   accessorFn: (row) => row.repair_order.status,
  //   header: "Status",
  //   cell: ({ row }) => {
  //     return (
  //       <Badge
  //         variant="outline"
  //         className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
  //       >
  //         {row.original.repair_order.status === "completed" ? (
  //           <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
  //         ) : row.original.repair_order.status === "in-progress" ? (
  //           <CircleDot className="text-yellow-500 dark:text-yellow-400" />
  //         ) : row.original.repair_order.status === "pending" ? (
  //           <Circle className="text-blue-500 dark:text-blue-400" />
  //         ) : (
  //           <CircleX className="text-red-500 dark:text-red-400" />
  //         )}

  //         {row.original.repair_order.status}
  //       </Badge>
  //     );
  //   },
  // },
  {
    id: "reception_date",
    accessorFn: (row) => row.repair_order.reception_date,
    header: ({ column }) => {
      return (
        <DataTableColumnHeader
          column={column}
          title={t("columns.receptionDate")}
        />
      );
    },
    cell: ({ row }) => {
      const receptionDate = row.original.repair_order.reception_date;
      if (!receptionDate) return "N/A";

      const date = new Date(receptionDate);
      return date.toLocaleDateString();
    },
  },
  {
    id: "created_at",
    accessorFn: (row) => row.repair_order.created_at,
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title={t("columns.createdAt")} />
      );
    },
    cell: ({ row }) => {
      const createdAt = row.original.repair_order.created_at;
      if (!createdAt) return "N/A";

      const date = new Date(createdAt);
      return (
        <div className="flex flex-col">
          <Label>{date.toLocaleDateString()}</Label>
          <Label className="text-xs text-muted-foreground">
            {date.toLocaleTimeString()}
          </Label>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const vehicleRegistration = row.original;
      return <Actions vehicleRegistration={vehicleRegistration} />;
    },
  },
];
