import { api } from "@/lib/api";
import { clearAuthSession, persistAuthSession } from "@/lib/auth-session";
import { StandardResponse } from "@/type/shared";

interface LoginDto {
  email: string;
  password: string;
}

interface MemberLoginDto {
  name: string;
  password: string;
}

interface RegisterDto extends LoginDto {
  role: string;
}

type AuthPayload = {
  access_token?: string;
  token?: string;
  user?: {
    id?: string;
    email?: string;
    name?: string;
    memberId?: string;
    regionId?: string;
    role: string;
  };
};

type AuthResponse = StandardResponse<AuthPayload>;

type TokenPayload = {
  sub?: string;
  id?: string;
  memberId?: string;
  regionId?: string;
  role?: string;
  email?: string;
  name?: string;
  fullName?: string;
  preferred_username?: string;
};

const decodeTokenPayload = (token?: string): TokenPayload | null => {
  if (!token) return null;

  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "="));
    return JSON.parse(decoded) as TokenPayload;
  } catch {
    return null;
  }
};

export const register = async (data: RegisterDto) => {
  return api.post<AuthResponse, RegisterDto>("/auth/register", data);
};

export const login = async (data: LoginDto) => {
  const response = await api.post<AuthResponse, LoginDto>("/auth/login", data);

  const token = response.data?.access_token ?? response.data?.token;
  const tokenPayload = decodeTokenPayload(token);
  persistAuthSession({
    token,
    user: {
      id:
        response.data?.user?.id ??
        tokenPayload?.sub ??
        tokenPayload?.id,
      email: response.data?.user?.email ?? tokenPayload?.email ?? data.email,
      name:
        response.data?.user?.name ??
        tokenPayload?.name ??
        tokenPayload?.fullName ??
        tokenPayload?.preferred_username,
      memberId: response.data?.user?.memberId ?? tokenPayload?.memberId,
      regionId: response.data?.user?.regionId ?? tokenPayload?.regionId,
      role: response.data?.user?.role ?? tokenPayload?.role ?? "",
    },
  });

  return response;
};

export const memberLogin = async (data: MemberLoginDto) => {
  const response = await api.post<AuthResponse, MemberLoginDto>(
    "/auth/member-login",
    data,
  );

  const token = response.data?.access_token ?? response.data?.token;
  const tokenPayload = decodeTokenPayload(token);

  persistAuthSession({
    token,
    user: {
      role: tokenPayload?.role ?? "MEMBER",
      id: tokenPayload?.sub ?? tokenPayload?.id,
      memberId: tokenPayload?.memberId ?? tokenPayload?.sub ?? tokenPayload?.id,
      regionId: tokenPayload?.regionId,
      name:
        tokenPayload?.name ??
        tokenPayload?.fullName ??
        tokenPayload?.preferred_username ??
        data.name,
      email: tokenPayload?.email,
    },
  });

  return response;
};

export const logout = async () => {
  const response = await api.post<AuthResponse>("/auth/logout");

  clearAuthSession();

  return response;
};
