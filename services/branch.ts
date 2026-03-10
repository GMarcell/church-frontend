import { api } from "@/lib/api";
import { Branch, BranchCount } from "@/type/branch";
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

export const getBranches = async (): Promise<Branch[]> => {
  const res = await api.get<StandardResponse<Branch[]>>("/v1/branches");
  if (!res.success) {
    throw new Error("Failed to fetch branches data");
  }
  return res.data;
};

export const useBranches = () => {
  return useQuery({
    queryKey: [branchKey],
    queryFn: () => getBranches(),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
