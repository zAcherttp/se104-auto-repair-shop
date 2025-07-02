import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import Image from "next/image";
import { getPaymentImageURL } from "@/lib/utils";
import { RepairOrderWithVehicleDetails } from "@/types";

type PaymentDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  repairOrderWithVehicleDetail?: RepairOrderWithVehicleDetails;
};

export default function PaymentDialog({
  open,
  onClose,
  onSuccess,
  repairOrderWithVehicleDetail,
}: PaymentDialogProps) {
  // Show loading state if dialog is open but data is not ready
  if (
    open &&
    (!repairOrderWithVehicleDetail?.vehicle ||
      !repairOrderWithVehicleDetail?.total_amount)
  ) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading payment data...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!open || !repairOrderWithVehicleDetail) return null;

  // Calculate total vehicle debt vs total vehicle payments
  const totalVehiclePaid =
    repairOrderWithVehicleDetail.vehicle.payments?.reduce(
      (sum, payment) => sum + payment.amount,
      0
    ) || 0;
  const debtAmount = Math.max(
    0,
    (repairOrderWithVehicleDetail.total_amount || 0) - totalVehiclePaid
  );

  // Don't show dialog if there's no debt
  if (debtAmount <= 0) {
    return null;
  }

  const paymentImgUrl = getPaymentImageURL({
    bankCode: process.env.NEXT_PUBLIC_VIETQR_BANKCODE || "N/A",
    destinationAccount:
      process.env.NEXT_PUBLIC_VIETQR_DESTINATION_ACCOUNT || "N/A",
    amount: debtAmount,
    description: `Payment for ${repairOrderWithVehicleDetail.vehicle.license_plate}`,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby="payment-qr-code" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Payment QR Code
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-2">Payment Amount Due:</p>
            <p className="text-2xl font-bold text-green-600">
              ${debtAmount.toFixed(2)}
            </p>
            <Image
              src={paymentImgUrl}
              alt="Payment QR Code"
              width={400}
              height={400}
              className="mx-auto mt-4"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => {
                onSuccess();
                onClose();
              }}
            >
              Confirm Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
