"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Label } from "@/components/ui/label";
import type { VehicleWithDebt } from "@/types/types";
import { Actions } from "./actions";

export function createColumns(
  t: (key: string) => string,
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
          <div className="rounded px-2 py-1 text-right font-medium text-green-600">
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
          <div className="rounded px-2 py-1 text-right font-medium text-green-600">
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
          <div className="rounded px-2 py-1 text-right font-medium text-green-600">
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
            <Label className="text-muted-foreground text-xs">
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
