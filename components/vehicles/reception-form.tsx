"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  VehicleReceptionFormSchema,
  VehicleReceptionFormData,
} from "@/lib/form/definitions";
import { createReception } from "@/app/actions/vehicles";
import SubmitButton from "../submit-button";

const CAR_BRANDS = [
  "Toyota",
  "Honda",
  "Ford",
  "Chevrolet",
  "Nissan",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volkswagen",
  "Hyundai",
  "Kia",
  "Mazda",
  "Subaru",
  "Lexus",
  "Other",
];

interface ReceptionFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReceptionForm({
  open,
  onClose,
  onSuccess,
}: ReceptionFormProps) {
  const form = useForm<VehicleReceptionFormData>({
    resolver: zodResolver(VehicleReceptionFormSchema),
    defaultValues: {
      customerName: "",
      licensePlate: "",
      phoneNumber: "",
      carBrand: "",
      address: "",
      receptionDate: new Date(),
      notes: "",
    },
  });

  const onSubmit = async (data: VehicleReceptionFormData) => {
    const result = await createReception(data);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Vehicle reception created successfully!");
      form.reset();
      onSuccess();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        aria-describedby="vehicle-reception-form"
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-800">
            Vehicle Reception Form
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Plate *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter license plate"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter phone number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Car Brand *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select car brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CAR_BRANDS.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter customer address"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receptionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Reception Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or observations"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <SubmitButton
                disabled={form.formState.isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 w-25"
              >
                Submit
              </SubmitButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
