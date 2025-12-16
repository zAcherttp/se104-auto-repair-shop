"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchExistingRepairOrderItems } from "@/app/actions/vehicles";
import type { LineItem } from "../components/dialogs/update-repair-order/columns";
import { useSparePartsAndLaborTypes } from "./use-spare-parts-labor-types";

interface UseLineItemsOptions {
  repairOrderId?: string;
  autoLoad?: boolean;
}

export function useLineItems(options: UseLineItemsOptions = {}) {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [originalItems, setOriginalItems] = useState<LineItem[]>([]);
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // Fetch spare parts and labor types
  const { data: sparePartsAndLaborData, isLoading } =
    useSparePartsAndLaborTypes();
  const spareParts = sparePartsAndLaborData?.spareParts || [];
  const laborTypes = sparePartsAndLaborData?.laborTypes || [];

  // Load existing repair order items
  const loadExistingItems = useCallback(async (repairOrderId: string) => {
    if (!repairOrderId) return;

    setIsLoadingItems(true);
    try {
      const { items, error } =
        await fetchExistingRepairOrderItems(repairOrderId);

      if (error) {
        toast.error(error);
        return;
      }
      if (items && items.length > 0) {
        const formattedItems: LineItem[] = items.map(
          (item: {
            id: string;
            description?: string;
            quantity?: number;
            unit_price?: number;
            labor_cost?: number;
            total_amount?: number;
            spare_part?: { name: string };
            labor_type?: { name: string };
            assigned_employee?: { full_name: string };
          }) => ({
            id: item.id,
            description: item.description || "",
            sparePart: item.spare_part?.name || "",
            quantity: item.quantity || 1,
            unitPrice: item.unit_price || 0,
            laborType: item.labor_type?.name || "",
            laborCost: item.labor_cost || 0,
            total: item.total_amount || 0,
            assignedTo: item.assigned_employee?.full_name || "",
          }),
        );
        setLineItems(formattedItems);
        setOriginalItems(formattedItems);
      } else {
        // No existing items
        setLineItems([]);
        setOriginalItems([]);
      }
      setDeletedItemIds([]);
    } catch (error) {
      console.error("Error loading existing items:", error);
      toast.error("Failed to load existing repair items");
    } finally {
      setIsLoadingItems(false);
    }
  }, []);

  // Auto-load when repairOrderId changes
  useEffect(() => {
    if (options.autoLoad && options.repairOrderId) {
      loadExistingItems(options.repairOrderId);
    }
  }, [options.autoLoad, options.repairOrderId, loadExistingItems]);

  const addRow = useCallback(() => {
    const newRow: LineItem = {
      id: `temp-${Date.now()}`,
      description: "",
      sparePart: "",
      quantity: 1,
      unitPrice: 0,
      laborType: "",
      laborCost: 0,
      total: 0,
      assignedTo: "",
    };
    const newIndex = lineItems.length;
    setLineItems((prev) => [...prev, newRow]);

    return { newRow, newIndex };
  }, [lineItems.length]);
  const updateData = useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      setLineItems((old) =>
        old.map((row, index) => {
          if (index === rowIndex) {
            const updatedRow = { ...row, [columnId]: value };

            // Auto-calculate total when quantity, unitPrice, or laborCost changes
            if (
              columnId === "quantity" ||
              columnId === "unitPrice" ||
              columnId === "laborCost"
            ) {
              updatedRow.total =
                updatedRow.quantity * updatedRow.unitPrice +
                updatedRow.laborCost;
            }

            return updatedRow;
          }
          return row;
        }),
      );
    },
    [],
  );

  const revertData = useCallback(
    (rowIndex: number) => {
      setLineItems((old) =>
        old.map((row, index) => {
          if (index === rowIndex) {
            return originalItems[index] || row;
          }
          return row;
        }),
      );
    },
    [originalItems],
  );

  const removeRow = useCallback(
    (rowIndex: number) => {
      const rowToRemove = lineItems[rowIndex];

      // If it's an existing item (not a temp item), track it for deletion
      if (rowToRemove?.id && !rowToRemove.id.startsWith("temp-")) {
        const itemId = rowToRemove.id;
        setDeletedItemIds((prev) => [...prev, itemId]);
      }

      // Remove from current items
      setLineItems((old) => old.filter((_, index) => index !== rowIndex));
    },
    [lineItems],
  );

  const resetData = useCallback(() => {
    setLineItems([]);
    setOriginalItems([]);
    setDeletedItemIds([]);
  }, []);

  const getChangedData = useCallback(() => {
    const newItems = lineItems.filter((item) => item.id?.startsWith("temp-"));
    const updatedItems = lineItems.filter(
      (item) =>
        !item.id?.startsWith("temp-") &&
        originalItems.some((orig) => orig.id === item.id),
    );

    return {
      newItems,
      updatedItems,
      deletedItemIds,
    };
  }, [lineItems, originalItems, deletedItemIds]);

  const getTotalAmount = useCallback(() => {
    return lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  }, [lineItems]);

  return {
    lineItems,
    setLineItems,
    addRow,
    updateData,
    revertData,
    removeRow,
    resetData,
    loadExistingItems,
    getChangedData,
    getTotalAmount,
    spareParts,
    laborTypes,
    isLoading: isLoading || isLoadingItems,
    isLoadingItems,
    deletedItemIds,
  };
}
