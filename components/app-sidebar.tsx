"use client";

import {
  BarChart3,
  Car,
  Cog,
  CreditCard,
  Package2,
  ClipboardList,
} from "lucide-react";
import { NavGroup } from "./nav-group";
import { Sidebar, SidebarContent, SidebarHeader } from "./ui/sidebar";
import { AppBanner } from "./sidebar-banner";
import { useMemo } from "react";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isAdmin?: boolean;
}

export function AppSidebar({ isAdmin, ...props }: AppSidebarProps) {
  const data = useMemo(
    () => ({
      garageInfo: {
        name: "My Garage",
        logo: Package2,
      },
      dashboardItems: [
        { name: "Reception", url: "/reception", icon: ClipboardList },
        { name: "Vehicles", url: "/vehicles", icon: Car },
        { name: "Invoices", url: "/invoices", icon: CreditCard },
        { name: "Inventory", url: "/inventory", icon: Package2 },
        { name: "Reports", url: "/reports", icon: BarChart3 },
      ],
      garageItems: isAdmin
        ? [{ name: "Settings", url: "/settings", icon: Cog }]
        : [],
    }),
    [isAdmin]
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppBanner garage={data.garageInfo} />
      </SidebarHeader>
      <SidebarContent>
        <NavGroup items={data.dashboardItems} label="Dashboard" />
        {data.garageItems.length > 0 && (
          <NavGroup items={data.garageItems} label="Garage" />
        )}
      </SidebarContent>
    </Sidebar>
  );
}
