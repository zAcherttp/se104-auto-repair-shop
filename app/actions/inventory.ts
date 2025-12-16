"use server";

import { revalidatePath } from "next/cache";
import {
  type SparePartFormData,
  SparePartFormSchema,
} from "@/lib/form/definitions";
import { createClient } from "@/supabase/server";
import type { ApiResponse, SparePart } from "@/types/types";

export async function addSparePart(
  data: SparePartFormData,
): Promise<ApiResponse<SparePart>> {
  try {
    const supabase = await createClient();

    // Validate the form data
    const validatedData = SparePartFormSchema.parse(data);

    const { data: sparePart, error } = await supabase
      .from("spare_parts")
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      return {
        error: new Error(error.message),
        data: undefined,
      };
    }

    // Revalidate the inventory page to show the new part
    revalidatePath("/inventory");

    return {
      error: null,
      data: sparePart,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error
          : new Error("An unexpected error occurred"),
      data: undefined,
    };
  }
}
