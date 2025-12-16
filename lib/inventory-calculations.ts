"use server";

import { createClient } from "@/supabase/server";

export interface StockCalculationResult {
  partId: string;
  currentStock: number;
  beginStock: number;
  usedDuringPeriod: number;
  endStock: number;
}

export interface StockCalculationParams {
  periodFrom?: Date;
  periodTo?: Date;
}

/**
 * Calculate stock levels for spare parts with optional period filtering
 * Uses moving window approach - calculates stock levels as they were at the specific time period
 * @param params - Optional period parameters for filtering calculations
 * @returns Array of stock calculations for all spare parts
 */
export async function calculateStockLevels(
  params?: StockCalculationParams,
): Promise<StockCalculationResult[]> {
  const supabase = await createClient();

  if (params?.periodFrom && params?.periodTo) {
    // For period-based reports, calculate stock levels as they were at that time
    const [
      { data: spareParts, error: sparePartsError },
      { data: periodUsageItems, error: periodError },
      { data: usageAfterPeriodItems, error: afterPeriodError },
    ] = await Promise.all([
      // Get all spare parts with current stock quantities
      supabase
        .from("spare_parts")
        .select("*"),

      // Get usage during the specified period
      supabase
        .from("repair_order_items")
        .select(`
                    quantity,
                    spare_part_id,
                    repair_orders!inner(reception_date)
                `)
        .not("spare_part_id", "is", null)
        .gte(
          "repair_orders.reception_date",
          params.periodFrom.toISOString().split("T")[0],
        )
        .lte(
          "repair_orders.reception_date",
          params.periodTo.toISOString().split("T")[0],
        ),

      // Get usage AFTER the specified period (to calculate what the ending stock was at that time)
      supabase
        .from("repair_order_items")
        .select(`
                    quantity,
                    spare_part_id,
                    repair_orders!inner(reception_date)
                `)
        .not("spare_part_id", "is", null)
        .gt(
          "repair_orders.reception_date",
          params.periodTo.toISOString().split("T")[0],
        ),
    ]);

    if (sparePartsError || !spareParts) {
      throw new Error(
        sparePartsError?.message || "Failed to fetch spare parts",
      );
    }

    if (periodError) {
      throw new Error(periodError.message);
    }

    if (afterPeriodError) {
      throw new Error(afterPeriodError.message);
    }

    // Calculate usage during the period
    const usageDuringPeriod: Record<string, number> = {};
    periodUsageItems?.forEach((item) => {
      if (item.spare_part_id) {
        usageDuringPeriod[item.spare_part_id] =
          (usageDuringPeriod[item.spare_part_id] || 0) + (item.quantity || 0);
      }
    });

    // Calculate usage after the period (to determine what the ending stock was at that time)
    const usageAfterPeriod: Record<string, number> = {};
    usageAfterPeriodItems?.forEach((item) => {
      if (item.spare_part_id) {
        usageAfterPeriod[item.spare_part_id] =
          (usageAfterPeriod[item.spare_part_id] || 0) + (item.quantity || 0);
      }
    });

    // Calculate stock levels for each part as they were at that time
    return spareParts.map((part): StockCalculationResult => {
      const currentStock = part.stock_quantity || 0; // Current stock (today)
      const usedThisPeriod = usageDuringPeriod[part.id] || 0; // Usage during period
      const usedAfterPeriod = usageAfterPeriod[part.id] || 0; // Usage after period

      // Ending stock at that time = current stock + usage after that period
      const endStockAtTime = currentStock + usedAfterPeriod;

      // Beginning stock at that time = ending stock + usage during period
      const beginStockAtTime = endStockAtTime + usedThisPeriod;

      return {
        partId: part.id,
        currentStock,
        beginStock: beginStockAtTime,
        usedDuringPeriod: usedThisPeriod,
        endStock: endStockAtTime,
      };
    });
  }
  // For total calculations (no period filter) - use current data
  const [
    { data: spareParts, error: sparePartsError },
    { data: allUsageItems, error: allUsageError },
  ] = await Promise.all([
    // Get all spare parts with current stock quantities
    supabase
      .from("spare_parts")
      .select("*"),

    // Get all usage items to calculate total usage
    supabase
      .from("repair_order_items")
      .select(`
                    quantity,
                    spare_part_id,
                    repair_orders!inner(reception_date)
                `)
      .not("spare_part_id", "is", null),
  ]);

  if (sparePartsError || !spareParts) {
    throw new Error(sparePartsError?.message || "Failed to fetch spare parts");
  }

  if (allUsageError) {
    throw new Error(allUsageError.message);
  }

  // Calculate total usage for each part
  const totalUsage: Record<string, number> = {};
  allUsageItems?.forEach((item) => {
    if (item.spare_part_id) {
      totalUsage[item.spare_part_id] =
        (totalUsage[item.spare_part_id] || 0) + (item.quantity || 0);
    }
  });

  // Calculate stock levels for each part (current totals)
  return spareParts.map((part): StockCalculationResult => {
    const currentStock = part.stock_quantity || 0; // Current ending stock
    const totalUsed = totalUsage[part.id] || 0; // Total usage to date
    const beginStock = part.initial_stock || 0 || currentStock + totalUsed; // Use initial_stock if available

    return {
      partId: part.id,
      currentStock,
      beginStock,
      usedDuringPeriod: totalUsed,
      endStock: currentStock, // Ending stock is current stock
    };
  });
}

