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
import type { SalesReport } from "@/types/reports";
import { Label } from "../ui/label";

interface SalesTableProps {
  data?: SalesReport;
}

export function SalesTable({ data }: SalesTableProps) {
  const t = useTranslations("reports.salesTable");

  if (!data?.orders?.length) {
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
            {t("title")} {data.month}
          </Label>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-center">
          <p className="font-semibold text-lg">
            <strong>{t("totalRevenue")}</strong>{" "}
            {data.totalRevenue.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="border text-center font-bold">
                {t("columns.no")}
              </TableHead>
              <TableHead className="border text-center font-bold">
                {t("columns.vehicleBrand")}
              </TableHead>
              <TableHead className="border text-center font-bold">
                {t("columns.repairCount")}
              </TableHead>
              <TableHead className="border text-center font-bold">
                {t("columns.revenue")}
              </TableHead>
              <TableHead className="border text-center font-bold">
                {t("columns.rate")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.orders.map((item) => (
              <TableRow key={item.stt} className="border-b hover:bg-muted/50">
                <TableCell className="border text-center font-medium">
                  {item.stt}
                </TableCell>
                <TableCell className="border font-medium">
                  {item.vehicleBrand}
                </TableCell>
                <TableCell className="border text-center">
                  {item.repairCount.toLocaleString()}
                </TableCell>
                <TableCell className="border text-right">
                  {item.amount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </TableCell>
                <TableCell className="border text-center">
                  {item.rate.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
