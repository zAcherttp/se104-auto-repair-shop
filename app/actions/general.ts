import { createClient } from "@/supabase/client";
import type { ApiResponse } from "@/types/settings";

export async function getIsAdmin(): Promise<ApiResponse<boolean>> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      throw new Error("Failed to fetch admin status");
    }
    // Fetch user role from profiles table
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const userRole = profileData?.role || "";

    return { success: true, data: userRole === "admin" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? `: ${error.message}` : "",
      data: false,
    };
  }
}
