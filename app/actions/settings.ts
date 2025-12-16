"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/supabase/admin";
import { createClient } from "@/supabase/server";
import type { ApiResponse } from "@/types/settings";

// Helper function to check admin role
export async function checkAdminRole() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Use admin client to check user role through auth metadata
  const adminClient = createAdminClient();
  const { data: adminUserData, error: adminError } =
    await adminClient.auth.admin.getUserById(user.id);

  if (adminError || !adminUserData.user) {
    throw new Error("Failed to verify user permissions.");
  }

  // Check if user has admin role in user metadata
  const isGarageAdmin =
    adminUserData.user.user_metadata?.is_garage_admin === true;

  // If is_garage_admin is not set, fallback to checking profiles table
  if (!isGarageAdmin) {
    const supabase = await createClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      throw new Error("Access denied. Admin role required.");
    }
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

export async function updateSystemSettings(
  settings: Array<{ key: string; value: string }>,
): Promise<ApiResponse> {
  try {
    const { supabase } = await checkAdminRole();

    // Prepare bulk upsert data
    const upsertData = settings.map(({ key, value }) => ({
      setting_key: key,
      setting_value: value,
    }));

    const { data, error } = await supabase
      .from("system_settings")
      .upsert(upsertData, { onConflict: "setting_key" })
      .select();

    if (error) throw error;

    revalidatePath("/settings");
    return { success: true, data };
  } catch (error) {
    console.error("Error updating system settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

// Employee Actions
export async function getEmployees(): Promise<ApiResponse> {
  try {
    // Allow any authenticated user to fetch employees (for assignment purposes)
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

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

    const fullName = formData.get("fullName") as string;
    const role = formData.get("role") as string;

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: crypto.randomUUID(),
        email: "", // Set empty email since no auth user
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

    const fullName = formData.get("fullName") as string;
    const role = formData.get("role") as string;

    // Update profile only (no auth user to update)
    const { data, error } = await supabase
      .from("profiles")
      .update({
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

    // Only delete profile (no auth user to delete)
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) throw profileError;

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
    const price = Number.parseFloat(formData.get("price") as string);
    const stockQuantity = Number.parseInt(
      formData.get("stockQuantity") as string,
      10,
    );

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
    const price = Number.parseFloat(formData.get("price") as string);
    const stockQuantity = Number.parseInt(
      formData.get("stockQuantity") as string,
      10,
    );

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

    const { error } = await supabase.from("spare_parts").delete().eq("id", id);

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
    const cost = Number.parseFloat(formData.get("cost") as string);

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
    const cost = Number.parseFloat(formData.get("cost") as string);

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

    const { error } = await supabase.from("labor_types").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting labor type:", error);
    return { success: false, error: "Failed to delete labor type" };
  }
}

// Car Brands fetching (public access)
export async function getCarBrands(): Promise<ApiResponse<string[]>> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated (no admin required for car brands)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    const { data, error } = await supabase
      .from("system_settings")
      .select("setting_value")
      .eq("setting_key", "car_brands")
      .single();

    if (error) {
      // If car_brands setting doesn't exist, return empty array
      const defaultBrands = [""];
      return { success: true, data: defaultBrands };
    }

    // Parse the JSON array from setting_value
    const brands = Array.isArray(data.setting_value)
      ? data.setting_value
      : JSON.parse(data.setting_value || "[]");

    return { success: true, data: brands };
  } catch (error) {
    console.error("Error fetching car brands:", error);
    // Return empty array if there's an error
    const defaultBrands = [""];
    return { success: true, data: defaultBrands };
  }
}

// Car Brands Management Actions
export async function updateCarBrands(brands: string[]): Promise<ApiResponse> {
  try {
    const { supabase } = await checkAdminRole();

    // Validate and clean the brands array
    const validBrands = brands
      .filter((brand) => brand && brand.trim() !== "")
      .map((brand) => brand.trim())
      .filter((brand, index, arr) => arr.indexOf(brand) === index); // Remove duplicates

    const { data, error } = await supabase
      .from("system_settings")
      .upsert(
        {
          setting_key: "car_brands",
          setting_value: JSON.stringify(validBrands),
        },
        { onConflict: "setting_key" },
      )
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/settings");
    return { success: true, data };
  } catch (error) {
    console.error("Error updating car brands:", error);
    return { success: false, error: "Failed to update car brands" };
  }
}

// Helper function to promote a user to admin (useful for initial setup)
export async function promoteUserToAdmin(userId: string): Promise<ApiResponse> {
  try {
    const adminClient = createAdminClient();

    // Update user metadata to include admin role
    const { error: authUpdateError } =
      await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: {
          is_garage_admin: true,
        },
      });

    if (authUpdateError) throw authUpdateError;

    // Also update the profiles table for consistency
    const supabase = await createClient();
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", userId);

    if (profileError) throw profileError;

    return { success: true };
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    return { success: false, error: "Failed to promote user to admin" };
  }
}

