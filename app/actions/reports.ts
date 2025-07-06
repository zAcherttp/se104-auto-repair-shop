"use server";

import { createClient } from "@/supabase/server";
import { ApiResponse } from "@/types/types";
import {
    InventoryAnalytics,
    InventoryReport,
    ReportPeriod,
    SalesAnalytics,
    SalesReport,
} from "@/types/reports";

export async function getSalesAnalytics(
    period: ReportPeriod,
): Promise<ApiResponse<SalesAnalytics>> {
    try {
        const supabase = await createClient();

        // Check if user is authenticated
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                error: new Error("Authentication required"),
                data: undefined,
            };
        }

        // Get repair orders in the period
        const { data: orders, error: ordersError } = await supabase
            .from("repair_orders")
            .select(`
        *,
        vehicle:vehicles(
          id,
          brand,
          customer:customers(name)
        )
      `)
            .gte("reception_date", period.from.toISOString().split("T")[0])
            .lte("reception_date", period.to.toISOString().split("T")[0]);

        if (ordersError) {
            return {
                error: new Error(ordersError.message),
                data: undefined,
            };
        }

        // Get vehicle IDs from the orders
        const vehicleIds = orders?.map((order) =>
            order.vehicle?.id
        ).filter(Boolean) || [];

        // Fetch payments for these vehicles within the period
        let vehiclePayments: Record<string, number> = {};
        if (vehicleIds.length > 0) {
            const { data: payments, error: paymentsError } = await supabase
                .from("payments")
                .select("vehicle_id, amount")
                .in("vehicle_id", vehicleIds)
                .gte("payment_date", period.from.toISOString().split("T")[0])
                .lte("payment_date", period.to.toISOString().split("T")[0]);

            if (paymentsError) {
                return {
                    error: new Error(paymentsError.message),
                    data: undefined,
                };
            }

            // Group payments by vehicle
            vehiclePayments =
                payments?.reduce((acc: Record<string, number>, payment) => {
                    const vehicleId = payment.vehicle_id;
                    if (vehicleId) {
                        acc[vehicleId] = (acc[vehicleId] || 0) + payment.amount;
                    }
                    return acc;
                }, {}) || {};
        }

        // Calculate analytics
        const totalOrders = orders?.length || 0;
        const completedOrders = orders?.filter((o) =>
            o.status === "completed"
        ).length || 0;
        const pendingOrders =
            orders?.filter((o) => o.status === "pending").length || 0;
        const inProgressOrders =
            orders?.filter((o) => o.status === "in_progress").length || 0;
        const cancelledOrders =
            orders?.filter((o) => o.status === "cancelled").length || 0;

        // Calculate total revenue from vehicle payments
        const totalRevenue = Object.values(vehiclePayments).reduce(
            (sum, amount) => sum + amount,
            0,
        );

        const averageOrderValue = totalOrders > 0
            ? totalRevenue / totalOrders
            : 0;

        // Group by vehicle brand for top services
        const brandStats = orders?.reduce(
            (
                acc: Record<string, { count: number; revenue: number }>,
                order,
            ) => {
                const brand = order.vehicle?.brand || "Unknown";
                const vehicleId = order.vehicle?.id;
                if (!acc[brand]) {
                    acc[brand] = { count: 0, revenue: 0 };
                }
                acc[brand].count += 1;

                // Add revenue from payments for this vehicle
                if (vehicleId && vehiclePayments[vehicleId]) {
                    acc[brand].revenue += vehiclePayments[vehicleId];
                }

                return acc;
            },
            {},
        ) || {};

        const topServices = Object.entries(brandStats)
            .map((
                [service, stats]: [string, { count: number; revenue: number }],
            ) => ({
                service,
                count: stats.count,
                revenue: stats.revenue,
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        const analytics: SalesAnalytics = {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            completedOrders,
            pendingOrders,
            inProgressOrders,
            cancelledOrders,
            monthlyRevenue: [], // Would need more complex aggregation
            topServices,
        };

        return {
            error: null,
            data: analytics,
        };
    } catch (error) {
        return {
            error: error instanceof Error
                ? error
                : new Error("Failed to fetch sales analytics"),
            data: undefined,
        };
    }
}

export async function getInventoryAnalytics(): Promise<
    ApiResponse<InventoryAnalytics>
> {
    try {
        const supabase = await createClient();

        // Check if user is authenticated
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                error: new Error("Authentication required"),
                data: undefined,
            };
        }

        const { data: spareParts, error: partsError } = await supabase
            .from("spare_parts")
            .select("*");

        if (partsError) {
            return {
                error: new Error(partsError.message),
                data: undefined,
            };
        }

        const totalParts = spareParts?.length || 0;
        const totalValue = spareParts?.reduce((sum, part) =>
            sum + (part.price * part.stock_quantity), 0) || 0;
        const lowStockItems = spareParts?.filter((part) =>
            part.stock_quantity <= 5 && part.stock_quantity > 0
        ).length || 0;
        const outOfStockItems = spareParts?.filter((part) =>
            part.stock_quantity === 0
        ).length || 0;
        const averagePartValue = totalParts > 0 ? totalValue / totalParts : 0;

        const topValueParts = spareParts
            ?.map((part) => ({
                part,
                totalValue: part.price * part.stock_quantity,
            }))
            .sort((a, b) =>
                b.totalValue - a.totalValue
            )
            .slice(0, 10) || [];

        const analytics: InventoryAnalytics = {
            totalParts,
            totalValue,
            lowStockItems,
            outOfStockItems,
            averagePartValue,
            topValueParts,
            stockMovement: [], // Would need historical data
        };

        return {
            error: null,
            data: analytics,
        };
    } catch (error) {
        return {
            error: error instanceof Error
                ? error
                : new Error("Failed to fetch inventory analytics"),
            data: undefined,
        };
    }
}

