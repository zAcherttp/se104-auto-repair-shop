"use client";

import { Plus, Save, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getCarBrands, updateCarBrands } from "@/app/actions/settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
          (brand) => brand.trim() !== "",
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
        (brand) => brand.toLowerCase() === trimmedBrand.toLowerCase(),
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
            <div className="h-4 w-1/4 rounded bg-muted" />
            <div className="h-10 rounded bg-muted" />
            <div className="h-10 rounded bg-muted" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 w-20 rounded bg-muted" />
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
              <Plus className="mr-2 h-4 w-4" />
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
            <p className="text-muted-foreground text-sm">{t("noBrands")}</p>
          ) : (
            <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/50 p-4">
              {carBrands.map((brand, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1 text-sm"
                >
                  {brand}
                  <button
                    onClick={() => handleRemoveBrand(index)}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    title={`Remove ${brand}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end border-t pt-4">
          <Button
            onClick={handleSaveChanges}
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? t("saving") : t("saveChanges")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
