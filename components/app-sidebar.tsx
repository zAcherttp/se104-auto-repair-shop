"use client";

import type * as React from "react";
import {
  BarChart3,
  Car,
  ClipboardList,
  Cog,
  CreditCard,
  Package2,
} from "lucide-react";
import { NavGroup } from "./nav-group";
import { Sidebar, SidebarContent, SidebarHeader } from "./ui/sidebar";
import { AppBanner } from "./sidebar-banner";
import { useMemo } from "react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = useMemo(
    () => ({
      garageInfo: {
        name: "My Garage",
        logo: Package2,
      },
      dashboardItems: [
        { name: "Vehicles", url: "/vehicles", icon: Car },
        { name: "Tasks", url: "/tasks", icon: ClipboardList },
        { name: "Invoices", url: "/invoices", icon: CreditCard },
        { name: "Inventory", url: "/inventory", icon: Package2 },
        { name: "Reports", url: "/reports", icon: BarChart3 },
      ],
      garageItems: [{ name: "Settings", url: "/settings/garage", icon: Cog }],
    }),
    []
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppBanner garage={data.garageInfo} />
      </SidebarHeader>
      <SidebarContent>
        <NavGroup items={data.dashboardItems} label="Dashboard" />
        <NavGroup items={data.garageItems} label="Garage" />
      </SidebarContent>
    </Sidebar>
  );
}
