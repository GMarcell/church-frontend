import { api } from "@/lib/api";
import { toPaginatedResult } from "@/lib/helper";
import {
  PaginatedResult,
  PaginationParams,
  StandardResponse,
} from "@/type/shared";
import { CreateUserDto, UpdateUserDto, User } from "@/type/user";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const userKeys = {
  all: ["users"] as const,
  list: (params: PaginationParams) => ["users", "list", params] as const,
  detail: (id: string) => ["users", id] as const,
};

export const getUsers = async (
  params: PaginationParams,
): Promise<PaginatedResult<User>> => {
  const res = await api.get<StandardResponse<unknown>, PaginationParams>(
    "/users",
    params,
  );
  if (!res.success) {
    throw new Error("Failed to fetch users");
  }
  return toPaginatedResult(res.data as never, params.page, params.limit);
};

export const getUserById = async (id: string): Promise<User> => {
  const res = await api.get<StandardResponse<User>>(`/users/${id}`);
  if (!res.success) {
    throw new Error("Failed to fetch user");
  }
  return res.data;
};

export const createUser = async (data: CreateUserDto): Promise<User> => {
  const res = await api.post<StandardResponse<User>, CreateUserDto>(
    "/users",
    data,
  );
  if (!res.success) {
    throw new Error("Failed to create user");
  }
  return res.data;
};

export const updateUser = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateUserDto;
}): Promise<User> => {
  const res = await api.patch<StandardResponse<User>, UpdateUserDto>(
    `/users/${id}`,
    data,
  );
  if (!res.success) {
    throw new Error("Failed to update user");
  }
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await api.delete<StandardResponse<User>>(`/users/${id}`);
  if (!res.success) {
    throw new Error("Failed to delete user");
  }
  return res.data;
};

export const useUsers = (params: PaginationParams) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
    retry: 1,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: Boolean(id),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
        queryClient.invalidateQueries({
          queryKey: userKeys.detail(variables.id),
        }),
      ]);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};
