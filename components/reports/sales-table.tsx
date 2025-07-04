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
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-gray-800 text-white">
          <CardTitle className="text-center">
            <span className="text-lg font-bold">Doanh Số</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-6 space-y-2">
            <p>
              <strong>Tháng:</strong> {data.month}
            </p>
            <p>
              <strong>Tổng doanh thu:</strong>{" "}
              {data.totalRevenue.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-800">
                <TableHead className="text-white text-center font-bold border border-gray-400">
                  STT
                </TableHead>
                <TableHead className="text-white text-center font-bold border border-gray-400">
                  Hiệu Xe
                </TableHead>
                <TableHead className="text-white text-center font-bold border border-gray-400">
                  Số Lượt Sửa
                </TableHead>
                <TableHead className="text-white text-center font-bold border border-gray-400">
                  Thành Tiền
                </TableHead>
                <TableHead className="text-white text-center font-bold border border-gray-400">
                  Tỉ Lệ
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.orders.map((item) => (
                <TableRow key={item.stt} className="border-b">
                  <TableCell className="text-center border border-gray-300">
                    {item.stt}
                  </TableCell>
                  <TableCell className="border border-gray-300">
                    {item.vehicleBrand}
                  </TableCell>
                  <TableCell className="text-center border border-gray-300">
                    {item.repairCount}
                  </TableCell>
                  <TableCell className="text-right border border-gray-300">
                    {item.amount.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </TableCell>
                  <TableCell className="text-center border border-gray-300">
                    {item.rate.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
