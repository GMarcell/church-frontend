import { api } from "@/lib/api";
import { toPaginatedResult } from "@/lib/helper";
import {
  CountMember,
  CreateMemberDto,
  Member,
  UpdateMemberDto,
} from "@/type/member";
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

export const memberKeys = {
  all: ["members"] as const,
  list: (params: PaginationParams) => ["members", "list", params] as const,
  counts: ["members", "count"] as const,
  detail: (id: string) => ["members", id] as const,
};

export const getMembersCount = async (): Promise<CountMember> => {
  const res = await api.get<StandardResponse<CountMember>>("/v1/member/count");
  if (!res.success) {
    throw new Error("Failed to fetch member count");
  }
  return res.data;
};

export const getMembers = async (
  params: PaginationParams,
): Promise<PaginatedResult<Member>> => {
  const res = await api.get<StandardResponse<unknown>, PaginationParams>(
    "/v1/member",
    params,
  );
  if (!res.success) {
    throw new Error("Failed to fetch members");
  }
  return toPaginatedResult(res.data as never, params.page, params.limit);
};

export const getMemberById = async (id: string): Promise<Member> => {
  const res = await api.get<StandardResponse<Member>>(`/v1/member/${id}`);
  if (!res.success) {
    throw new Error("Failed to fetch member");
  }
  return res.data;
};

export const createMember = async (data: CreateMemberDto): Promise<Member> => {
  const res = await api.post<StandardResponse<Member>, CreateMemberDto>(
    "/v1/member",
    data,
  );
  if (!res.success) {
    throw new Error("Failed to create member");
  }
  return res.data;
};

export const updateMember = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateMemberDto;
}): Promise<Member> => {
  const res = await api.patch<StandardResponse<Member>, UpdateMemberDto>(
    `/v1/member/${id}`,
    data,
  );
  if (!res.success) {
    throw new Error("Failed to update member");
  }
  return res.data;
};

export const deleteMember = async (id: string) => {
  const res = await api.delete<StandardResponse<Member>>(`/v1/member/${id}`);
  if (!res.success) {
    throw new Error("Failed to delete member");
  }
  return res.data;
};

export const useMembersCount = () => {
  return useQuery({
    queryKey: memberKeys.counts,
    queryFn: getMembersCount,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useMembers = (params: PaginationParams) => {
  return useQuery({
    queryKey: memberKeys.list(params),
    queryFn: () => getMembers(params),
    retry: 1,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
};

export const useMember = (id: string) => {
  return useQuery({
    queryKey: memberKeys.detail(id),
    queryFn: () => getMemberById(id),
    enabled: Boolean(id),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMember,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: memberKeys.all }),
        queryClient.invalidateQueries({ queryKey: memberKeys.counts }),
      ]);
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMember,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: memberKeys.all }),
        queryClient.invalidateQueries({ queryKey: memberKeys.counts }),
      ]);
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMember,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: memberKeys.all }),
        queryClient.invalidateQueries({ queryKey: memberKeys.counts }),
        queryClient.invalidateQueries({
          queryKey: memberKeys.detail(variables.id),
        }),
      ]);
    },
  });
};
