"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MonthYearPicker from "@/components/month-year-picker";
import { SalesAnalyticsChart } from "@/components/reports/sales-analytics-chart";
import { SalesTable } from "@/components/reports/sales-table";
import { InventoryTable } from "@/components/reports/inventory-table";
import { useReportsQuery } from "@/hooks/use-reports";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, BarChart3, Package } from "lucide-react";

export default function Page() {
  // Use stable default values to avoid hydration mismatch
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: 6, // June (current month as default)
    year: 2025,
  });

  // Update to current date after hydration
  useEffect(() => {
    const now = new Date();
    setSelectedPeriod({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });
  }, []);

  // Memoize the callback to prevent infinite re-renders
  const handlePeriodUpdate = useCallback(
    (values: { range: { from?: Date; to?: Date } }) => {
      if (values.range?.from) {
        setSelectedPeriod({
          month: values.range.from.getMonth() + 1,
          year: values.range.from.getFullYear(),
        });
      }
    },
    []
  );

  const period = {
    from: new Date(selectedPeriod.year, selectedPeriod.month - 1, 1),
    to: new Date(selectedPeriod.year, selectedPeriod.month, 0),
  };

  const {
    salesAnalytics,
    inventoryAnalytics,
    b51Report,
    b52Report,
    isLoading,
    errors,
  } = useReportsQuery(period);

  const hasError = errors.sales || errors.inventory || errors.b51 || errors.b52;
  const error = hasError
    ? new Error(
        errors.sales?.message ||
          errors.inventory?.message ||
          errors.b51?.message ||
          errors.b52?.message ||
          "Unknown error"
      )
    : null;

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load reports data: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            View sales and inventory analytics for your repair shop
          </p>
        </div>
        <MonthYearPicker
          initialMonth={selectedPeriod.month - 1}
          initialYear={selectedPeriod.year}
          onUpdate={handlePeriodUpdate}
        />
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Sales Analysis
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                  Car brands revenue distribution and market share
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-[200px] w-full" />
                  </div>
                ) : (
                  <SalesAnalyticsChart data={salesAnalytics} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>
                  Important sales metrics for the period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Revenue</span>
                      <span className="text-2xl font-bold">
                        {salesAnalytics?.totalRevenue?.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }) || "0 ₫"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Orders</span>
                      <span className="text-2xl font-bold">
                        {salesAnalytics?.totalOrders || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Average Order Value
                      </span>
                      <span className="text-2xl font-bold">
                        {salesAnalytics?.averageOrderValue?.toLocaleString(
                          "vi-VN",
                          {
                            style: "currency",
                            currency: "VND",
                          }
                        ) || "0 ₫"}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Sales Report</CardTitle>
              <CardDescription>
                Comprehensive breakdown of sales transactions and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                <SalesTable data={b51Report} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Metrics</CardTitle>
              <CardDescription>
                Key inventory performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Parts</span>
                    <span className="text-2xl font-bold">
                      {inventoryAnalytics?.totalParts || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Low Stock Items</span>
                    <span className="text-2xl font-bold text-destructive">
                      {inventoryAnalytics?.lowStockItems || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Value</span>
                    <span className="text-2xl font-bold">
                      {inventoryAnalytics?.totalValue?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }) || "0 ₫"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Status Report</CardTitle>
              <CardDescription>
                Detailed inventory levels, movements, and stock analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                <InventoryTable data={b52Report} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
