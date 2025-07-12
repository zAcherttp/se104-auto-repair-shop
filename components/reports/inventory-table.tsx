"use client";

import { InventoryReport } from "@/types/reports";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface InventoryTableProps {
  data?: InventoryReport;
}

export function InventoryTable({ data }: InventoryTableProps) {
  const t = useTranslations("reports.inventoryTable");

  if (!data?.inventory?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("noData")}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          <span className="text-lg font-bold">
            Inventory Status Report: {data.month}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-center font-bold border">
                {t("columns.no")}
              </TableHead>
              <TableHead className="text-center font-bold border">
                {t("columns.partName")}
              </TableHead>
              <TableHead className="text-center font-bold border">
                {t("columns.beginningStock")}
              </TableHead>
              <TableHead className="text-center font-bold border">
                {t("columns.usedQuantity")}
              </TableHead>
              <TableHead className="text-center font-bold border">
                {t("columns.endingStock")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.inventory.map((item) => (
              <TableRow key={item.stt} className="border-b hover:bg-muted/50">
                <TableCell className="text-center border font-medium">
                  {item.stt}
                </TableCell>
                <TableCell className="border font-medium">
                  {item.partName}
                </TableCell>
                <TableCell className="text-center border">
                  {item.beginStock.toLocaleString()}
                </TableCell>
                <TableCell className="text-center border">
                  {item.purchased.toLocaleString()}
                </TableCell>
                <TableCell className="text-center border">
                  {item.endStock.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
