"use client";

import type { LucideIcon } from "lucide-react";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import * as React from "react";
import { memo } from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar";
import { Label } from "./ui/label";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
  variable: "--font-poppins",
});

export const AppBanner = memo(function AppBanner({
  garage,
}: {
  garage: { name: string; logo: LucideIcon };
}) {
  const router = useRouter();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          onClick={() => router.push("/reception")}
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center gap-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <garage.logo className="h-6 w-6" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <Label
              className={`${poppins.variable} truncate font-semibold text-foreground text-xl`}
            >
              {garage.name}
            </Label>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
});
