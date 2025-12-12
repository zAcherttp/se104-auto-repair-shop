"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createReception } from "@/app/actions/vehicles";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCarBrands } from "@/hooks/use-car-brands";
import { useDailyVehicleLimit } from "@/hooks/use-daily-vehicle-limit";
import {
  type VehicleReceptionFormData,
  VehicleReceptionFormSchema,
} from "@/lib/form/definitions";
import { cn } from "@/lib/utils";
import type { FormDialogProps } from "@/types/dialog";
import SubmitButton from "../submit-button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Label } from "../ui/label";

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
    const t = useTranslations("reception.form");
    const { data: carBrands, isLoading: isBrandsLoading } = useCarBrands();
    const { data: vehicleLimit, isLoading: isLimitLoading } =
      useDailyVehicleLimit();

    const form = useForm<VehicleReceptionFormData>({
      resolver: zodResolver(VehicleReceptionFormSchema),
      defaultValues: FORM_DEFAULT_VALUES,
    });

    // Memoize the submit handler to prevent recreating on every render
    const onSubmit = useCallback(
      async (data: VehicleReceptionFormData) => {
        const result = await createReception(data);

        if (result.error) {
          // Check if the error is about daily vehicle limit
          if (
            result.error.message?.includes("Cannot handle any more vehicles")
          ) {
            toast.error(t("limitReached"));
            onClose(); // Close the dialog
          } else {
            toast.error(t("error"));
          }
        } else {
          toast.success(t("success"));
          form.reset();
          onSuccess?.();
          onClose();
        }
      },
      [form, onSuccess, onClose, t],
    );

    // Memoize license plate change handler
    const handleLicensePlateChange = useCallback(
      (
        e: React.ChangeEvent<HTMLInputElement>,
        field: { onChange: (value: string) => void },
      ) => {
        field.onChange(e.target.value.toUpperCase());
      },
      [],
    );

    // Memoize car brand select handler
    const handleCarBrandSelect = useCallback(
      (
        currentValue: string,
        field: { onChange: (value: string) => void; value: string },
      ) => {
        field.onChange(currentValue === field.value ? "" : currentValue);
      },
      [],
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
            <DialogTitle className={TITLE_CLASSES}>{t("title")}</DialogTitle>
          </DialogHeader>

          {/* Daily Vehicle Limit Warning */}
          {!isLimitLoading &&
            vehicleLimit &&
            (vehicleLimit.isNearLimit || vehicleLimit.isAtLimit) && (
              <Alert
                className={
                  vehicleLimit.isAtLimit
                    ? "border-red-500 bg-red-50"
                    : "border-yellow-500 bg-yellow-50"
                }
              >
                <AlertDescription
                  className={
                    vehicleLimit.isAtLimit ? "text-red-700" : "text-yellow-700"
                  }
                >
                  {vehicleLimit.isAtLimit ? (
                    <>
                      <strong>Daily limit reached:</strong>{" "}
                      {vehicleLimit.currentCount}/{vehicleLimit.maxCapacity}{" "}
                      vehicles received today. New vehicle creation may be
                      blocked.
                    </>
                  ) : (
                    <>
                      <strong>Approaching daily limit:</strong>{" "}
                      {vehicleLimit.currentCount}/{vehicleLimit.maxCapacity}{" "}
                      vehicles received today.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className={FORM_GRID_CLASSES}>
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("customerName")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("customerNamePlaceholder")}
                          {...field}
                        />
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
                      <FormLabel>{t("licensePlate")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("licensePlatePlaceholder")}
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
                      <FormLabel>{t("phoneNumber")}</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder={t("phoneNumberPlaceholder")}
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
                      <FormLabel>{t("carBrand")}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              disabled={isBrandsLoading}
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {isBrandsLoading
                                ? "Loading brands..."
                                : field.value
                                  ? carBrandOptions.find(
                                      (option) => option.value === field.value,
                                    )?.label
                                  : t("carBrandPlaceholder")}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput
                              placeholder={t("carBrandSearchPlaceholder")}
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>
                                {isBrandsLoading ? (
                                  <Skeleton className="h-4 w-full" />
                                ) : (
                                  t("carBrandNotFound")
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
                                          field,
                                        )
                                      }
                                    >
                                      {option.label}
                                      <Check
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          field.value === option.value
                                            ? "opacity-100"
                                            : "opacity-0",
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
                    <FormLabel>{t("address")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("addressPlaceholder")}
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
                    <FormLabel>{t("receptionDate")}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <Label>{t("receptionDatePlaceholder")}</Label>
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
                    <FormLabel>{t("notes")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("notesPlaceholder")}
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
                  {t("cancel")}
                </Button>
                <SubmitButton
                  disabled={form.formState.isSubmitting}
                  className={SUBMIT_BUTTON_CLASSES}
                >
                  {t("submit")}
                </SubmitButton>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  },
);

ReceptionForm.displayName = "ReceptionForm";

export { ReceptionForm };
