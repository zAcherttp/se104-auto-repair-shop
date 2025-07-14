"use client";

import { ColumnDef } from "@tanstack/react-table";
import { VehicleWithDebt } from "@/types/types";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Actions } from "./actions";
import { Label } from "@/components/ui/label";

export function createColumns(
  t: (key: string) => string
): ColumnDef<VehicleWithDebt>[] {
  return [
    {
      accessorKey: "license_plate",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("columns.licensePlate")}
        />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("license_plate")}</div>
      ),
    },
    {
      accessorKey: "customer.name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("columns.customerName")}
        />
      ),
      cell: ({ row }) => {
        const customer = row.original.customer;
        return <div className="font-medium">{customer.name}</div>;
      },
    },
    {
      accessorKey: "customer.phone",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("columns.phoneNumber")}
        />
      ),
      cell: ({ row }) => {
        const customer = row.original.customer;
        return <div>{customer.phone || "N/A"}</div>;
      },
    },
    {
      accessorKey: "customer.address",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("columns.address")} />
      ),
      cell: ({ row }) => {
        const customer = row.original.customer;
        return <div>{customer.address || "N/A"}</div>;
      },
    },
    {
      accessorKey: "brand",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("columns.carBrand")} />
      ),
    },
    {
      accessorKey: "total_repair_cost",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("columns.totalRepairs")}
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const amount = row.getValue("total_repair_cost") as number;
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
    {
      accessorKey: "total_paid",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("columns.totalPaid")}
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const amount = row.getValue("total_paid") as number;
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
    {
      accessorKey: "total_debt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("columns.totalDebt")}
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const debt = row.getValue("total_debt") as number;
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(debt);

        return (
          <div className="text-right text-green-600  font-medium px-2 py-1 rounded">
            {formatted}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <DataTableColumnHeader
            column={column}
            title={t("columns.createdAt")}
          />
        );
      },
      cell: ({ row }) => {
        const createdAt = row.original.created_at;
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
      header: t("actions.title"),
      id: "actions",
      cell: ({ row }) => {
        const vehicle = row.original;
        return <Actions vehicle={vehicle} />;
      },
    },
  ];
}