export async function getSalesReport(
    period: ReportPeriod,
): Promise<ApiResponse<SalesReport>> {
    try {
        const supabase = await createClient();

        // Check if user is authenticated
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                error: new Error("Authentication required"),
                data: undefined,
            };
        }

        const { data: orders, error } = await supabase
            .from("repair_orders")
            .select(`
        *,
        vehicle:vehicles(id, brand)
      `)
            .gte("reception_date", period.from.toISOString().split("T")[0])
            .lte("reception_date", period.to.toISOString().split("T")[0]);

        if (error) {
            return {
                error: new Error(error.message),
                data: undefined,
            };
        }

        // Get vehicle IDs from the orders
        const vehicleIds = orders?.map((order) =>
            order.vehicle?.id
        ).filter(Boolean) || [];

        // Fetch payments for these vehicles within the period
        let vehiclePayments: Record<string, number> = {};
        if (vehicleIds.length > 0) {
            const { data: payments, error: paymentsError } = await supabase
                .from("payments")
                .select("vehicle_id, amount")
                .in("vehicle_id", vehicleIds)
                .gte("payment_date", period.from.toISOString().split("T")[0])
                .lte("payment_date", period.to.toISOString().split("T")[0]);

            if (paymentsError) {
                return {
                    error: new Error(paymentsError.message),
                    data: undefined,
                };
            }

            // Group payments by vehicle
            vehiclePayments =
                payments?.reduce((acc: Record<string, number>, payment) => {
                    const vehicleId = payment.vehicle_id;
                    if (vehicleId) {
                        acc[vehicleId] = (acc[vehicleId] || 0) + payment.amount;
                    }
                    return acc;
                }, {}) || {};
        }

        // Group by vehicle brand
        const brandStats = orders?.reduce(
            (
                acc: Record<string, { count: number; amount: number }>,
                order,
            ) => {
                const brand = order.vehicle?.brand || "Unknown";
                const vehicleId = order.vehicle?.id;

                if (!acc[brand]) {
                    acc[brand] = { count: 0, amount: 0 };
                }
                acc[brand].count += 1;

                // Add revenue from payments for this vehicle
                if (vehicleId && vehiclePayments[vehicleId]) {
                    acc[brand].amount += vehiclePayments[vehicleId];
                }

                return acc;
            },
            {},
        ) || {};

        const totalRevenue = Object.values(brandStats).reduce(
            (sum: number, stats: { count: number; amount: number }) =>
                sum + stats.amount,
            0,
        );

        const reportOrders = Object.entries(brandStats)
            .map((
                [vehicleBrand, stats]: [
                    string,
                    { count: number; amount: number },
                ],
                index,
            ) => ({
                stt: index + 1,
                vehicleBrand,
                repairCount: stats.count,
                amount: stats.amount,
                rate: totalRevenue > 0
                    ? (stats.amount / totalRevenue) * 100
                    : 0,
            }))
            .sort((a, b) => b.amount - a.amount);

        const report: SalesReport = {
            month: period.from.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
            }),
            totalRevenue,
            orders: reportOrders,
        };

        return {
            error: null,
            data: report,
        };
    } catch (error) {
        return {
            error: error instanceof Error
                ? error
                : new Error("Failed to fetch B5.1 sales report"),
            data: undefined,
        };
    }
}

