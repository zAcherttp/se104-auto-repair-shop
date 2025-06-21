"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/app-header";
import { ScrollArea } from "./ui/scroll-area";

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <ScrollArea>{children}</ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
