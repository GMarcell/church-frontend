import { api } from "@/lib/api";
import { BranchCount } from "@/type/branch";
import { StandardResponse } from "@/type/shared";
import { useQuery } from "@tanstack/react-query";

const branchKey = "branch";

export const getBranchesCount = async (): Promise<BranchCount[]> => {
  const res =
    await api.get<StandardResponse<BranchCount[]>>("/v1/branches/count");
  if (!res.success) {
    throw new Error("Failed to fetch branches data");
  }
  return res.data;
};

export const useBranchesCount = () => {
  return useQuery({
    queryKey: [branchKey],
    queryFn: () => getBranchesCount(),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