// Migration function to set is_garage_admin flag for existing admin users
export async function migrateExistingAdmins(): Promise<ApiResponse> {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Get all admin users from profiles table
    const { data: adminProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("role", "admin");

    if (profilesError) throw profilesError;

    if (!adminProfiles || adminProfiles.length === 0) {
      return { success: true, data: "No admin users found to migrate" };
    }

    // Update each admin user's metadata
    const migrationPromises = adminProfiles.map(async (profile) => {
      const { error } = await adminClient.auth.admin.updateUserById(
        profile.id,
        {
          user_metadata: {
            is_garage_admin: true,
          },
        },
      );
      return { id: profile.id, error };
    });

    const results = await Promise.all(migrationPromises);
    const failures = results.filter((r) => r.error);

    if (failures.length > 0) {
      console.error("Migration failures:", failures);
      return {
        success: false,
        error: `Failed to migrate ${failures.length} admin users`,
      };
    }

    return {
      success: true,
      data: `Successfully migrated ${results.length} admin users`,
    };
  } catch (error) {
    console.error("Error migrating existing admins:", error);
    return { success: false, error: "Failed to migrate existing admin users" };
  }
}

// Public function to get garage information for landing page (no admin required)
import type { GarageInfo } from "@/types/settings";

export async function getGarageInfo(): Promise<ApiResponse<GarageInfo>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("system_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "garage_name",
        "phone_number",
        "email_address",
        "address",
        "banner_image_url",
        "logo_image_url",
        "logo_position",
      ])
      .order("setting_key");

    if (error) {
      console.error("Database error fetching garage info:", error);
      throw error;
    }

    // Convert settings array to object
    const settingsMap = (data || []).reduce(
      (
        acc: Record<string, string>,
        setting: { setting_key: string; setting_value: string },
      ) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      },
      {},
    );

    const garageInfo = {
      garageName: settingsMap.garage_name || "",
      phoneNumber: settingsMap.phone_number || "",
      emailAddress: settingsMap.email_address || "",
      address: settingsMap.address || "",
      bannerImageUrl: settingsMap.banner_image_url || "",
      logoImageUrl: settingsMap.logo_image_url || "",
      logoPosition:
        (settingsMap.logo_position as "left" | "right" | "none") || "left",
    };

    return {
      success: true,
      data: garageInfo,
    };
  } catch (error) {
    console.error("Error fetching garage info:", error);
    return {
      success: true, // Return success with defaults to avoid breaking the landing page
      data: {
        garageName: "",
        phoneNumber: "",
        emailAddress: "",
        address: "",
        bannerImageUrl: "",
        logoImageUrl: "",
        logoPosition: "left" as const,
      },
    };
  }
}

// Monthly usage validation for parts and labor types
export async function validateMonthlyUsage(
  sparePartId: string | null,
  laborTypeId: string | null,
  currentMonth = new Date(),
): Promise<
  ApiResponse<{ canAddPart: boolean; canAddLabor: boolean; messages: string[] }>
> {
  try {
    const { supabase } = await checkAdminRole();

    // Get current garage settings for limits
    const { data: settings, error: settingsError } = await supabase
      .from("system_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["max_parts_per_month", "max_labor_types_per_month"]);

    if (settingsError) throw settingsError;

    const settingsMap = (settings || []).reduce(
      (acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      },
      {} as Record<string, string>,
    );

    const maxPartsPerMonth =
      Number.parseInt(settingsMap.max_parts_per_month, 10) || 0;
    const maxLaborTypesPerMonth =
      Number.parseInt(settingsMap.max_labor_types_per_month, 10) || 0;

    // If no limits are set, allow everything
    if (maxPartsPerMonth === 0 && maxLaborTypesPerMonth === 0) {
      return {
        success: true,
        data: { canAddPart: true, canAddLabor: true, messages: [] },
      };
    }

    // Calculate current month boundaries
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    );

    const messages: string[] = [];
    let canAddPart = true;
    let canAddLabor = true;

    // Check part usage if part is being added and limit is set
    if (sparePartId && maxPartsPerMonth > 0) {
      const { data: partUsage, error: partError } = await supabase
        .from("repair_order_items")
        .select("id")
        .eq("spare_part_id", sparePartId)
        .gte("created_at", startOfMonth.toISOString())
        .lte("created_at", endOfMonth.toISOString());

      if (partError) throw partError;

      const currentPartUsage = partUsage?.length || 0;
      if (currentPartUsage >= maxPartsPerMonth) {
        canAddPart = false;
        messages.push(
          `Part usage limit reached for this month (${currentPartUsage}/${maxPartsPerMonth})`,
        );
      }
    }

    // Check labor type usage if labor type is being added and limit is set
    if (laborTypeId && maxLaborTypesPerMonth > 0) {
      const { data: laborUsage, error: laborError } = await supabase
        .from("repair_order_items")
        .select("id")
        .eq("labor_type_id", laborTypeId)
        .gte("created_at", startOfMonth.toISOString())
        .lte("created_at", endOfMonth.toISOString());

      if (laborError) throw laborError;

      const currentLaborUsage = laborUsage?.length || 0;
      if (currentLaborUsage >= maxLaborTypesPerMonth) {
        canAddLabor = false;
        messages.push(
          `Labor type usage limit reached for this month (${currentLaborUsage}/${maxLaborTypesPerMonth})`,
        );
      }
    }

    return {
      success: true,
      data: { canAddPart, canAddLabor, messages },
    };
  } catch (error) {
    console.error("Error validating monthly usage:", error);
    return {
      success: false,
      error: "Failed to validate monthly usage limits",
    };
  }
}
