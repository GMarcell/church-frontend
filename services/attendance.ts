import { api } from "@/lib/api";
import { toPaginatedResult } from "@/lib/helper";
import {
  Attendance,
  CreateAttendanceDto,
  UpdateAttendanceDto,
} from "@/type/attendance";
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

export const attendanceKeys = {
  all: ["attendance"] as const,
  list: (params: PaginationParams) => ["attendance", "list", params] as const,
  detail: (id: string) => ["attendance", id] as const,
};

export const getAttendances = async (
  params: PaginationParams,
): Promise<PaginatedResult<Attendance>> => {
  const res = await api.get<StandardResponse<unknown>, PaginationParams>(
    "/attendances",
    params,
  );
  if (!res.success) {
    throw new Error("Failed to fetch attendance records");
  }
  return toPaginatedResult(res.data as never, params.page, params.limit);
};

export const getAttendanceById = async (id: string): Promise<Attendance> => {
  const res = await api.get<StandardResponse<Attendance>>(`/attendances/${id}`);
  if (!res.success) {
    throw new Error("Failed to fetch attendance record");
  }
  return res.data;
};

export const createAttendance = async (
  data: CreateAttendanceDto,
): Promise<Attendance> => {
  const res = await api.post<StandardResponse<Attendance>, CreateAttendanceDto>(
    "/attendances",
    data,
  );
  if (!res.success) {
    throw new Error("Failed to create attendance record");
  }
  return res.data;
};

export const updateAttendance = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateAttendanceDto;
}): Promise<Attendance> => {
  const res = await api.patch<StandardResponse<Attendance>, UpdateAttendanceDto>(
    `/attendances/${id}`,
    data,
  );
  if (!res.success) {
    throw new Error("Failed to update attendance record");
  }
  return res.data;
};

export const deleteAttendance = async (id: string) => {
  const res =
    await api.delete<StandardResponse<Attendance>>(`/attendances/${id}`);
  if (!res.success) {
    throw new Error("Failed to delete attendance record");
  }
  return res.data;
};

export const useAttendances = (params: PaginationParams) => {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => getAttendances(params),
    retry: 1,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
};

export const useAttendance = (id: string) => {
  return useQuery({
    queryKey: attendanceKeys.detail(id),
    queryFn: () => getAttendanceById(id),
    enabled: Boolean(id),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAttendance,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAttendance,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAttendance,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
        queryClient.invalidateQueries({
          queryKey: attendanceKeys.detail(variables.id),
        }),
      ]);
    },
  });
};