export async function getInventoryReport(
    period: ReportPeriod,
): Promise<ApiResponse<InventoryReport>> {
    try {
        const supabase = await createClient();

        // Check if user is authenticated
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                error: new Error("Authentication required"),
                data: undefined,
            };
        }

        const { data: spareParts, error } = await supabase
            .from("spare_parts")
            .select("*");

        if (error) {
            return {
                error: new Error(error.message),
                data: undefined,
            };
        }

        // Get repair order items within the period to calculate parts usage
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
                period.from.toISOString().split("T")[0],
            )
            .lte(
                "repair_order.reception_date",
                period.to.toISOString().split("T")[0],
            );

        if (itemsError) {
            return {
                error: new Error(itemsError.message),
                data: undefined,
            };
        }

        // Get repair order items before the period to calculate beginning stock
        const { data: repairItemsBefore, error: itemsBeforeError } = await supabase
            .from("repair_order_items")
            .select(`
                quantity,
                spare_part_id,
                repair_order:repair_orders(reception_date)
            `)
            .not("spare_part_id", "is", null)
            .lt(
                "repair_order.reception_date",
                period.from.toISOString().split("T")[0],
            );

        if (itemsBeforeError) {
            return {
                error: new Error(itemsBeforeError.message),
                data: undefined,
            };
        }

        // Calculate parts usage during the period (additions)
        const partsUsageDuringPeriod: Record<string, number> = {};
        repairItems?.forEach((item) => {
            if (item.spare_part_id) {
                partsUsageDuringPeriod[item.spare_part_id] =
                    (partsUsageDuringPeriod[item.spare_part_id] || 0) +
                    (item.quantity || 0);
            }
        });

        // Calculate total parts usage before the period
        const totalPartsUsageBefore: Record<string, number> = {};
        repairItemsBefore?.forEach((item) => {
            if (item.spare_part_id) {
                totalPartsUsageBefore[item.spare_part_id] =
                    (totalPartsUsageBefore[item.spare_part_id] || 0) +
                    (item.quantity || 0);
            }
        });

        const inventory = spareParts?.map((part, index) => {
            const currentStock = part.stock_quantity || 0;
            const usedDuringPeriod = partsUsageDuringPeriod[part.id] || 0;
            const totalUsedBefore = totalPartsUsageBefore[part.id] || 0;
            
            // Calculate beginning stock: current stock + all usage from start of period to now
            const beginStock = currentStock + usedDuringPeriod;
            
            // Addition is the parts used during the selected period
            const addition = usedDuringPeriod;
            
            // Ending stock = beginning stock - addition
            const endStock = beginStock - addition;

            return {
                stt: index + 1,
                partName: part.name,
                beginStock,
                purchased: addition, // Using "purchased" field to represent additions (parts used)
                endStock,
            };
        }) || [];

        const report: InventoryReport = {
            month: period.from.toLocaleDateString("vi-VN", {
                month: "long",
                year: "numeric",
            }),
            inventory,
        };

        return {
            error: null,
            data: report,
        };
    } catch (error) {
        return {
            error: error instanceof Error
                ? error
                : new Error("Failed to fetch inventory report"),
            data: undefined,
        };
    }
}
