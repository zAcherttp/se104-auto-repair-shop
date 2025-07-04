import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export default async function SettingsPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Check if user has admin role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    redirect("/reception");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your garage settings, employees, parts, and labor types.
        </p>
      </div>
      <SettingsTabs />
    </div>
  );
}
