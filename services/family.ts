import { api } from "@/lib/api";
import { StandardResponse } from "@/type/shared";
import { useQuery } from "@tanstack/react-query";

const familyKey = "family";

export const getFamiliesCount = async (): Promise<{ all: number }> => {
  const res =
    await api.get<StandardResponse<{ all: number }>>("/v1/families/count");
  if (!res.success) {
    throw new Error("Failed to fetch family data");
  }
  return res.data;
};

export const useFamiliesCount = () => {
  return useQuery({
    queryKey: [familyKey],
    queryFn: () => getFamiliesCount(),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
