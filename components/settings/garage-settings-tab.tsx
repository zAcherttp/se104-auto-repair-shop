"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  getSystemSettings,
  updateSystemSettings,
} from "@/app/actions/settings";
import { uploadBannerImage } from "@/app/actions/upload-banner-image";
import { uploadLogoImage } from "@/app/actions/upload-logo-image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    bannerImageUrl: "",
    logoImageUrl: "",
    logoPosition: "left", // left, right, none
  });
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [logoImageFile, setLogoImageFile] = useState<File | null>(null);

  // Banner image file input handler (must be in component scope, not nested)
  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error("Image file too large. Please select an image under 10MB.");
        e.target.value = ""; // Clear the input
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file (JPEG, PNG, WebP).");
        e.target.value = ""; // Clear the input
        return;
      }

      setBannerImageFile(file);
      // Show preview
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData((prev) => ({
          ...prev,
          bannerImageUrl: ev.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Logo image file input handler
  const handleLogoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error("Image file too large. Please select an image under 10MB.");
        e.target.value = ""; // Clear the input
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file (JPEG, PNG, WebP).");
        e.target.value = ""; // Clear the input
        return;
      }

      setLogoImageFile(file);
      // Show preview
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData((prev) => ({
          ...prev,
          logoImageUrl: ev.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

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
          bannerImageUrl: settingsMap.banner_image_url || "",
          logoImageUrl: settingsMap.logo_image_url || "",
          logoPosition: settingsMap.logo_position || "left",
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
      let bannerImageUrl = formData.bannerImageUrl;
      let logoImageUrl = formData.logoImageUrl;

      // If a new banner file is selected, upload it (and remove previous if exists)
      if (bannerImageFile) {
        const arrayBuffer = await bannerImageFile.arrayBuffer();
        const uploadedUrl = await uploadBannerImage({
          buffer: arrayBuffer,
          fileName: bannerImageFile.name,
          contentType: bannerImageFile.type,
          previousUrl: formData.bannerImageUrl,
        });
        if (uploadedUrl) {
          bannerImageUrl = uploadedUrl;
        } else {
          throw new Error("Failed to upload banner image");
        }
      }

      // If a new logo file is selected, upload it (and remove previous if exists)
      if (logoImageFile) {
        const arrayBuffer = await logoImageFile.arrayBuffer();
        const uploadedUrl = await uploadLogoImage({
          buffer: arrayBuffer,
          fileName: logoImageFile.name,
          contentType: logoImageFile.type,
          previousUrl: formData.logoImageUrl,
        });
        if (uploadedUrl) {
          logoImageUrl = uploadedUrl;
        } else {
          throw new Error("Failed to upload logo image");
        }
      }

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
        { key: "banner_image_url", value: bannerImageUrl },
        { key: "logo_image_url", value: logoImageUrl },
        { key: "logo_position", value: formData.logoPosition },
      ];

      // Use bulk update instead of individual requests
      const response = await updateSystemSettings(settingUpdates);

      if (!response.success) {
        throw new Error(response.error || "Failed to update settings");
      }

      toast.success("Garage settings updated successfully");
      setBannerImageFile(null);
      setLogoImageFile(null);
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
        <CardContent className="p-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="bannerImage">Banner Image</Label>
            <Input
              id="bannerImage"
              type="file"
              accept="image/*"
              onChange={handleBannerImageChange}
              disabled={saving}
            />
            <p className="text-sm text-muted-foreground">
              Upload an image for your garage banner (max 10MB). Images will be
              automatically cropped to 4:1 aspect ratio and optimized to under
              2MB.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoImage">Logo Image</Label>
            <Input
              id="logoImage"
              type="file"
              accept="image/*"
              onChange={handleLogoImageChange}
              disabled={saving}
            />
            <p className="text-sm text-muted-foreground">
              Upload a logo for your garage (max 10MB). Images will be
              automatically cropped to 1:1 aspect ratio (square) and optimized
              to under 1MB. PNG format recommended for transparent backgrounds.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logoPosition">Logo Position</Label>
          <Select
            value={formData.logoPosition}
            onValueChange={(value) => handleInputChange("logoPosition", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select logo position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left Side</SelectItem>
              <SelectItem value="right">Right Side</SelectItem>
              <SelectItem value="none">No Logo Overlay</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Choose where to position the logo. Left/Right will create a
            dedicated square area for the logo.
          </p>
        </div>

        {formData.bannerImageUrl || formData.logoImageUrl ? (
          <div className="space-y-2">
            <Label>Banner Preview</Label>
            <div className="relative w-full bg-gray-100 rounded border overflow-hidden aspect-[4/1]">
              {/* Banner Image */}
              {formData.bannerImageUrl && (
                <div className="absolute inset-0">
                  <Image
                    src={formData.bannerImageUrl}
                    alt="Banner preview"
                    width={2048}
                    height={512}
                    className={`w-full h-full object-cover ${
                      formData.logoPosition === "left"
                        ? "object-[75%_center]"
                        : formData.logoPosition === "right"
                        ? "object-[25%_center]"
                        : "object-center"
                    }`}
                    priority
                  />
                </div>
              )}

              {/* Logo Overlay */}
              {formData.logoImageUrl && formData.logoPosition !== "none" ? (
                <div
                  className={`absolute inset-0 flex items-center ${
                    formData.logoPosition === "left"
                      ? "justify-start pl-16"
                      : "justify-end pr-16"
                  }`}
                >
                  <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center">
                    <Image
                      src={formData.logoImageUrl}
                      alt="Logo preview"
                      width={196}
                      height={196}
                      priority
                    />
                  </div>
                </div>
              ) : null}

              {/* Fallback when no banner */}
              {!formData.bannerImageUrl && formData.logoImageUrl && (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No banner image</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              This is how your banner and logo will appear together. The logo
              will be positioned in a dedicated area and automatically invert
              colors in dark mode for better visibility.
            </p>
          </div>
        ) : null}

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
