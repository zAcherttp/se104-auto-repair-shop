"use client";

import * as React from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import { Poppins } from "next/font/google";
import { memo } from "react";
import { useRouter } from "next/navigation";
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
          <div className="flex gap-2 aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <garage.logo className="h-6 w-6" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <Label
              className={`${poppins.variable} truncate font-semibold text-xl text-foreground`}
            >
              {garage.name}
            </Label>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
});
