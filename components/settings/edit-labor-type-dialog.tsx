"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateLaborType } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LaborType } from "@/types/settings";

interface EditLaborTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  laborType: LaborType | null;
  onSuccess: () => void;
}

export function EditLaborTypeDialog({
  open,
  onOpenChange,
  laborType,
  onSuccess,
}: EditLaborTypeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    cost: "",
  });

  useEffect(() => {
    if (laborType) {
      setFormData({
        name: laborType.name,
        cost: laborType.cost.toString(),
      });
    }
  }, [laborType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!laborType || !formData.name || !formData.cost) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("cost", formData.cost);

      const response = await updateLaborType(laborType.id, formDataObj);

      if (response.success) {
        toast.success("Labor type updated successfully");
        onSuccess();
      } else {
        toast.error(response.error || "Failed to update labor type");
      }
    } catch (error) {
      console.error("Error updating labor type:", error);
      toast.error("Failed to update labor type");
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
          <DialogTitle>Edit Labor Type</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter labor type name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Cost</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              value={formData.cost}
              onChange={(e) => handleInputChange("cost", e.target.value)}
              placeholder="Enter cost"
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
              {loading ? "Updating..." : "Update Labor Type"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
