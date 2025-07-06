"use client";

import { getIsAdmin } from "@/app/actions/general";
import { useQuery } from "@tanstack/react-query";

export const ADMIN_QUERY_KEY = "admin";

export const useAdmin = () => {
    return useQuery({
        queryKey: [ADMIN_QUERY_KEY],
        queryFn: async (): Promise<boolean> => {
            const result = await getIsAdmin();
            if (!result.success) {
                throw new Error(result.error || "Failed to fetch admin status");
            }
            return result.data || false;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
};
