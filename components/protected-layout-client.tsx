"use client";

import React, { type ReactNode } from "react";
import { Header } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdmin } from "@/hooks/use-admin";

interface ProtectedLayoutClientProps {
  children: ReactNode;
}

export function ProtectedLayoutClient({
  children,
}: ProtectedLayoutClientProps) {
  const { data: isAdmin, isLoading } = useAdmin();

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="w-[240px] border-r bg-background">
          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        </div>
        <SidebarInset>
          <Header />
          {children}
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar isAdmin={isAdmin} />
      <SidebarInset>
        <Header />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
