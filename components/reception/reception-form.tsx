"use client";

import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { FormDialogProps } from "@/types/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { useCarBrands } from "@/hooks/use-car-brands";
import { Skeleton } from "@/components/ui/skeleton";

// Stable references - moved outside component to prevent recreation
const FORM_DEFAULT_VALUES: VehicleReceptionFormData = {
  customerName: "",
  licensePlate: "",
  phoneNumber: "",
  carBrand: "",
  address: "",
  receptionDate: new Date(),
  notes: "",
};

const DIALOG_CONTENT_CLASSES = "max-w-2xl max-h-[90vh] overflow-y-auto";
const TITLE_CLASSES = "text-2xl font-bold text-blue-800";
const FORM_GRID_CLASSES = "grid grid-cols-1 md:grid-cols-2 gap-4";
const ACTIONS_CLASSES = "flex justify-end gap-4 pt-4";
const SUBMIT_BUTTON_CLASSES = "bg-blue-600 hover:bg-blue-700 w-25";

const ReceptionForm = React.memo<FormDialogProps>(
  ({ open, onClose, onSuccess }) => {
    const { data: carBrands, isLoading: isBrandsLoading } = useCarBrands();

    const form = useForm<VehicleReceptionFormData>({
      resolver: zodResolver(VehicleReceptionFormSchema),
      defaultValues: FORM_DEFAULT_VALUES,
    });

    // Memoize the submit handler to prevent recreating on every render
    const onSubmit = useCallback(
      async (data: VehicleReceptionFormData) => {
        const result = await createReception(data);

        if (result.error) {
          toast.error("Failed to create vehicle reception");
        } else {
          toast.success("Vehicle reception created successfully!");
          form.reset();
          onSuccess?.();
          onClose();
        }
      },
      [form, onSuccess, onClose]
    );

    // Memoize license plate change handler
    const handleLicensePlateChange = useCallback(
      (
        e: React.ChangeEvent<HTMLInputElement>,
        field: { onChange: (value: string) => void }
      ) => {
        field.onChange(e.target.value.toUpperCase());
      },
      []
    );

    // Memoize car brand select handler
    const handleCarBrandSelect = useCallback(
      (
        currentValue: string,
        field: { onChange: (value: string) => void; value: string }
      ) => {
        field.onChange(currentValue === field.value ? "" : currentValue);
      },
      []
    );

    // Memoize calendar date disabled check
    const isDateDisabled = useCallback((date: Date) => {
      return date > new Date() || date < new Date("1900-01-01");
    }, []);

    // Memoize car brands options to prevent recreation
    const carBrandOptions = useMemo(() => {
      return (
        carBrands?.map((brand: string) => ({
          value: brand,
          label: brand,
        })) || []
      );
    }, [carBrands]);

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          aria-describedby="vehicle-reception-form"
          className={DIALOG_CONTENT_CLASSES}
        >
          <DialogHeader>
            <DialogTitle className={TITLE_CLASSES}>
              Vehicle Reception Form
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className={FORM_GRID_CLASSES}>
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
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
                      <FormLabel>License Plate</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter license plate"
                          {...field}
                          onChange={(e) => handleLicensePlateChange(e, field)}
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
                      <FormLabel>Phone Number</FormLabel>
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
                      <FormLabel>Car Brand</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              disabled={isBrandsLoading}
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {isBrandsLoading
                                ? "Loading brands..."
                                : field.value
                                ? carBrandOptions.find(
                                    (option) => option.value === field.value
                                  )?.label
                                : "Select car brand..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search car brand..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>
                                {isBrandsLoading ? (
                                  <Skeleton className="h-4 w-full" />
                                ) : (
                                  "No car brand found."
                                )}
                              </CommandEmpty>
                              <CommandGroup>
                                {isBrandsLoading ? (
                                  <div className="space-y-1">
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-full" />
                                  </div>
                                ) : (
                                  carBrandOptions.map((option) => (
                                    <CommandItem
                                      key={option.value}
                                      value={option.value}
                                      onSelect={(currentValue) =>
                                        handleCarBrandSelect(
                                          currentValue,
                                          field
                                        )
                                      }
                                    >
                                      {option.label}
                                      <Check
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          field.value === option.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
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
                    <FormLabel>Reception Date</FormLabel>
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
                          disabled={isDateDisabled}
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

              <div className={ACTIONS_CLASSES}>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <SubmitButton
                  disabled={form.formState.isSubmitting}
                  className={SUBMIT_BUTTON_CLASSES}
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
);

ReceptionForm.displayName = "ReceptionForm";

export { ReceptionForm };
