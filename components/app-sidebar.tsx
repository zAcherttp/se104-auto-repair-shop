"use client";

import {
  BarChart3,
  Car,
  ClipboardList,
  Cog,
  CreditCard,
  Package2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";
import { NavGroup } from "./nav-group";
import { AppBanner } from "./sidebar-banner";
import { Sidebar, SidebarContent, SidebarHeader } from "./ui/sidebar";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isAdmin?: boolean;
}

import { useGarageInfo } from "@/hooks/use-garage-info";

export const AppSidebar = memo(function AppSidebar({
  isAdmin,
  ...props
}: AppSidebarProps) {
  const t = useTranslations("navigation");
  const tSidebar = useTranslations("sidebar");

  // Memoize the dashboard items array with translations
  const dashboardItems = useMemo(
    () => [
      { name: t("reception"), url: "/reception", icon: ClipboardList },
      { name: t("vehicles"), url: "/vehicles", icon: Car },
      { name: t("payments"), url: "/payments", icon: CreditCard },
      { name: t("inventory"), url: "/inventory", icon: Package2 },
      { name: t("reports"), url: "/reports", icon: BarChart3 },
    ],
    [t],
  );

  // Memoize the admin items array with translations
  const adminItems = useMemo(
    () => [{ name: t("settings"), url: "/settings", icon: Cog }],
    [t],
  );

  // Memoize garage items based on admin status
  const garageItems = useMemo(() => {
    return isAdmin ? adminItems : [];
  }, [isAdmin, adminItems]);

  const { data: garageInfo } = useGarageInfo();
  const garageData = {
    name: garageInfo?.garageName || "My Garage",
    logo: Package2, // Keep default until banner image implemented
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppBanner garage={garageData} />
      </SidebarHeader>
      <SidebarContent>
        <NavGroup items={dashboardItems} label={tSidebar("dashboard")} />
        {garageItems.length > 0 && (
          <NavGroup items={garageItems} label={tSidebar("garage")} />
        )}
      </SidebarContent>
    </Sidebar>
  );
});
