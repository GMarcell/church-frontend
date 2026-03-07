import { api } from "@/lib/api";
import { RegionCount } from "@/type/region";
import { StandardResponse } from "@/type/shared";
import { useQuery } from "@tanstack/react-query";

const regionKey = "region";

export const getRegionsCount = async (): Promise<RegionCount[]> => {
  const res =
    await api.get<StandardResponse<RegionCount[]>>("/v1/regions/count");
  if (!res.success) {
    throw new Error("Failed to fetch regions data");
  }
  return res.data;
};

export const useRegionsCount = () => {
  return useQuery({
    queryKey: [regionKey],
    queryFn: () => getRegionsCount(),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
