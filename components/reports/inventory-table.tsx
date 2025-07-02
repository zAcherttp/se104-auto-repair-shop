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

interface InventoryTableProps {
  data?: InventoryReport;
}

export function InventoryTable({ data }: InventoryTableProps) {
  if (!data?.inventory?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No inventory data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-gray-800 text-white">
          <CardTitle className="text-center">
            <div className="inline-block bg-white text-black px-3 py-1 mr-4 font-bold">
              BM5.2
            </div>
            <span className="text-lg font-bold">Báo Cáo Tồn</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <p>
              <strong>Tháng:</strong> {data.month}
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-800">
                <TableHead className="text-white text-center font-bold border border-gray-400">
                  STT
                </TableHead>
                <TableHead className="text-white text-center font-bold border border-gray-400">
                  Vật Tư Phụ Tùng
                </TableHead>
                <TableHead className="text-white text-center font-bold border border-gray-400">
                  Tồn Đầu
                </TableHead>
                <TableHead className="text-white text-center font-bold border border-gray-400">
                  Phát Sinh
                </TableHead>
                <TableHead className="text-white text-center font-bold border border-gray-400">
                  Tồn Cuối
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.inventory.map((item) => (
                <TableRow key={item.stt} className="border-b">
                  <TableCell className="text-center border border-gray-300">
                    {item.stt}
                  </TableCell>
                  <TableCell className="border border-gray-300">
                    {item.partName}
                  </TableCell>
                  <TableCell className="text-center border border-gray-300">
                    {item.beginStock}
                  </TableCell>
                  <TableCell className="text-center border border-gray-300">
                    {item.purchased}
                  </TableCell>
                  <TableCell className="text-center border border-gray-300">
                    {item.endStock}
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
