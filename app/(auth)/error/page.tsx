"use client";

import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t("auth.error.title")}
        </h1>
        <p className="text-gray-600">{t("auth.error.message")}</p>
      </div>
    </div>
  );
}
