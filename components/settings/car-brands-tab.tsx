"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save } from "lucide-react";
import { toast } from "sonner";
import { getCarBrands, updateCarBrands } from "@/app/actions/settings";

export default function CarBrandsTab() {
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
      toast.error("Please enter a car brand name");
      return;
    }

    if (
      carBrands.some(
        (brand) => brand.toLowerCase() === trimmedBrand.toLowerCase()
      )
    ) {
      toast.error("This car brand already exists");
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
        toast.success("Car brands updated successfully");
        await fetchCarBrands();
      } else {
        throw new Error(response.error || "Failed to update car brands");
      }
    } catch (error) {
      console.error("Error saving car brands:", error);
      toast.error("Failed to save car brands");
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
        <CardHeader>
          <CardTitle>Car Brands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
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
          <Label htmlFor="newBrand">Add New Car Brand</Label>
          <div className="flex gap-2">
            <Input
              id="newBrand"
              placeholder="Enter car brand name (e.g., Toyota, BMW)"
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleAddBrand} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Current Brands */}
        <div className="space-y-2">
          <Label>Current Car Brands ({carBrands.length})</Label>
          {carBrands.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No car brands configured. Add some brands to get started.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-gray-50">
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
