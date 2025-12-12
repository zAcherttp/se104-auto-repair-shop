"use client";

import { Building2, Car, Package, Users, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "../ui/button";
import CarBrandsTab from "./car-brands-tab";
import EmployeesTab from "./employees-tab";
import GarageSettingsTab from "./garage-settings-tab";
import LaborTypesTab from "./labor-types-tab";
import PartsTab from "./parts-tab";

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState("garage");
  const t = useTranslations("settings");

  const tabs = [
    {
      value: "garage",
      label: t("tabs.garage"),
      icon: Building2,
      component: GarageSettingsTab,
    },
    {
      value: "employees",
      label: t("tabs.employees"),
      icon: Users,
      component: EmployeesTab,
    },
    {
      value: "parts",
      label: t("tabs.parts"),
      icon: Package,
      component: PartsTab,
    },
    {
      value: "labor",
      label: t("tabs.labor"),
      icon: Wrench,
      component: LaborTypesTab,
    },
    {
      value: "brands",
      label: t("tabs.brands"),
      icon: Car,
      component: CarBrandsTab,
    },
  ];

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="h-full w-full"
    >
      <div className="flex h-full gap-4">
        <TabsList className="flex h-fit w-48 flex-col justify-start bg-muted/30 p-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} asChild>
                <Button
                  className={`w-full transform justify-start rounded-md p-3 text-left font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${
                    activeTab === tab.value
                      ? "bg-primary text-primary shadow-sm"
                      : "bg-muted/30 text-sidebar-foreground hover:bg-primary/10"
                  }`}
                >
                  <IconComponent className="mr-2 h-4 w-4" />
                  {tab.label}
                </Button>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="h-full flex-1 overflow-hidden">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className={`m-0 h-full transition-all duration-300 ease-out ${
                activeTab === tab.value
                  ? "translate-x-0 opacity-100"
                  : "pointer-events-none translate-x-5 opacity-0"
              }`}
            >
              <div className="h-full">
                <tab.component />
              </div>
            </TabsContent>
          ))}
        </div>
      </div>
    </Tabs>
  );
}
