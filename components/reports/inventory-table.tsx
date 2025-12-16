"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InventoryReport } from "@/types/reports";
import { Label } from "../ui/label";

interface InventoryTableProps {
  data?: InventoryReport;
}

export function InventoryTable({ data }: InventoryTableProps) {
  const t = useTranslations("reports.inventoryTable");

  if (!data?.inventory?.length) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t("noData")}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          <Label className="font-bold text-lg">
            Inventory Status Report: {data.month}
          </Label>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="border text-center font-bold">
                {t("columns.no")}
              </TableHead>
              <TableHead className="border text-center font-bold">
                {t("columns.partName")}
              </TableHead>
              <TableHead className="border text-center font-bold">
                {t("columns.beginningStock")}
              </TableHead>
              <TableHead className="border text-center font-bold">
                {t("columns.usedQuantity")}
              </TableHead>
              <TableHead className="border text-center font-bold">
                {t("columns.endingStock")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.inventory.map((item) => (
              <TableRow key={item.stt} className="border-b hover:bg-muted/50">
                <TableCell className="border text-center font-medium">
                  {item.stt}
                </TableCell>
                <TableCell className="border font-medium">
                  {item.partName}
                </TableCell>
                <TableCell className="border text-center">
                  {item.beginStock.toLocaleString()}
                </TableCell>
                <TableCell className="border text-center">
                  {item.purchased.toLocaleString()}
                </TableCell>
                <TableCell className="border text-center">
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
