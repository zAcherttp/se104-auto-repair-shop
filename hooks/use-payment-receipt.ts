import { useQuery } from "@tanstack/react-query";
import {
    fetchPaymentReceiptDetails,
    PaymentReceiptData,
} from "@/app/actions/payments";

interface UsePaymentReceiptProps {
    paymentId: string;
    enabled?: boolean;
}

export const usePaymentReceipt = (
    { paymentId, enabled = true }: UsePaymentReceiptProps,
) => {
    return useQuery({
        queryKey: ["payment-receipt", paymentId],
        queryFn: async () => {
            const result = await fetchPaymentReceiptDetails(paymentId);
            if (result.error) {
                throw result.error;
            }
            return result.data as PaymentReceiptData;
        },
        enabled: enabled && Boolean(paymentId),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
