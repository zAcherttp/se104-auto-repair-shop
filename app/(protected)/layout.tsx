import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { ProtectedLayout } from "@/components/protected-layout";
import React, { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  return <ProtectedLayout>{children}</ProtectedLayout>;
}
