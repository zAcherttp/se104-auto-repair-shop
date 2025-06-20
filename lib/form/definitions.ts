import { z } from "zod/v4";

export const LoginFormSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const RepairTrackingFormSchema = z.object({
  query: z.string().min(1, "Please enter a valid string"),
});
