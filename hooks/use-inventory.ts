import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/supabase/client";
import { SparePart } from "@/types/types";

export const useInventory = () => {
    const fetchSpareParts = async (): Promise<SparePart[]> => {
        const supabase = createClient();

        const { data, error } = await supabase
            .from("spare_parts")
            .select("*")
            .order("name", { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        return data as SparePart[];
    };

    const queryResult = useQuery({
        queryKey: ["spare_parts"],
        queryFn: fetchSpareParts,
    });

    return queryResult;
};
