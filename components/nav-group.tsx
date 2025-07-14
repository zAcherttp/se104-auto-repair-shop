"use client";

import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar";
import { memo, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Label } from "./ui/label";

type NavGroupProps = {
  items: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
  label: string;
};

export const NavGroup = memo(function NavGroup({
  items,
  label,
}: NavGroupProps) {
  const pathname = usePathname();

  // Memoize the isActive function to prevent recreation on every render
  const isActive = useMemo(() => {
    return (url: string) => pathname === url;
  }, [pathname]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="uppercase font-semibold text-muted-foreground">
        {label}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              isActive={isActive(item.url)}
              asChild
              tooltip={item.name}
              className="text-muted-foreground"
            >
              <a href={item.url}>
                {item.icon ? <item.icon /> : null}
                <Label>{item.name}</Label>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
});
