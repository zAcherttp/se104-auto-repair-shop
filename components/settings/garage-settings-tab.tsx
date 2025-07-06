"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getSystemSettings, updateSystemSetting } from "@/app/actions/settings";
import type { SystemSetting } from "@/types/settings";

export default function GarageSettingsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    garageName: "",
    phoneNumber: "",
    emailAddress: "",
    address: "",
    maximumCarCapacity: "",
    maxPartsPerMonth: "",
    maxLaborTypesPerMonth: "",
  });

  const fetchSettings = useCallback(async () => {
    try {
      const response = await getSystemSettings();
      if (response.success && response.data) {
        // Convert settings array to form data
        const settingsMap = (response.data as SystemSetting[]).reduce(
          (acc: Record<string, string>, setting: SystemSetting) => {
            acc[setting.setting_key] = setting.setting_value;
            return acc;
          },
          {}
        );

        setFormData({
          garageName: settingsMap.garage_name || "",
          phoneNumber: settingsMap.phone_number || "",
          emailAddress: settingsMap.email_address || "",
          address: settingsMap.address || "",
          maximumCarCapacity: settingsMap.maximum_car_capacity || "",
          maxPartsPerMonth: settingsMap.max_parts_per_month || "",
          maxLaborTypesPerMonth: settingsMap.max_labor_types_per_month || "",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load garage settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const settingUpdates = [
        { key: "garage_name", value: formData.garageName },
        { key: "phone_number", value: formData.phoneNumber },
        { key: "email_address", value: formData.emailAddress },
        { key: "address", value: formData.address },
        { key: "maximum_car_capacity", value: formData.maximumCarCapacity },
        { key: "max_parts_per_month", value: formData.maxPartsPerMonth },
        {
          key: "max_labor_types_per_month",
          value: formData.maxLaborTypesPerMonth,
        },
      ];

      const updatePromises = settingUpdates.map((setting) =>
        updateSystemSetting(setting.key, setting.value)
      );

      const responses = await Promise.all(updatePromises);

      const failedUpdate = responses.find((response) => !response.success);
      if (failedUpdate) {
        throw new Error(failedUpdate.error || "Failed to update setting");
      }

      toast.success("Garage settings updated successfully");

      await fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save garage settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="garageName">Garage Name</Label>
            <Input
              id="garageName"
              value={formData.garageName}
              onChange={(e) => handleInputChange("garageName", e.target.value)}
              placeholder="AutoRepair Shop"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maximumCarCapacity">Maximum Car Capacity</Label>
            <Input
              id="maximumCarCapacity"
              type="number"
              value={formData.maximumCarCapacity}
              onChange={(e) =>
                handleInputChange("maximumCarCapacity", e.target.value)
              }
              placeholder="50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailAddress">Email Address</Label>
            <Input
              id="emailAddress"
              type="email"
              value={formData.emailAddress}
              onChange={(e) =>
                handleInputChange("emailAddress", e.target.value)
              }
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxPartsPerMonth">Max Parts</Label>
            <Input
              id="maxPartsPerMonth"
              type="number"
              value={formData.maxPartsPerMonth}
              onChange={(e) =>
                handleInputChange("maxPartsPerMonth", e.target.value)
              }
              placeholder="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxLaborTypesPerMonth">Max Labor Types</Label>
            <Input
              id="maxLaborTypesPerMonth"
              type="number"
              value={formData.maxLaborTypesPerMonth}
              onChange={(e) =>
                handleInputChange("maxLaborTypesPerMonth", e.target.value)
              }
              placeholder="50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="Enter garage address"
            rows={3}
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-32"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
