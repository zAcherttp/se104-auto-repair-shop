"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function SignOutButton() {
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <Button variant={"ghost"} onClick={signOut}>
      Sign out
      <ArrowRight className="w-4 h-4" />
    </Button>
  );
}
