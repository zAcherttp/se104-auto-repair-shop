"use client";

import { SalesReport } from "@/types/reports";
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

interface SalesTableProps {
  data?: SalesReport;
}

export function SalesTable({ data }: SalesTableProps) {
  const t = useTranslations("reports.salesTable");

  if (!data?.orders?.length) {
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
            {t("title")} {data.month}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <p className="text-lg font-semibold">
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
              <TableHead className="text-center font-bold border">
                {t("columns.no")}
              </TableHead>
              <TableHead className="text-center font-bold border">
                {t("columns.vehicleBrand")}
              </TableHead>
              <TableHead className="text-center font-bold border">
                {t("columns.repairCount")}
              </TableHead>
              <TableHead className="text-center font-bold border">
                {t("columns.revenue")}
              </TableHead>
              <TableHead className="text-center font-bold border">
                {t("columns.rate")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.orders.map((item) => (
              <TableRow key={item.stt} className="border-b hover:bg-muted/50">
                <TableCell className="text-center border font-medium">
                  {item.stt}
                </TableCell>
                <TableCell className="border font-medium">
                  {item.vehicleBrand}
                </TableCell>
                <TableCell className="text-center border">
                  {item.repairCount.toLocaleString()}
                </TableCell>
                <TableCell className="text-right border">
                  {item.amount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </TableCell>
                <TableCell className="text-center border">
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
