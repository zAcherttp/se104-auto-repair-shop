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

interface SalesTableProps {
  data?: SalesReport;
}

export function SalesTable({ data }: SalesTableProps) {
  if (!data?.orders?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No sales data available for this period
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          <span className="text-lg font-bold">Sales Report: {data.month}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <p className="text-lg font-semibold">
            <strong>Total Revenue:</strong>{" "}
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
                No.
              </TableHead>
              <TableHead className="text-center font-bold border">
                Car Brand
              </TableHead>
              <TableHead className="text-center font-bold border">
                Repair Count
              </TableHead>
              <TableHead className="text-center font-bold border">
                Amount
              </TableHead>
              <TableHead className="text-center font-bold border">
                Rate (%)
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
