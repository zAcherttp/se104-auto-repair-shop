"use client";

import { createClient } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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
      <ArrowRight className="w-4 h-4" />
    </Button>
  );
}
