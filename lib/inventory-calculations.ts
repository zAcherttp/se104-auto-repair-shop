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
 * @param params - Optional period parameters for filtering calculations
 * @returns Array of stock calculations for all spare parts
 */
export async function calculateStockLevels(
    params?: StockCalculationParams
): Promise<StockCalculationResult[]> {
    const supabase = await createClient();

    // Get all spare parts
    const { data: spareParts, error: sparePartsError } = await supabase
        .from("spare_parts")
        .select("*");

    if (sparePartsError || !spareParts) {
        throw new Error(sparePartsError?.message || "Failed to fetch spare parts");
    }

    const partsUsageDuringPeriod: Record<string, number> = {};

    // If period is specified, calculate usage during that period
    if (params?.periodFrom && params?.periodTo) {
        const { data: repairItems, error: itemsError } = await supabase
            .from("repair_order_items")
            .select(`
                quantity,
                spare_part_id,
                repair_order:repair_orders(reception_date)
            `)
            .not("spare_part_id", "is", null)
            .gte(
                "repair_order.reception_date",
                params.periodFrom.toISOString().split("T")[0],
            )
            .lte(
                "repair_order.reception_date",
                params.periodTo.toISOString().split("T")[0],
            );

        if (itemsError) {
            throw new Error(itemsError.message);
        }

        repairItems?.forEach((item) => {
            if (item.spare_part_id) {
                partsUsageDuringPeriod[item.spare_part_id] =
                    (partsUsageDuringPeriod[item.spare_part_id] || 0) +
                    (item.quantity || 0);
            }
        });
    } else {
        // If no period specified, calculate total usage to date
        const { data: allRepairItems, error: allItemsError } = await supabase
            .from("repair_order_items")
            .select(`
                quantity,
                spare_part_id
            `)
            .not("spare_part_id", "is", null);

        if (allItemsError) {
            throw new Error(allItemsError.message);
        }

        allRepairItems?.forEach((item) => {
            if (item.spare_part_id) {
                partsUsageDuringPeriod[item.spare_part_id] =
                    (partsUsageDuringPeriod[item.spare_part_id] || 0) +
                    (item.quantity || 0);
            }
        });
    }

    // Calculate stock levels for each part
    return spareParts.map((part): StockCalculationResult => {
        const currentStock = part.stock_quantity || 0;
        const usedDuringPeriod = partsUsageDuringPeriod[part.id] || 0;
        
        // Calculate beginning stock: current stock + usage during period
        const beginStock = currentStock + usedDuringPeriod;
        
        // Ending stock = beginning stock - usage during period
        const endStock = beginStock - usedDuringPeriod;

        return {
            partId: part.id,
            currentStock,
            beginStock,
            usedDuringPeriod,
            endStock: Math.max(0, endStock), // Ensure non-negative
        };
    });
}

/**
 * Get current ending stock for all spare parts (total usage to date)
 * @returns Array of stock calculations showing current ending stock
 */
export async function getCurrentEndingStock(): Promise<StockCalculationResult[]> {
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
    periodTo: Date
): Promise<StockCalculationResult[]> {
    return calculateStockLevels({ periodFrom, periodTo });
}
