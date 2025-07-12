"use client";

import { ThemeSwitcher } from "./theme-switcher";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import React, { memo } from "react";
import { usePathname } from "next/navigation";
import { SignOutButton } from "./signout-button";
import { LanguageSwitcher } from "./language-switcher";

const PageTitle = memo(function PageTitle() {
  const pathname = usePathname();

  function formatPathname(path: string) {
    return path
      .replace(/^\//, "")
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return <h1 className="text-base font-medium">{formatPathname(pathname)}</h1>;
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
    <header className="backdrop-blur-sm sticky shrink-0 gap-2 top-0 z-10 flex transition-[width] ease-linear h-14 items-center justify-between border-b bg-background/60 px-4">
      <div className="z-10 flex items-center gap-2">
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
