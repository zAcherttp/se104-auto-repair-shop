"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ApiResponse } from "@/types/settings";

// Helper function to check admin role
async function checkAdminRole() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    throw new Error("Access denied. Admin role required.");
  }

  return { supabase, user };
}

// System Settings Actions
export async function getSystemSettings(): Promise<ApiResponse> {
  try {
    const { supabase } = await checkAdminRole();

    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .order("setting_key");

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return { success: false, error: "Failed to fetch system settings" };
  }
}

export async function updateSystemSetting(
  key: string,
  value: string,
): Promise<ApiResponse> {
  try {
    const { supabase } = await checkAdminRole();

    const { data, error } = await supabase
      .from("system_settings")
      .upsert(
        { setting_key: key, setting_value: value },
        { onConflict: "setting_key" },
      )
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/settings");
    return { success: true, data };
  } catch (error) {
    console.error("Error updating system setting:", error);
    return { success: false, error: "Failed to update setting" };
  }
}

// Employee Actions
export async function getEmployees(): Promise<ApiResponse> {
  try {
    const { supabase } = await checkAdminRole();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching employees:", error);
    return { success: false, error: "Failed to fetch employees" };
  }
}

export async function createEmployee(formData: FormData): Promise<ApiResponse> {
  try {
    const { supabase } = await checkAdminRole();

    const email = formData.get("email") as string;
    const fullName = formData.get("fullName") as string;
    const role = formData.get("role") as string;
    const password = formData.get("password") as string;

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin
      .createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) throw authError;

    // Create profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role,
      })
      .select()
      .single();

    if (profileError) throw profileError;

    revalidatePath("/settings");
    return { success: true, data: profileData };
  } catch (error) {
    console.error("Error creating employee:", error);
    return { success: false, error: "Failed to create employee" };
  }
}

export async function updateEmployee(
  id: string,
  formData: FormData,
): Promise<ApiResponse> {
  try {
    const { supabase } = await checkAdminRole();

    const email = formData.get("email") as string;
    const fullName = formData.get("fullName") as string;
    const role = formData.get("role") as string;

    const { data, error } = await supabase
      .from("profiles")
      .update({
        email,
        full_name: fullName,
        role,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/settings");
    return { success: true, data };
  } catch (error) {
    console.error("Error updating employee:", error);
    return { success: false, error: "Failed to update employee" };
  }
}

export async function deleteEmployee(id: string): Promise<ApiResponse> {
  try {
    const { supabase } = await checkAdminRole();

    // Delete profile first
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) throw profileError;

    // Delete user from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) throw authError;

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting employee:", error);
    return { success: false, error: "Failed to delete employee" };
  }
}

// Spare Parts Actions
export async function getSpareParts(): Promise<ApiResponse> {
  try {
    const { supabase } = await checkAdminRole();

    const { data, error } = await supabase
      .from("spare_parts")
      .select("*")
      .order("name");

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching spare parts:", error);
    return { success: false, error: "Failed to fetch spare parts" };
  }
}

export async function createSparePart(
  formData: FormData,
): Promise<ApiResponse> {
  try {
    const { supabase } = await checkAdminRole();

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const stockQuantity = parseInt(formData.get("stockQuantity") as string);

    const { data, error } = await supabase
      .from("spare_parts")
      .insert({
        name,
        price,
        stock_quantity: stockQuantity,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/settings");
    return { success: true, data };
  } catch (error) {
    console.error("Error creating spare part:", error);
    return { success: false, error: "Failed to create spare part" };
  }
}

export async function updateSparePart(
  id: string,
  formData: FormData,
): Promise<ApiResponse> {
  try {
    const { supabase } = await checkAdminRole();

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const stockQuantity = parseInt(formData.get("stockQuantity") as string);

    const { data, error } = await supabase
      .from("spare_parts")
      .update({
        name,
        price,
        stock_quantity: stockQuantity,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/settings");
    return { success: true, data };
  } catch (error) {
    console.error("Error updating spare part:", error);
    return { success: false, error: "Failed to update spare part" };
  }
}

export async function deleteSparePart(id: string): Promise<ApiResponse> {
  try {
    const { supabase } = await checkAdminRole();

    const { error } = await supabase
      .from("spare_parts")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting spare part:", error);
    return { success: false, error: "Failed to delete spare part" };
  }
}

// Labor Types Actions
export async function getLaborTypes(): Promise<ApiResponse> {
  try {
    const { supabase } = await checkAdminRole();

    const { data, error } = await supabase
      .from("labor_types")
      .select("*")
      .order("name");

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching labor types:", error);
    return { success: false, error: "Failed to fetch labor types" };
  }
}

export async function createLaborType(
  formData: FormData,
): Promise<ApiResponse> {
  try {
    const { supabase } = await checkAdminRole();

    const name = formData.get("name") as string;
    const cost = parseFloat(formData.get("cost") as string);

    const { data, error } = await supabase
      .from("labor_types")
      .insert({
        name,
        cost,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/settings");
    return { success: true, data };
  } catch (error) {
    console.error("Error creating labor type:", error);
    return { success: false, error: "Failed to create labor type" };
  }
}

export async function updateLaborType(
  id: string,
  formData: FormData,
): Promise<ApiResponse> {
  try {
    const { supabase } = await checkAdminRole();

    const name = formData.get("name") as string;
    const cost = parseFloat(formData.get("cost") as string);

    const { data, error } = await supabase
      .from("labor_types")
      .update({
        name,
        cost,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/settings");
    return { success: true, data };
  } catch (error) {
    console.error("Error updating labor type:", error);
    return { success: false, error: "Failed to update labor type" };
  }
}

export async function deleteLaborType(id: string): Promise<ApiResponse> {
  try {
    const { supabase } = await checkAdminRole();

    const { error } = await supabase
      .from("labor_types")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting labor type:", error);
    return { success: false, error: "Failed to delete labor type" };
  }
}
