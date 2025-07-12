"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "../ui/button";
import { Building2, Users, Package, Wrench, Car } from "lucide-react";
import GarageSettingsTab from "./garage-settings-tab";
import EmployeesTab from "./employees-tab";
import PartsTab from "./parts-tab";
import LaborTypesTab from "./labor-types-tab";
import CarBrandsTab from "./car-brands-tab";

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
      className="w-full h-full"
    >
      <div className="flex h-full gap-4">
        <TabsList className="flex flex-col h-fit w-48 justify-start p-2 bg-muted/30">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} asChild>
                <Button
                  className={`w-full justify-start p-3 rounded-md text-left font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 transform ${
                    activeTab === tab.value
                      ? "bg-primary text-primary shadow-sm"
                      : "bg-transparent text-sidebar-foreground hover:bg-muted"
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="flex-1 h-full overflow-hidden">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className={`h-full m-0 transition-all duration-300 ease-out ${
                activeTab === tab.value
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-5 pointer-events-none"
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
