"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateSparePart } from "@/app/actions/settings";
import type { SparePart } from "@/types/settings";

interface EditPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  part: SparePart | null;
  onSuccess: () => void;
}

export function EditPartDialog({
  open,
  onOpenChange,
  part,
  onSuccess,
}: EditPartDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stockQuantity: "",
  });

  useEffect(() => {
    if (part) {
      setFormData({
        name: part.name,
        price: part.price.toString(),
        stockQuantity: part.stock_quantity?.toString() || "",
      });
    }
  }, [part]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!part || !formData.name || !formData.price || !formData.stockQuantity) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("price", formData.price);
      formDataObj.append("stockQuantity", formData.stockQuantity);

      const response = await updateSparePart(part.id, formDataObj);

      if (response.success) {
        toast.success("Part updated successfully");
        onSuccess();
      } else {
        toast.error(response.error || "Failed to update part");
      }
    } catch (error) {
      console.error("Error updating part:", error);
      toast.error("Failed to update part");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Part</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter part name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              placeholder="Enter price"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stockQuantity">Stock Quantity</Label>
            <Input
              id="stockQuantity"
              type="number"
              min="0"
              value={formData.stockQuantity}
              onChange={(e) =>
                handleInputChange("stockQuantity", e.target.value)
              }
              placeholder="Enter stock quantity"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Part"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
