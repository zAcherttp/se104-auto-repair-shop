import { SalesReport, InventoryReport, SalesAnalytics, InventoryAnalytics } from '@/types/reports';
import { SparePart } from '@/types/types';

// Mock data for Sales Report (B51)
export const mockSalesReport: SalesReport = {
  month: "June 2025",
  totalRevenue: 15750000,
  orders: [
    {
      stt: 1,
      vehicleBrand: "Toyota",
      repairCount: 12,
      amount: 8400000,
      rate: 53.33,
    },
    {
      stt: 2,
      vehicleBrand: "Honda",
      repairCount: 8,
      amount: 4200000,
      rate: 26.67,
    },
    {
      stt: 3,
      vehicleBrand: "Mazda",
      repairCount: 5,
      amount: 2100000,
      rate: 13.33,
    },
    {
      stt: 4,
      vehicleBrand: "Hyundai",
      repairCount: 3,
      amount: 1050000,
      rate: 6.67,
    },
  ],
};

// Mock data for Inventory Report (B52)
export const mockInventoryReport: InventoryReport = {
  month: "June 2025",
  inventory: [
    {
      stt: 1,
      partName: "Engine Oil (5W-30)",
      beginStock: 50,
      purchased: 25, // Parts used during the month
      endStock: 25,   // 50 - 25 = 25
    },
    {
      stt: 2,
      partName: "Brake Pads (Front)",
      beginStock: 20,
      purchased: 15, // Parts used during the month
      endStock: 5,   // 20 - 15 = 5
    },
    {
      stt: 3,
      partName: "Air Filter",
      beginStock: 30,
      purchased: 20, // Parts used during the month
      endStock: 10,  // 30 - 20 = 10
    },
    {
      stt: 4,
      partName: "Spark Plugs",
      beginStock: 40,
      purchased: 30, // Parts used during the month
      endStock: 10,  // 40 - 30 = 10
    },
    {
      stt: 5,
      partName: "Transmission Fluid",
      beginStock: 15,
      purchased: 10, // Parts used during the month
      endStock: 5,   // 15 - 10 = 5
    },
  ],
};

// Mock data for Sales Analytics
export const mockSalesAnalytics: SalesAnalytics = {
  totalRevenue: 15750000,
  totalOrders: 28,
  averageOrderValue: 562500,
  completedOrders: 25,
  pendingOrders: 2,
  inProgressOrders: 1,
  cancelledOrders: 0,
  monthlyRevenue: [
    {
      month: "Jan 2025",
      revenue: 12000000,
      orders: 20,
    },
    {
      month: "Feb 2025",
      revenue: 14000000,
      orders: 22,
    },
    {
      month: "Mar 2025",
      revenue: 13500000,
      orders: 24,
    },
    {
      month: "Apr 2025",
      revenue: 16000000,
      orders: 26,
    },
    {
      month: "May 2025",
      revenue: 14500000,
      orders: 25,
    },
    {
      month: "Jun 2025",
      revenue: 15750000,
      orders: 28,
    },
  ],
  topServices: [
    {
      service: "Oil Change",
      revenue: 3500000,
      count: 25,
    },
    {
      service: "Brake Repair",
      revenue: 2800000,
      count: 14,
    },
    {
      service: "Engine Diagnostics",
      revenue: 2100000,
      count: 10,
    },
    {
      service: "Tire Replacement",
      revenue: 1750000,
      count: 8,
    },
    {
      service: "Transmission Service",
      revenue: 1400000,
      count: 6,
    },
  ],
};

// Mock data for Inventory Analytics
export const mockInventoryAnalytics: InventoryAnalytics = {
  totalParts: 150,
  totalValue: 75000,
  lowStockItems: 8,
  outOfStockItems: 3,
  averagePartValue: 500,
  topValueParts: [
    { 
      part: {
        id: "part-1",
        name: "Engine Block",
        price: 2500,
        stock_quantity: 6,
        created_at: "2024-01-01T00:00:00.000Z",
      },
      totalValue: 15000 
    },
    { 
      part: {
        id: "part-2",
        name: "Transmission Kit",
        price: 1800,
        stock_quantity: 7,
        created_at: "2024-01-01T00:00:00.000Z",
      },
      totalValue: 12600 
    },
  ],
  stockMovement: [
    { month: "2025-01", used: 25, purchased: 40 },
    { month: "2025-02", used: 32, purchased: 35 },
    { month: "2025-03", used: 28, purchased: 45 },
  ],
};

// Empty mock data for testing empty states
export const mockEmptySalesReport: SalesReport = {
  month: "June 2025",
  totalRevenue: 0,
  orders: [],
};

export const mockEmptyInventoryReport: InventoryReport = {
  month: "June 2025",
  inventory: [],
};

export const mockEmptySalesAnalytics: SalesAnalytics = {
  totalRevenue: 0,
  totalOrders: 0,
  averageOrderValue: 0,
  completedOrders: 0,
  pendingOrders: 0,
  inProgressOrders: 0,
  cancelledOrders: 0,
  monthlyRevenue: [],
  topServices: [],
};

// Mock report period
export const mockReportPeriod = {
  from: new Date("2025-07-01"),
  to: new Date("2025-07-31"),
};

// Mock error responses
export const mockErrorResponse = {
  error: new Error("Failed to fetch data"),
  data: undefined,
};

// Mock loading states
export const mockLoadingState = {
  isLoading: true,
  error: null,
  data: undefined,
};
