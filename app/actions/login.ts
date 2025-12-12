"use server";

import type { SignInWithPasswordCredentials } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/types/types";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(7, "Password must be more than 6 characters"),
});

export async function Login(
  credentials: SignInWithPasswordCredentials,
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    // Validate credentials
    const validationResult = loginSchema.safeParse(credentials);

    if (!validationResult.success) {
      return {
        error: new Error(validationResult.error.errors[0].message),
        data: undefined,
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      return {
        error: new Error(error.message),
        data: undefined,
      };
    }

    revalidatePath("/", "layout");
    return {
      error: null,
      data: { success: true },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error("Login failed"),
      data: { success: false },
    };
  }
}

export async function SignOut(): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        error: new Error(error.message),
        data: undefined,
      };
    }

    revalidatePath("/", "layout");
    return {
      error: null,
      data: { success: true },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error("Sign out failed"),
      data: undefined,
    };
  }
}
