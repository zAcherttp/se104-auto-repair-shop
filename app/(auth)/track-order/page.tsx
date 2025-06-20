"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { OrderDataProps } from "@/types";
import OrderDetails from "@/components/order-data-detail";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod/v4";
import { RepairTrackingFormSchema } from "@/lib/form/definitions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SubmitButton from "@/components/submit-button";

type RepairTrackingFormProps = z.infer<typeof RepairTrackingFormSchema>;

export default function TrackOrderPage() {
  const form = useForm<RepairTrackingFormProps>({
    resolver: zodResolver(RepairTrackingFormSchema),
    defaultValues: {
      query: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderDataProps | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const onSubmit = async (data: RepairTrackingFormProps) => {
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
        .eq("license_plate", data.query.toUpperCase())
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

      //console.log("Repair Orders:", vehicle);

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
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center">
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button
          variant="ghost"
          className="w-min"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Track Your Order</CardTitle>
            <CardDescription>
              Enter your license plate to check repair status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem className="pb-4">
                      <FormLabel>License plate number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ABC-123"
                          className="uppercase"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <SubmitButton disabled={loading} className="w-full">
                  Search
                </SubmitButton>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
