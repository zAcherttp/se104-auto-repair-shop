"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import OrderDetails from "@/components/order-data-detail";
import SubmitButton from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  type RepairTrackingFormData,
  RepairTrackingFormSchema,
} from "@/lib/form/definitions";
import { createClient } from "@/supabase/client";
import type { OrderDataProps } from "@/types";

export default function TrackOrderPage() {
  const t = useTranslations("auth");
  const tTrack = useTranslations("auth.trackOrder");

  const form = useForm<RepairTrackingFormData>({
    resolver: zodResolver(RepairTrackingFormSchema),
    defaultValues: {
      query: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderDataProps | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const onSubmit = async (data: RepairTrackingFormData) => {
    setLoading(true);

    try {
      // Search for vehicle by license plate
      const { data: vehicle, error: vehicleError } = await supabase
        .from("vehicles")
        .select(
          `
          *,
          customer:customers(*),
          payments(*)
        `,
        )
        .eq("license_plate", data.query.toUpperCase())
        .single();

      if (vehicleError || !vehicle) {
        toast.error(vehicleError?.message || tTrack("vehicleNotFound"));
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
          )
        `,
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
        error instanceof Error ? error.message : "An unexpected error occurred",
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br">
      <div className="flex w-full max-w-md flex-col gap-4">
        <Button
          variant="ghost"
          className="w-min"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Button>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{tTrack("title")}</CardTitle>
            <CardDescription>{tTrack("subtitle")}</CardDescription>
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
                      <FormLabel>{tTrack("licensePlate")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={tTrack("plateplaceholder")}
                          className="uppercase"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <SubmitButton disabled={loading} className="w-full">
                  {tTrack("searchButton")}
                </SubmitButton>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
