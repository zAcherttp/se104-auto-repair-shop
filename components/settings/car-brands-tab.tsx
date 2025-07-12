"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getCarBrands, updateCarBrands } from "@/app/actions/settings";

export default function CarBrandsTab() {
  const t = useTranslations("settings.brands");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [carBrands, setCarBrands] = useState<string[]>([]);
  const [newBrand, setNewBrand] = useState("");

  const fetchCarBrands = useCallback(async () => {
    try {
      const response = await getCarBrands();
      if (response.success && response.data) {
        // Filter out empty strings and ensure unique brands
        const validBrands = response.data.filter(
          (brand) => brand.trim() !== ""
        );
        setCarBrands(validBrands);
      }
    } catch (error) {
      console.error("Error fetching car brands:", error);
      toast.error("Failed to load car brands");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCarBrands();
  }, [fetchCarBrands]);

  const handleAddBrand = () => {
    const trimmedBrand = newBrand.trim();
    if (!trimmedBrand) {
      toast.error(t("enterBrandError"));
      return;
    }

    if (
      carBrands.some(
        (brand) => brand.toLowerCase() === trimmedBrand.toLowerCase()
      )
    ) {
      toast.error(t("brandExistsError"));
      return;
    }

    setCarBrands((prev) => [...prev, trimmedBrand]);
    setNewBrand("");
  };

  const handleRemoveBrand = (indexToRemove: number) => {
    setCarBrands((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const response = await updateCarBrands(carBrands);
      if (response.success) {
        toast.success(t("saveSuccess"));
        await fetchCarBrands();
      } else {
        throw new Error(response.error || "Failed to update car brands");
      }
    } catch (error) {
      console.error("Error saving car brands:", error);
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddBrand();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded w-20"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        {/* Add New Brand */}
        <div className="space-y-2">
          <Label htmlFor="newBrand">{t("addNewBrand")}</Label>
          <div className="flex gap-2">
            <Input
              id="newBrand"
              placeholder={t("placeholder")}
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleAddBrand} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              {t("addButton")}
            </Button>
          </div>
        </div>

        {/* Current Brands */}
        <div className="space-y-2">
          <Label>
            {t("currentBrands")} ({carBrands.length})
          </Label>
          {carBrands.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noBrands")}</p>
          ) : (
            <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/50">
              {carBrands.map((brand, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-sm px-3 py-1 flex items-center gap-2"
                >
                  {brand}
                  <button
                    onClick={() => handleRemoveBrand(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    title={`Remove ${brand}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSaveChanges}
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? t("saving") : t("saveChanges")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
