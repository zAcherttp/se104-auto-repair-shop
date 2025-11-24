"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/supabase/server";
import { LoginFormData } from "@/lib/form/definitions";
import { ApiResponse } from "@/types/types";

export async function Login(
  credentials: LoginFormData,
): Promise<ApiResponse<{ success: any }>> {
  try {
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

export async function SignOut(): Promise<ApiResponse<{ success: true }>> {
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
