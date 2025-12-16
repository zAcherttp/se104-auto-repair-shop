"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";

const Page = () => {
  const router = useRouter();
  const t = useTranslations("auth");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br">
      <div className="flex w-full max-w-md flex-col gap-4">
        <Button
          variant="ghost"
          className="w-min"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-4 w-4" />
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
