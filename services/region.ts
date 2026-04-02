import { api } from "@/lib/api";
import { toPaginatedResult } from "@/lib/helper";
import {
  AssignRegionCoordinatorDto,
  CreateRegionDto,
  RegionCount,
  Regions,
  UpdateRegionDto,
} from "@/type/region";
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

export const regionKeys = {
  all: ["regions"] as const,
  list: (params: PaginationParams) => ["regions", "list", params] as const,
  counts: ["regions", "count"] as const,
  detail: (id: string) => ["regions", id] as const,
};

export const getRegionsCount = async (): Promise<RegionCount[]> => {
  const res =
    await api.get<StandardResponse<RegionCount[]>>("/v1/regions/count");
  if (!res.success) {
    throw new Error("Failed to fetch regions count");
  }
  return res.data;
};

export const getRegions = async (
  params: PaginationParams,
): Promise<PaginatedResult<Regions>> => {
  const res = await api.get<StandardResponse<unknown>, PaginationParams>(
    "/v1/regions",
    params,
  );
  if (!res.success) {
    throw new Error("Failed to fetch regions");
  }
  return toPaginatedResult(res.data as never, params.page, params.limit);
};

export const getRegionById = async (id: string): Promise<Regions> => {
  const res = await api.get<StandardResponse<Regions>>(`/v1/regions/${id}`);
  if (!res.success) {
    throw new Error("Failed to fetch region");
  }
  return res.data;
};

export const createRegion = async (data: CreateRegionDto): Promise<Regions> => {
  const res = await api.post<StandardResponse<Regions>, CreateRegionDto>(
    "/v1/regions",
    data,
  );
  if (!res.success) {
    throw new Error("Failed to create region");
  }
  return res.data;
};

export const updateRegion = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateRegionDto;
}): Promise<Regions> => {
  const res = await api.patch<StandardResponse<Regions>, UpdateRegionDto>(
    `/v1/regions/${id}`,
    data,
  );
  if (!res.success) {
    throw new Error("Failed to update region");
  }
  return res.data;
};

export const assignRegionCoordinator = async ({
  id,
  data,
}: {
  id: string;
  data: AssignRegionCoordinatorDto;
}): Promise<Regions> => {
  const res = await api.patch<StandardResponse<Regions>, AssignRegionCoordinatorDto>(
    `/v1/regions/${id}/coordinator`,
    data,
  );
  if (!res.success) {
    throw new Error("Failed to assign region coordinator");
  }
  return res.data;
};

export const deleteRegion = async (id: string) => {
  const res = await api.delete<StandardResponse<Regions>>(`/v1/regions/${id}`);
  if (!res.success) {
    throw new Error("Failed to delete region");
  }
  return res.data;
};

export const useRegionsCount = () => {
  return useQuery({
    queryKey: regionKeys.counts,
    queryFn: getRegionsCount,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useRegions = (params: PaginationParams) => {
  return useQuery({
    queryKey: regionKeys.list(params),
    queryFn: () => getRegions(params),
    retry: 1,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
};

export const useRegion = (id: string) => {
  return useQuery({
    queryKey: regionKeys.detail(id),
    queryFn: () => getRegionById(id),
    enabled: Boolean(id),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreateRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRegion,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: regionKeys.all }),
        queryClient.invalidateQueries({ queryKey: regionKeys.counts }),
      ]);
    },
  });
};

export const useDeleteRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRegion,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: regionKeys.all }),
        queryClient.invalidateQueries({ queryKey: regionKeys.counts }),
      ]);
    },
  });
};

export const useUpdateRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRegion,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: regionKeys.all }),
        queryClient.invalidateQueries({ queryKey: regionKeys.counts }),
        queryClient.invalidateQueries({
          queryKey: regionKeys.detail(variables.id),
        }),
      ]);
    },
  });
};

export const useAssignRegionCoordinator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignRegionCoordinator,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: regionKeys.all }),
        queryClient.invalidateQueries({ queryKey: regionKeys.counts }),
        queryClient.invalidateQueries({
          queryKey: regionKeys.detail(variables.id),
        }),
      ]);
    },
  });
};
