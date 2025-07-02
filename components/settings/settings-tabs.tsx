"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GarageSettingsTab from "./garage-settings-tab";
import EmployeesTab from "./employees-tab";
import PartsTab from "./parts-tab";
import LaborTypesTab from "./labor-types-tab";

export function SettingsTabs() {
  return (
    <Tabs defaultValue="garage" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="garage">Garage Settings</TabsTrigger>
        <TabsTrigger value="employees">Employees</TabsTrigger>
        <TabsTrigger value="parts">Parts</TabsTrigger>
        <TabsTrigger value="labor">Labor Types</TabsTrigger>
      </TabsList>

      <TabsContent value="garage" className="space-y-4">
        <GarageSettingsTab />
      </TabsContent>

      <TabsContent value="employees" className="space-y-4">
        <EmployeesTab />
      </TabsContent>

      <TabsContent value="parts" className="space-y-4">
        <PartsTab />
      </TabsContent>

      <TabsContent value="labor" className="space-y-4">
        <LaborTypesTab />
      </TabsContent>
    </Tabs>
  );
}
