import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/supabase/client";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { PaymentWithDetails } from "@/types";

interface UsePaymentsProps {
    initialDateRange?: DateRange;
}

export const usePayments = ({ initialDateRange }: UsePaymentsProps = {}) => {
    const [dateRange, setDateRange] = useState<DateRange>(
        initialDateRange || {
            from: new Date(),
            to: new Date(),
        },
    );

    const fetchPayments = async (): Promise<PaymentWithDetails[]> => {
        const supabase = createClient();

        let query = supabase
            .from("payments")
            .select(`
        *,
        vehicle:vehicles(
          *,
          customer:customers(*)
        ),
        created_by_profile:profiles!payments_created_by_fkey(
          full_name,
          email
        )
      `)
            .order("payment_date", { ascending: false });

        // Apply date range filter if both dates are provided
        if (dateRange?.from && dateRange?.to) {
            const fromDate = new Date(dateRange.from);
            const toDate = new Date(dateRange.to);

            // Set time to start and end of day
            fromDate.setHours(0, 0, 0, 0);
            toDate.setHours(23, 59, 59, 999);

            query = query
                .gte("payment_date", fromDate.toISOString().split("T")[0])
                .lte("payment_date", toDate.toISOString().split("T")[0]);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(error.message);
        }

        return data as PaymentWithDetails[];
    };

    const queryResult = useQuery({
        queryKey: ["payments", dateRange],
        queryFn: fetchPayments,
        enabled: Boolean(dateRange?.from && dateRange?.to),
    });

    const updateDateRange = (newDateRange: DateRange) => {
        setDateRange(newDateRange);
    };

    return {
        ...queryResult,
        dateRange,
        updateDateRange,
    };
};
