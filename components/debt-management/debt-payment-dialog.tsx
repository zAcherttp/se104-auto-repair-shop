"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { VehicleDebt } from "@/types/debt-management";
import { processPayment } from "@/app/actions/debt-management";
import { getPaymentImageURL } from "@/lib/utils";

interface DebtPaymentDialogProps {
  trigger: React.ReactNode;
  vehicleDebt: VehicleDebt;
}

export function DebtPaymentDialog({
  trigger,
  vehicleDebt,
}: DebtPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(
    vehicleDebt.remaining_debt.toString()
  );
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const handleGenerateQR = async () => {
    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > vehicleDebt.remaining_debt) {
      toast.error("Invalid payment amount");
      return;
    }

    try {
      // Generate QR payment image using VietQR
      const qrUrl = getPaymentImageURL({
        bankCode: "970422", // Default bank code (MB Bank)
        destinationAccount: "0123456789", // Default garage account
        amount,
        description: `Payment for ${vehicleDebt.vehicle.license_plate} - ${vehicleDebt.vehicle.customer.name}`,
        accountName: "Auto Repair Shop",
        template: "compact2",
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    }
  };

  const handleProcessPayment = async () => {
    const amount = parseFloat(paymentAmount);

    if (amount <= 0) {
      toast.error("Payment amount must be greater than 0");
      return;
    }

    if (amount > vehicleDebt.remaining_debt) {
      toast.error("Payment amount cannot exceed remaining debt");
      return;
    }

    setLoading(true);
    try {
      const response = await processPayment(
        vehicleDebt.vehicle.id,
        amount,
        paymentMethod
      );

      if (response.success) {
        toast.success("Payment processed successfully");
        setOpen(false);
        // Trigger parent refresh
        window.location.reload();
      } else {
        toast.error(response.error || "Failed to process payment");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    if (numValue <= vehicleDebt.remaining_debt) {
      setPaymentAmount(value);
      setQrCodeUrl(null); // Clear QR code when amount changes
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Vehicle:</strong> {vehicleDebt.vehicle.license_plate}
            </div>
            <div>
              <strong>Customer:</strong> {vehicleDebt.vehicle.customer.name}
            </div>
            <div>
              <strong>Total Debt:</strong> ${vehicleDebt.total_debt.toFixed(2)}
            </div>
            <div>
              <strong>Remaining:</strong> $
              {vehicleDebt.remaining_debt.toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={vehicleDebt.remaining_debt}
              value={paymentAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Enter payment amount"
            />
            <p className="text-xs text-muted-foreground">
              Maximum: ${vehicleDebt.remaining_debt.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="check">Check</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateQR}
              className="flex-1"
            >
              Generate QR Code
            </Button>
            <Button
              onClick={handleProcessPayment}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Processing..." : "Process Payment"}
            </Button>
          </div>

          {qrCodeUrl && (
            <div className="flex flex-col items-center space-y-2">
              <Image
                src={qrCodeUrl}
                alt="Payment QR Code"
                width={192}
                height={192}
                className="border rounded"
              />
              <p className="text-xs text-muted-foreground text-center">
                QR Code for payment of ${parseFloat(paymentAmount).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
