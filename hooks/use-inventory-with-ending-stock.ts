import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/supabase/client";
import { SparePart } from "@/types/types";
import { getCurrentEndingStock } from "@/lib/inventory-calculations";
import { SparePartWithEndingStock } from "@/app/(protected)/inventory/columns";

export const useInventoryWithEndingStock = () => {
    const fetchInventoryWithEndingStock = async (): Promise<SparePartWithEndingStock[]> => {
        const supabase = createClient();

        // Get all spare parts
        const { data: spareParts, error } = await supabase
            .from("spare_parts")
            .select("*")
            .order("name", { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        // Get ending stock calculations
        try {
            const stockCalculations = await getCurrentEndingStock();
            
            // Create a map for quick lookup
            const stockCalcMap = new Map(
                stockCalculations.map(calc => [calc.partId, calc])
            );

            // Combine spare parts with ending stock calculations
            return (spareParts as SparePart[]).map((part): SparePartWithEndingStock => {
                const stockCalc = stockCalcMap.get(part.id);
                return {
                    ...part,
                    endingStock: stockCalc?.endStock ?? part.stock_quantity ?? 0,
                };
            });
        } catch (calcError) {
            // If stock calculations fail, fall back to original stock quantities
            console.warn("Failed to calculate ending stock, using current stock:", calcError);
            return (spareParts as SparePart[]).map((part): SparePartWithEndingStock => ({
                ...part,
                endingStock: part.stock_quantity ?? 0,
            }));
        }
    };

    const queryResult = useQuery({
        queryKey: ["inventory_with_ending_stock"],
        queryFn: fetchInventoryWithEndingStock,
    });

    return queryResult;
};
