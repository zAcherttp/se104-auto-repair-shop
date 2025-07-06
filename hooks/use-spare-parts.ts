import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/supabase/client";

export interface SparePart {
    id: string;
    name: string;
    price: number;
    stock_quantity: number;
    minimum_stock: number;
    created_at: string;
    updated_at: string;
}

export const useSparePartsQuery = () => {
    return useQuery({
        queryKey: ["spare-parts"],
        queryFn: async (): Promise<SparePart[]> => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("spare_parts")
                .select("*")
                .order("name");

            if (error) {
                throw new Error(error.message);
            }

            return data || [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
