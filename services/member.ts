import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CountMember } from "@/type/member";
import { StandardResponse } from "@/type/shared";

const memberKey = "member";

export const getMembersCount = async (): Promise<CountMember> => {
  const res = await api.get<StandardResponse<CountMember>>("/v1/member/count");
  if (!res.success) {
    throw new Error("Failed to fetch member data");
  }
  return res.data;
};

export const useMembersCount = () => {
  return useQuery({
    queryKey: [memberKey],
    queryFn: () => getMembersCount(),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
