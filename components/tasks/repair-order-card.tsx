"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RepairOrderWithVehicleDetails } from "@/types/types";
import { Calendar, Car, User, DollarSign } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";

interface RepairOrderCardProps {
  order: RepairOrderWithVehicleDetails;
  onClick: (order: RepairOrderWithVehicleDetails) => void;
  className?: string;
  disabled?: boolean;
}

const RepairOrderCardContent = memo(
  function RepairOrderCardContent({
    order,
  }: Omit<RepairOrderCardProps, "onClick" | "className">) {
    const statusColor = useMemo(
      () =>
        ({
          pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
          "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
          completed: "bg-green-100 text-green-800 border-green-200",
          cancelled: "bg-red-100 text-red-800 border-red-200",
        }[order.status]),
      [order.status]
    );

    return (
      <>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Order #{order.id.slice(-8).toUpperCase()}
            </CardTitle>
            <Badge className={`text-xs ${statusColor}`}>
              {order.status.replace("-", " ").toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <Label className="truncate">
                {order.vehicle?.customer?.name}
              </Label>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Car className="h-3 w-3" />
              <Label className="truncate">
                {order.vehicle?.brand} ({order.vehicle?.license_plate})
              </Label>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <Label>
                {new Date(order.reception_date).toLocaleDateString()}
              </Label>
            </div>

            {order.total_amount && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <Label>${order.total_amount.toFixed(2)}</Label>
              </div>
            )}

            {order.notes && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {order.notes}
              </p>
            )}
          </div>
        </CardContent>
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.order.id === nextProps.order.id &&
      prevProps.disabled === nextProps.disabled
    );
  }
);

export function RepairOrderCard({
  order,
  className,
  disabled = false,
  onClick,
}: RepairOrderCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: order.id,
    disabled: disabled,
  });

  const style = { transform: CSS.Translate.toString(transform) };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (disabled) return;
    onClick(order);
  };

  return (
    <Card
      ref={setNodeRef}
      data-order-id={order.id}
      {...attributes}
      {...listeners}
      style={style}
      onClick={handleCardClick}
      className={cn(className, "select-none")}
    >
      <RepairOrderCardContent order={order} disabled={disabled} />
    </Card>
  );
}
