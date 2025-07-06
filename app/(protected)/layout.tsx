import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import React, { ReactNode } from "react";
import { ProtectedLayoutClient } from "@/components/protected-layout-client";

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}