/**
 * Get current ending stock for all spare parts (total usage to date)
 * @returns Array of stock calculations showing current ending stock
 */
export async function getCurrentEndingStock(): Promise<
  StockCalculationResult[]
> {
  return calculateStockLevels(); // No period means total usage to date
}

/**
 * Get stock calculations for a specific period (for reports)
 * @param periodFrom - Start date of the period
 * @param periodTo - End date of the period
 * @returns Array of stock calculations for the specified period
 */
export async function getStockCalculationsForPeriod(
  periodFrom: Date,
  periodTo: Date,
): Promise<StockCalculationResult[]> {
  return calculateStockLevels({ periodFrom, periodTo });
}

/**
 * Update spare parts stock quantities based on repair order item changes
 * This function should be called whenever repair order items are modified
 */
export async function updateSparePartsStock(changes: {
  newItems?: Array<{
    spare_part_id: string | null;
    quantity: number;
  }>;
  updatedItems?: Array<{
    id: string;
    spare_part_id: string | null;
    quantity: number;
    originalQuantity?: number;
  }>;
  deletedItems?: Array<{
    spare_part_id: string | null;
    quantity: number;
  }>;
}): Promise<void> {
  const supabase = await createClient();

  try {
    // Calculate stock changes for each spare part
    const stockChanges: Record<string, number> = {};

    // Handle new items - decrease stock
    if (changes.newItems) {
      for (const item of changes.newItems) {
        if (item.spare_part_id) {
          stockChanges[item.spare_part_id] =
            (stockChanges[item.spare_part_id] || 0) - item.quantity;
        }
      }
    }

    // Handle updated items - adjust stock based on quantity difference
    if (changes.updatedItems) {
      for (const item of changes.updatedItems) {
        if (item.spare_part_id) {
          const originalQuantity = item.originalQuantity || 0;
          const quantityDifference = item.quantity - originalQuantity;
          stockChanges[item.spare_part_id] =
            (stockChanges[item.spare_part_id] || 0) - quantityDifference;
        }
      }
    }

    // Handle deleted items - increase stock back
    if (changes.deletedItems) {
      for (const item of changes.deletedItems) {
        if (item.spare_part_id) {
          stockChanges[item.spare_part_id] =
            (stockChanges[item.spare_part_id] || 0) + item.quantity;
        }
      }
    }

    // Apply stock changes to spare parts
    for (const [partId, change] of Object.entries(stockChanges)) {
      if (change !== 0) {
        // First get current stock to calculate new stock
        const { data: currentPart, error: fetchError } = await supabase
          .from("spare_parts")
          .select("stock_quantity")
          .eq("id", partId)
          .single();

        if (fetchError) {
          console.error(
            `Error fetching current stock for part ${partId}:`,
            fetchError,
          );
          continue;
        }

        const currentStock = currentPart.stock_quantity || 0;
        const newStock = Math.max(0, currentStock + change); // Prevent negative stock

        // Update the stock quantity
        const { error: updateError } = await supabase
          .from("spare_parts")
          .update({ stock_quantity: newStock })
          .eq("id", partId);

        if (updateError) {
          console.error(
            `Error updating stock for part ${partId}:`,
            updateError,
          );
        }
      }
    }
  } catch (error) {
    console.error("Error updating spare parts stock:", error);
    throw error;
  }
}
