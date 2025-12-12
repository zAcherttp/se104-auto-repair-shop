"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
} from "@dnd-kit/core";
import { Loader2 } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  RepairOrderStatus,
  RepairOrderWithVehicleDetails,
} from "@/types/types";
import { RepairOrderDetailsDialog } from "../dialogs";
import { KanbanColumn } from "./kanban-column";
import { RepairOrderCard } from "./repair-order-card";

interface KanbanBoardProps {
  repairOrders: RepairOrderWithVehicleDetails[];
  onStatusChange?: (orderId: string, newStatus: RepairOrderStatus) => void;
  className?: string;
  isLoading?: boolean;
}

interface ColumnConfig {
  id: string;
  title: string;
  color: string;
}

export const KanbanBoard = memo(function KanbanBoard({
  repairOrders,
  onStatusChange,
  className,
  isLoading,
}: KanbanBoardProps) {
  const [selectedOrder, setSelectedOrder] =
    useState<RepairOrderWithVehicleDetails | null>(null);
  const [activeOrder, setActiveOrder] =
    useState<RepairOrderWithVehicleDetails | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const [clientOrders, setClientOrders] = useState<
    RepairOrderWithVehicleDetails[]
  >([]);

  useEffect(() => {
    // Ensure clientOrders is always up-to-date with repairOrders
    setClientOrders(repairOrders);
  }, [repairOrders]);

  const targetColumnIndexRef = useRef<number | null>(null);
  const kanbanColumnConfig = useMemo<ColumnConfig[]>(
    () => [
      {
        title: "Pending",
        id: "pending",
        color: "bg-yellow-500",
      },
      {
        title: "In Progress",
        id: "in-progress",
        color: "bg-blue-500",
      },
      {
        title: "Completed",
        id: "completed",
        color: "bg-green-500",
      },
    ],
    [],
  );

  const repairOrderStatuses = useMemo<RepairOrderStatus[]>(() => {
    return ["pending", "in-progress", "completed", "cancelled"] as const;
  }, []);

  // Pre-compute order distribution for each column
  const columnOrders = useMemo(() => {
    return kanbanColumnConfig.reduce<
      Record<string, RepairOrderWithVehicleDetails[]>
    >(
      (acc, column) => {
        acc[column.id] = clientOrders.filter(
          (order) => order.status === column.id,
        );
        return acc;
      },
      {} as Record<string, RepairOrderWithVehicleDetails[]>,
    );
  }, [clientOrders, kanbanColumnConfig]);

  // Handle drag start
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const draggedOrder = clientOrders.find((order) => order.id === active.id);
      if (draggedOrder) {
        setActiveOrder(draggedOrder);
        const currentColumnIndex = kanbanColumnConfig.findIndex(
          (column) => column.id === draggedOrder.status,
        );
        if (currentColumnIndex !== -1) {
          targetColumnIndexRef.current = currentColumnIndex;
        }
      }
    },
    [clientOrders, kanbanColumnConfig],
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const taskId = active.id.toString();
        const newStatus = over.id.toString() as RepairOrderStatus;

        if (newStatus && repairOrderStatuses.includes(newStatus)) {
          onStatusChange?.(taskId, newStatus);

          //optimistically update the clientOrders state
          setClientOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === taskId ? { ...order, status: newStatus } : order,
            ),
          );
        }
      }

      setActiveOrder(null);

      targetColumnIndexRef.current = null;
    },
    [onStatusChange, repairOrderStatuses],
  );

  const handleOrderClick = useCallback(
    (order: RepairOrderWithVehicleDetails) => {
      if (activeOrder) return; // Prevent opening the dialog while dragging
      setSelectedOrder(order);
      setDetailDialogOpen(true);
    },
    [activeOrder],
  );

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      delay: 150,
      tolerance: 5,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150,
      tolerance: 5,
    },
  });

  const getNextKeyboardCoordinates = useCallback(
    (
      event: KeyboardEvent,
      {
        currentCoordinates,
        active,
      }: {
        currentCoordinates: { x: number; y: number };
        active: UniqueIdentifier;
      },
    ) => {
      // Only handle arrow keys, return current coordinates for other keys
      if (event.code !== "ArrowRight" && event.code !== "ArrowLeft") {
        return currentCoordinates;
      }

      // Find the current order by ID
      const currentOrder = repairOrders.find((order) => order.id === active);
      if (!currentOrder) return currentCoordinates;

      // Get all column rects at once
      const columnRects = kanbanColumnConfig
        .map((column) => {
          const columnEl = document.querySelector(
            `[data-column-id="${column.id}"]`,
          );
          return columnEl ? columnEl.getBoundingClientRect() : null;
        })
        .filter(Boolean);

      if (columnRects.length === 0) return currentCoordinates;

      // Find the current column index by matching the active order's status
      const currentStatus = currentOrder.status.toLowerCase().replace(" ", "-");
      const currentColumnIndex = kanbanColumnConfig.findIndex(
        (column) => column.id === currentStatus,
      );

      // Calculate target index based on current position and key pressed
      let targetIndex = targetColumnIndexRef.current ?? currentColumnIndex;

      switch (event.code) {
        case "ArrowRight":
          // Move to next column or wrap to first
          targetIndex = (targetIndex + 1) % columnRects.length;
          break;

        case "ArrowLeft":
          // Move to previous column or wrap to last
          targetIndex =
            (targetIndex - 1 + columnRects.length) % columnRects.length;
          break;
      }

      // Store the new target index for future calls
      targetColumnIndexRef.current = targetIndex;

      // Get the order element to calculate its dimensions
      const orderElement = document.querySelector(
        `[data-order-id="${active}"]`,
      );
      const orderRect = orderElement?.getBoundingClientRect();

      // Default offsets in case we can't find the order element
      const offsetX = orderRect ? orderRect.width / 2 : 0;

      // Get the target column rect
      const targetRect = columnRects[targetIndex];
      if (!targetRect) return currentCoordinates;

      // Calculate new coordinates centered in the target column
      return {
        x: targetRect.left + targetRect.width / 2 - offsetX,
        y: currentCoordinates.y,
      };
    },
    [kanbanColumnConfig, repairOrders],
  );

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: getNextKeyboardCoordinates,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={[mouseSensor, touchSensor, keyboardSensor]}
      >
        <div className={cn("grid grid-cols-3 gap-6", className)}>
          {kanbanColumnConfig.map((column) => {
            const columnOrdersList = columnOrders[column.id] || [];
            return (
              <KanbanColumn
                key={column.id}
                title={column.title}
                id={column.id}
                color={column.color}
                count={columnOrdersList.length}
              >
                <KanbanColumn.Content
                  orders={columnOrdersList}
                  isLoading={isLoading}
                  onOrderClick={handleOrderClick}
                />
              </KanbanColumn>
            );
          })}
        </div>
        <DragOverlay
          dropAnimation={{
            duration: 300,
            easing: "ease-out",
          }}
        >
          {activeOrder ? (
            <RepairOrderCard order={activeOrder} onClick={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Order Details Dialog */}
      <RepairOrderDetailsDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        order={selectedOrder}
      />
    </>
  );
});
