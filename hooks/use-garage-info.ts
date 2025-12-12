import { useQuery } from "@tanstack/react-query";
import { getGarageInfo } from "@/app/actions/settings";

export function useGarageInfo() {
  return useQuery({
    queryKey: ["garage-info"],
    queryFn: async () => {
      const response = await getGarageInfo();
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
}
