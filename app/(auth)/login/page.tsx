"use client";

import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const Page = () => {
  const router = useRouter();
  const t = useTranslations("auth");

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center">
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button
          variant="ghost"
          className="w-min"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Button>
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Page;
