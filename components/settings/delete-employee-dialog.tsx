"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  employeeName?: string;
  loading?: boolean;
}

export function DeleteEmployeeDialog({
  open,
  onOpenChange,
  onConfirm,
  employeeName,
  loading = false,
}: DeleteEmployeeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete Employee</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                {employeeName ? `"${employeeName}"` : "this employee"}?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border">
          <p className="font-medium text-foreground mb-2">This action will:</p>
          <ul className="space-y-1">
            <li>• Permanently delete the employee account</li>
            <li>• Remove all associated data and permissions</li>
            <li>• Cannot be undone</li>
          </ul>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete Employee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
