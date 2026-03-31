import { api } from "@/lib/api";
import { toPaginatedResult } from "@/lib/helper";
import {
  CountMember,
  CreateMemberDto,
  Member,
  PelkatMemberCount,
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
  byPelkat: (pelkat: string, params: PaginationParams) =>
    ["members", "pelkat", pelkat, params] as const,
  counts: ["members", "count"] as const,
  pelkatCounts: ["members", "count", "pelkat"] as const,
  pelkatCount: (pelkat: string) => ["members", "count", "pelkat", pelkat] as const,
  detail: (id: string) => ["members", id] as const,
};

const normalizePelkatCountEntry = (entry: unknown): PelkatMemberCount | null => {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const record = entry as Record<string, unknown>;
  const pelkat =
    typeof record.pelkat === "string"
      ? record.pelkat
      : typeof record.name === "string"
        ? record.name
        : typeof record.memberPelkat === "string"
          ? record.memberPelkat
          : null;

  const totalCandidate =
    typeof record.total === "number"
      ? record.total
      : typeof record.count === "number"
        ? record.count
        : typeof record.totalMembers === "number"
          ? record.totalMembers
          : typeof record.memberCount === "number"
            ? record.memberCount
            : null;

  if (!pelkat || totalCandidate === null) {
    return null;
  }

  return {
    pelkat,
    total: totalCandidate,
  };
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

export const getAllPelkatCounts = async (): Promise<PelkatMemberCount[]> => {
  const res = await api.get<StandardResponse<unknown>>("/v1/member/count/pelkat");
  if (!res.success) {
    throw new Error("Failed to fetch pelkat counts");
  }

  const payload = res.data;
  const rawItems = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && "items" in payload && Array.isArray(payload.items)
      ? payload.items
      : payload && typeof payload === "object" && "data" in payload && Array.isArray(payload.data)
        ? payload.data
        : [];

  return rawItems
    .map((item) => normalizePelkatCountEntry(item))
    .filter((item): item is PelkatMemberCount => item !== null);
};

export const getMemberById = async (id: string): Promise<Member> => {
  const res = await api.get<StandardResponse<Member>>(`/v1/member/${id}`);
  if (!res.success) {
    throw new Error("Failed to fetch member");
  }
  return res.data;
};

export const getMembersByPelkat = async ({
  pelkat,
  params,
}: {
  pelkat: string;
  params: PaginationParams;
}): Promise<PaginatedResult<Member>> => {
  const res = await api.get<StandardResponse<unknown>, PaginationParams>(
    `/v1/member/pelkat/${encodeURIComponent(pelkat)}`,
    params,
  );
  if (!res.success) {
    throw new Error("Failed to fetch members by pelkat");
  }
  return toPaginatedResult(res.data as never, params.page, params.limit);
};

export const getPelkatCount = async (pelkat: string): Promise<PelkatMemberCount> => {
  const res = await api.get<StandardResponse<unknown>>(
    `/v1/member/count/pelkat/${encodeURIComponent(pelkat)}`,
  );
  if (!res.success) {
    throw new Error("Failed to fetch pelkat count");
  }

  const normalized = normalizePelkatCountEntry(res.data);
  if (normalized) {
    return normalized;
  }

  if (typeof res.data === "number") {
    return {
      pelkat,
      total: res.data,
    };
  }

  if (
    res.data &&
    typeof res.data === "object" &&
    "total" in res.data &&
    typeof res.data.total === "number"
  ) {
    return {
      pelkat,
      total: res.data.total,
    };
  }

  throw new Error("Unexpected pelkat count response");
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

export const useAllPelkatCounts = () => {
  return useQuery({
    queryKey: memberKeys.pelkatCounts,
    queryFn: getAllPelkatCounts,
    retry: 1,
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

export const useMembersByPelkat = ({
  pelkat,
  params,
}: {
  pelkat: string;
  params: PaginationParams;
}) => {
  return useQuery({
    queryKey: memberKeys.byPelkat(pelkat, params),
    queryFn: () => getMembersByPelkat({ pelkat, params }),
    enabled: Boolean(pelkat.trim()),
    retry: 1,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
};

export const usePelkatCount = (pelkat: string) => {
  return useQuery({
    queryKey: memberKeys.pelkatCount(pelkat),
    queryFn: () => getPelkatCount(pelkat),
    enabled: Boolean(pelkat.trim()),
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
        queryClient.invalidateQueries({ queryKey: memberKeys.pelkatCounts }),
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
        queryClient.invalidateQueries({ queryKey: memberKeys.pelkatCounts }),
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
        queryClient.invalidateQueries({ queryKey: memberKeys.pelkatCounts }),
        queryClient.invalidateQueries({
          queryKey: memberKeys.detail(variables.id),
        }),
      ]);
    },
  });
};
