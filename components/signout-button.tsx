"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const t = useTranslations("auth.signOut");

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    toast.success(t("message"));
    router.push("/");
  };

  return (
    <Button variant={"ghost"} onClick={signOut}>
      {t("title")}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}
