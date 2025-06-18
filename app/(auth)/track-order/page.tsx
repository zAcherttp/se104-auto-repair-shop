"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { OrderDataProps } from "@/types";
import OrderDetails from "@/components/order-data-detail";

const TrackOrderPage = () => {
  const [licensePlate, setLicensePlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderDataProps | null>(null);

  const supabase = createClient();

  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Search for vehicle by license plate
      const { data: vehicle, error: vehicleError } = await supabase
        .from("vehicles")
        .select(
          `
          *,
          customer:customers(*)
        `
        )
        .eq("license_plate", licensePlate.toUpperCase())
        .single();

      if (vehicleError || !vehicle) {
        toast.error(vehicleError?.message || "Vehicle not found");
        setOrderData(null);
        setLoading(false);
        return;
      }

      // Get repair orders for this vehicle
      const { data: repairOrders, error: ordersError } = await supabase
        .from("repair_orders")
        .select(
          `
          *,
          repair_order_items(
            *,
            spare_part:spare_parts(*),
            labor_type:labor_types(*)
          ),
          payments(*)
        `
        )
        .eq("vehicle_id", vehicle.id)
        .order("created_at", { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      console.log("Repair Orders:", vehicle);

      setOrderData({
        vehicle,
        customer: vehicle.customer,
        RepairOrderWithItemsDetails: repairOrders || [],
      });
    } catch (error) {
      console.error("Error searching order:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }

    setLoading(false);
  };

  if (orderData) {
    return (
      <OrderDetails orderData={orderData} onBack={() => setOrderData(null)} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-2xl">Track Your Order</CardTitle>
            <p className="text-slate-600">
              Enter your license plate to check repair status
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate Number</Label>
                <Input
                  id="licensePlate"
                  type="text"
                  value={licensePlate}
                  onChange={(e) =>
                    setLicensePlate(e.target.value.toUpperCase())
                  }
                  placeholder="Enter license plate (e.g., ABC-123)"
                  required
                  className="uppercase"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Search Order
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrackOrderPage;
