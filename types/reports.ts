import { SparePart } from "./types";

export interface SalesAnalytics {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    completedOrders: number;
    pendingOrders: number;
    inProgressOrders: number;
    cancelledOrders: number;
    monthlyRevenue: Array<{
        month: string;
        revenue: number;
        orders: number;
    }>;
    topServices: Array<{
        service: string;
        count: number;
        revenue: number;
    }>;
}

export interface InventoryAnalytics {
    totalParts: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    averagePartValue: number;
    topValueParts: Array<{
        part: SparePart;
        totalValue: number;
    }>;
    stockMovement: Array<{
        month: string;
        used: number;
        purchased: number;
    }>;
}

// Sales Report
export interface SalesReport {
    month: string;
    totalRevenue: number;
    orders: Array<{
        stt: number;
        vehicleBrand: string;
        repairCount: number;
        amount: number;
        rate: number; // Tỉ Lệ %
    }>;
}

// Inventory Report
export interface InventoryReport {
    month: string;
    inventory: Array<{
        stt: number;
        partName: string;
        beginStock: number; // Tồn Đầu
        purchased: number; // Phát Sinh
        endStock: number; // Tồn Cuối
    }>;
}

export type ReportPeriod = {
    from: Date;
    to: Date;
};

export type ReportType = "sales" | "inventory";
