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
