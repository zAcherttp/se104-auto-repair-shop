import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "./ui/dialog";
import { Button } from "./ui/button";
import Image from "next/image";
import { getPaymentImageURL } from "@/lib/utils";

type PaymentDialogProps = {
  showPaymentDialog: boolean;
  setShowPaymentDialog: (show: boolean) => void;
  selectedOrder: {
    vehicle?: { license_plate: string };
    total_amount?: number;
    paid_amount?: number;
  };
};

export default function PaymentDialog({
  showPaymentDialog,
  setShowPaymentDialog,
  selectedOrder,
}: PaymentDialogProps) {
  const paymentImgUrl = getPaymentImageURL({
    bankCode: process.env.VIETQR_BANKCODE || "N/A",
    destinationAccount: process.env.VIETQR_DESTINATION_ACCOUNT || "N/A",
    amount:
      (selectedOrder.total_amount || 0) - (selectedOrder.paid_amount || 0),
    description: `Payment for ${
      selectedOrder.vehicle?.license_plate || "vehicle"
    }`,
  });

  return (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Payment for {selectedOrder.vehicle?.license_plate}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-2">Payment Amount Due:</p>
            <p className="text-2xl font-bold text-green-600">
              $
              {(
                (selectedOrder.total_amount || 0) -
                (selectedOrder.paid_amount || 0)
              ).toFixed(2)}
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
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
