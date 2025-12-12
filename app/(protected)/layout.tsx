import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ProtectedLayoutClient } from "@/components/protected-layout-client";
import { createClient } from "@/supabase/server";

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}
