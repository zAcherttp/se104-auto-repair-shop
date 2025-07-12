"use client";

import { createColumns } from "./columns";
import { InventoryDataTable } from "./data-table";
import { useInventoryWithEndingStock } from "@/hooks/use-inventory-with-ending-stock";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("inventory");
  const { data: spareParts, isLoading, error } = useInventoryWithEndingStock();

  const columns = createColumns(t);

  if (error) {
    return (
      <div className="w-full p-4">
        <p className="text-red-500">
          {t("error")}: {error.message || String(error)}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <InventoryDataTable
        columns={columns}
        data={spareParts || []}
        isLoading={isLoading}
      />
    </div>
  );
}
