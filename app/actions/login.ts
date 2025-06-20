"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { LoginFormSchema } from "@/lib/form/definitions";
import { z } from "zod/v4";

type LoginFormData = z.infer<typeof LoginFormSchema>;

export async function Login(credentials: LoginFormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function SignOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }
  revalidatePath("/", "layout");
  return { success: true };
}
