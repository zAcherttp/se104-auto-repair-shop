import { z } from "zod/v4";

export const LoginFormSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export type LoginFormData = z.infer<typeof LoginFormSchema>;

export const RepairTrackingFormSchema = z.object({
  query: z.string().min(1, "Please enter a valid string"),
});
export type RepairTrackingFormData = z.infer<typeof RepairTrackingFormSchema>;

export const VehicleReceptionFormSchema = z.object({
  customerName: z
    .string()
    .min(2, "Customer name must be at least 2 characters"),
  licensePlate: z
    .string()
    .min(2, "License plate is required")
    .transform((val) => val.toUpperCase().replace(/\s/g, "")),
  phoneNumber: z
    .string()
    .regex(/^[0-9]+$/, "Phone number must contain only numbers")
    .min(10, "Phone number must be at least 10 digits"),
  carBrand: z.string().min(1, "Please select a car brand"),
  address: z.string().optional(),
  receptionDate: z.date("Reception date is required"),
  notes: z.string().optional(),
});

export type VehicleReceptionFormData = z.infer<
  typeof VehicleReceptionFormSchema
>;

export const LineItemFormSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  sparePart: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  laborType: z.string().optional(),
  laborCost: z.number().min(0, "Labor cost must be non-negative"),
  total: z.number().min(0, "Total must be non-negative"),
});

export type LineItemFormData = z.infer<typeof LineItemFormSchema>;

export const SparePartFormSchema = z.object({
  name: z
    .string()
    .min(2, "Part name must be at least 2 characters")
    .max(100, "Part name must be less than 100 characters"),
  price: z
    .number()
    .min(0.01, "Price must be greater than 0")
    .max(999999.99, "Price is too high"),
  stock_quantity: z
    .number()
    .int("Stock quantity must be a whole number")
    .min(0, "Stock quantity cannot be negative"),
});

export type SparePartFormData = z.infer<typeof SparePartFormSchema>;
