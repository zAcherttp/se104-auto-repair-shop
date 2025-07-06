import { getStockCalculationsForPeriod } from "@/lib/inventory-calculations";

export async function debugInventoryReport(periodFrom: Date, periodTo: Date) {
    console.log("Debug: Period from:", periodFrom.toISOString());
    console.log("Debug: Period to:", periodTo.toISOString());

    try {
        const stockCalculations = await getStockCalculationsForPeriod(
            periodFrom,
            periodTo,
        );

        console.log(
            "Debug: Stock calculations count:",
            stockCalculations.length,
        );

        // Log first few calculations
        stockCalculations.slice(0, 3).forEach((calc, index) => {
            console.log(`Debug: Stock calc ${index}:`, {
                partId: calc.partId,
                beginStock: calc.beginStock,
                usedDuringPeriod: calc.usedDuringPeriod,
                endStock: calc.endStock,
                currentStock: calc.currentStock,
            });
        });

        return stockCalculations;
    } catch (error) {
        console.error("Debug: Error in stock calculations:", error);
        throw error;
    }
}
