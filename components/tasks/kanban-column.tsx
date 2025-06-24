"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RepairOrderWithVehicleDetails } from "@/types/types";
import { RepairOrderCard } from "./repair-order-card";
import { useDroppable } from "@dnd-kit/core";
import { memo } from "react";
import { ScrollArea } from "../ui/scroll-area";

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
      className={`space-y-3 min-h-[500px] p-2 rounded-lg transition-all duration-200 ${
        isOver
          ? "bg-muted border-2 border-dashed border-primary"
          : "border-2 border-transparent"
      }`}
    >
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
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
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No orders
          </div>
        )}
        {isLoading && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
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
