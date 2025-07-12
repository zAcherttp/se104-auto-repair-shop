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
    <div className="flex flex-col h-screen">
      <div className="flex-1 p-4 overflow-hidden">
        <SettingsTabs />
      </div>
    </div>
  );
}
