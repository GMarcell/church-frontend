import { api } from "@/lib/api";
import { toPaginatedResult } from "@/lib/helper";
import {
  Branch,
  BranchCount,
  CreateBranchDto,
  UpdateBranchDto,
} from "@/type/branch";
import {
  PaginatedResult,
  PaginationParams,
  StandardResponse,
} from "@/type/shared";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const branchKeys = {
  all: ["branches"] as const,
  list: (params: PaginationParams) => ["branches", "list", params] as const,
  counts: ["branches", "count"] as const,
  detail: (id: string) => ["branches", id] as const,
};

export const getBranchesCount = async (): Promise<BranchCount[]> => {
  const res =
    await api.get<StandardResponse<BranchCount[]>>("/v1/branches/count");
  if (!res.success) {
    throw new Error("Failed to fetch branches count");
  }
  return res.data;
};

export const getBranches = async (
  params: PaginationParams,
): Promise<PaginatedResult<Branch>> => {
  const res = await api.get<StandardResponse<unknown>, PaginationParams>(
    "/v1/branches",
    params,
  );
  if (!res.success) {
    throw new Error("Failed to fetch branches");
  }
  return toPaginatedResult(res.data as never, params.page, params.limit);
};

export const getBranchById = async (id: string): Promise<Branch> => {
  const res = await api.get<StandardResponse<Branch>>(`/v1/branches/${id}`);
  if (!res.success) {
    throw new Error("Failed to fetch branch");
  }
  return res.data;
};

export const createBranch = async (data: CreateBranchDto): Promise<Branch> => {
  const res = await api.post<StandardResponse<Branch>, CreateBranchDto>(
    "/v1/branches",
    data,
  );
  if (!res.success) {
    throw new Error("Failed to create branch");
  }
  return res.data;
};

export const updateBranch = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateBranchDto;
}): Promise<Branch> => {
  const res = await api.patch<StandardResponse<Branch>, UpdateBranchDto>(
    `/v1/branches/${id}`,
    data,
  );
  if (!res.success) {
    throw new Error("Failed to update branch");
  }
  return res.data;
};

export const deleteBranch = async (id: string) => {
  const res = await api.delete<StandardResponse<Branch>>(`/v1/branches/${id}`);
  if (!res.success) {
    throw new Error("Failed to delete branch");
  }
  return res.data;
};

export const useBranchesCount = () => {
  return useQuery({
    queryKey: branchKeys.counts,
    queryFn: getBranchesCount,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useBranches = (params: PaginationParams) => {
  return useQuery({
    queryKey: branchKeys.list(params),
    queryFn: () => getBranches(params),
    retry: 1,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
};

export const useBranch = (id: string) => {
  return useQuery({
    queryKey: branchKeys.detail(id),
    queryFn: () => getBranchById(id),
    enabled: Boolean(id),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBranch,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: branchKeys.all }),
        queryClient.invalidateQueries({ queryKey: branchKeys.counts }),
      ]);
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: branchKeys.all }),
        queryClient.invalidateQueries({ queryKey: branchKeys.counts }),
      ]);
    },
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBranch,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: branchKeys.all }),
        queryClient.invalidateQueries({ queryKey: branchKeys.counts }),
        queryClient.invalidateQueries({
          queryKey: branchKeys.detail(variables.id),
        }),
      ]);
    },
  });
};
