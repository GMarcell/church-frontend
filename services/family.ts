import { api } from "@/lib/api";
import { toPaginatedResult } from "@/lib/helper";
import {
  CreateFamilyDto,
  Family,
  FamilyCount,
  UpdateFamilyDto,
} from "@/type/family";
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

export const familyKeys = {
  all: ["families"] as const,
  list: (params: PaginationParams) => ["families", "list", params] as const,
  counts: ["families", "count"] as const,
  detail: (id: string) => ["families", id] as const,
};

export const getFamiliesCount = async (): Promise<FamilyCount> => {
  const res =
    await api.get<StandardResponse<FamilyCount>>("/v1/families/count");
  if (!res.success) {
    throw new Error("Failed to fetch families count");
  }
  return res.data;
};

export const getFamilies = async (
  params: PaginationParams,
): Promise<PaginatedResult<Family>> => {
  const res = await api.get<StandardResponse<unknown>, PaginationParams>(
    "/v1/families",
    params,
  );
  if (!res.success) {
    throw new Error("Failed to fetch families");
  }
  return toPaginatedResult(res.data as never, params.page, params.limit);
};

export const getFamilyById = async (id: string): Promise<Family> => {
  const res = await api.get<StandardResponse<Family>>(`/v1/families/${id}`);
  if (!res.success) {
    throw new Error("Failed to fetch family");
  }
  return res.data;
};

export const createFamily = async (data: CreateFamilyDto): Promise<Family> => {
  const res = await api.post<StandardResponse<Family>, CreateFamilyDto>(
    "/v1/families",
    data,
  );
  if (!res.success) {
    throw new Error("Failed to create family");
  }
  return res.data;
};

export const updateFamily = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateFamilyDto;
}): Promise<Family> => {
  const res = await api.patch<StandardResponse<Family>, UpdateFamilyDto>(
    `/v1/families/${id}`,
    data,
  );
  if (!res.success) {
    throw new Error("Failed to update family");
  }
  return res.data;
};

export const deleteFamily = async (id: string) => {
  const res = await api.delete<StandardResponse<Family>>(`/v1/families/${id}`);
  if (!res.success) {
    throw new Error("Failed to delete family");
  }
  return res.data;
};

export const useFamiliesCount = () => {
  return useQuery({
    queryKey: familyKeys.counts,
    queryFn: getFamiliesCount,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useFamilies = (params: PaginationParams) => {
  return useQuery({
    queryKey: familyKeys.list(params),
    queryFn: () => getFamilies(params),
    retry: 1,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
};

export const useFamily = (id: string) => {
  return useQuery({
    queryKey: familyKeys.detail(id),
    queryFn: () => getFamilyById(id),
    enabled: Boolean(id),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreateFamily = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFamily,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: familyKeys.all }),
        queryClient.invalidateQueries({ queryKey: familyKeys.counts }),
      ]);
    },
  });
};

export const useDeleteFamily = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFamily,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: familyKeys.all }),
        queryClient.invalidateQueries({ queryKey: familyKeys.counts }),
      ]);
    },
  });
};

export const useUpdateFamily = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFamily,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: familyKeys.all }),
        queryClient.invalidateQueries({ queryKey: familyKeys.counts }),
        queryClient.invalidateQueries({
          queryKey: familyKeys.detail(variables.id),
        }),
      ]);
    },
  });
};
