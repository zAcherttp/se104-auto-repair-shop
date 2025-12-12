"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { memo } from "react";
import { LanguageSwitcher } from "./language-switcher";
import { SignOutButton } from "./signout-button";
import { ThemeSwitcher } from "./theme-switcher";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";

const PageTitle = memo(function PageTitle() {
  const pathname = usePathname();
  const t = useTranslations("navigation");

  function getPageTitle(path: string): string {
    // Remove leading slash and get the first segment
    const segments = path.replace(/^\//, "").split("/");
    const mainSegment = segments[0];

    // Map path segments to translation keys
    const pageMap: Record<string, string> = {
      "": "home", // root path
      home: "home",
      reception: "reception",
      vehicles: "vehicles",
      inventory: "inventory",
      payments: "payments",
      reports: "reports",
      settings: "settings",
    };

    // Get translation key, fallback to formatted path if not found
    const translationKey = pageMap[mainSegment];
    if (translationKey && t.has(translationKey)) {
      return t(translationKey);
    }

    // Fallback to formatted path name
    return path
      .replace(/^\//, "")
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return <h1 className="font-medium text-base">{getPageTitle(pathname)}</h1>;
});

const HeaderActions = memo(function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ThemeSwitcher />
      <LanguageSwitcher />
      <SignOutButton />
    </div>
  );
});

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/60 px-4 backdrop-blur-sm transition-[width] ease-linear">
      <div className="z-10 flex items-center gap-1">
        <SidebarTrigger />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <PageTitle />
      </div>
      <HeaderActions />
    </header>
  );
}
