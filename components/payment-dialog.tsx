import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import Image from "next/image";
import { getPaymentImageURL } from "@/lib/utils";
import { RepairOrderWithVehicleDetails } from "@/types";

type PaymentDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedRepairOrderWithVehicleDetail?: RepairOrderWithVehicleDetails;
};

export default function PaymentDialog({
  open,
  onClose,
  onSuccess,
  selectedRepairOrderWithVehicleDetail,
}: PaymentDialogProps) {
  if (
    !selectedRepairOrderWithVehicleDetail?.vehicle ||
    !selectedRepairOrderWithVehicleDetail?.total_amount ||
    selectedRepairOrderWithVehicleDetail?.paid_amount === null ||
    selectedRepairOrderWithVehicleDetail?.paid_amount === undefined
  ) {
    return null;
  }

  const debtAmount =
    selectedRepairOrderWithVehicleDetail.total_amount -
    (selectedRepairOrderWithVehicleDetail.paid_amount || 0);

  // Don't show dialog if there's no debt
  if (debtAmount <= 0) {
    return null;
  }

  const paymentImgUrl = getPaymentImageURL({
    bankCode: process.env.NEXT_PUBLIC_VIETQR_BANKCODE || "N/A",
    destinationAccount:
      process.env.NEXT_PUBLIC_VIETQR_DESTINATION_ACCOUNT || "N/A",
    amount: debtAmount,
    description: `Payment for ${selectedRepairOrderWithVehicleDetail.vehicle.license_plate}`,
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
            {" "}
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
