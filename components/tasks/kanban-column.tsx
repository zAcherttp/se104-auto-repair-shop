"use client";

import { useDroppable } from "@dnd-kit/core";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RepairOrderWithVehicleDetails } from "@/types/types";
import { ScrollArea } from "../ui/scroll-area";
import { RepairOrderCard } from "./repair-order-card";

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  children?: React.ReactNode;
  count?: number;
}

interface KanbanColumnContentProps {
  orders: RepairOrderWithVehicleDetails[];
  isLoading?: boolean;
  onOrderClick: (order: RepairOrderWithVehicleDetails) => void;
}

const KanbanColumnComponent = ({
  title,
  id,
  color,
  children,
  count,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });
  return (
    <Card
      ref={setNodeRef}
      data-column-id={id}
      className={`min-h-[500px] space-y-3 rounded-lg p-2 transition-all duration-200 ${
        isOver
          ? "border-2 border-primary border-dashed bg-muted"
          : "border-2 border-transparent"
      }`}
    >
      <CardHeader className="flex-shrink-0 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-semibold text-lg">{title}</CardTitle>
          <Badge variant="secondary" className={`${color} text-white`}>
            {count}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

const KanbanColumnContent = memo(function KanbanColumnContent({
  orders,
  isLoading,
  onOrderClick,
}: KanbanColumnContentProps) {
  return (
    <ScrollArea className="h-full">
      <div>
        {orders.map((order) => (
          <RepairOrderCard
            key={order.id}
            order={order}
            onClick={() => onOrderClick(order)}
          />
        ))}
        {orders.length === 0 && (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            No orders
          </div>
        )}
        {isLoading && (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            Loading...
          </div>
        )}
      </div>
    </ScrollArea>
  );
});

export const KanbanColumn = Object.assign(KanbanColumnComponent, {
  Content: KanbanColumnContent,
});
