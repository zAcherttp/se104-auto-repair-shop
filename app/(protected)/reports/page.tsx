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
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("reports");
  // Use stable default values to avoid hydration mismatch
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: 7, // July (current month as default)
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
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t("errorLoading")} {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <Tabs defaultValue="sales" className="space-y-4">
        <div className="grid grid-cols-3 items-center gap-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t("tabs.salesAnalysis")}
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t("tabs.inventoryAnalysis")}
            </TabsTrigger>
          </TabsList>
          <div></div>
          <MonthYearPicker
            initialMonth={selectedPeriod.month - 1}
            initialYear={selectedPeriod.year}
            onUpdate={handlePeriodUpdate}
          />
        </div>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("salesOverview.title")}</CardTitle>
                <CardDescription>
                  {t("salesOverview.description")}
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
                <CardTitle>{t("keyMetrics.title")}</CardTitle>
                <CardDescription>{t("keyMetrics.description")}</CardDescription>
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
                      <span className="text-sm font-medium">
                        {t("keyMetrics.totalRevenue")}
                      </span>
                      <span className="text-2xl font-bold">
                        {salesAnalytics?.totalRevenue?.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        }) || "0.00 $"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {t("keyMetrics.totalOrders")}
                      </span>
                      <span className="text-2xl font-bold">
                        {salesAnalytics?.totalOrders || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {t("keyMetrics.averageOrderValue")}
                      </span>
                      <span className="text-2xl font-bold">
                        {salesAnalytics?.averageOrderValue?.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "USD",
                          }
                        ) || "0 0.00 $"}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("detailedSalesReport.title")}</CardTitle>
              <CardDescription>
                {t("detailedSalesReport.description")}
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
              <CardTitle>{t("inventoryMetrics.title")}</CardTitle>
              <CardDescription>
                {t("inventoryMetrics.description")}
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
                    <span className="text-sm font-medium">
                      {t("inventoryMetrics.totalParts")}
                    </span>
                    <span className="text-2xl font-bold">
                      {inventoryAnalytics?.totalParts || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {t("inventoryMetrics.lowStockItems")}
                    </span>
                    <span className="text-2xl font-bold text-destructive">
                      {inventoryAnalytics?.lowStockItems || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {t("inventoryMetrics.totalValue")}
                    </span>
                    <span className="text-2xl font-bold">
                      {inventoryAnalytics?.totalValue?.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      }) || "0 0.00 $"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("inventoryStatusReport.title")}</CardTitle>
              <CardDescription>
                {t("inventoryStatusReport.description")}
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
