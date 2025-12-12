"use client";

import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-4 font-bold text-2xl text-gray-900">
          {t("auth.error.title")}
        </h1>
        <p className="text-gray-600">{t("auth.error.message")}</p>
      </div>
    </div>
  );
}
