import { api } from "@/lib/api";
import { clearAuthSession, persistAuthSession } from "@/lib/auth-session";
import { StandardResponse } from "@/type/shared";

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto extends LoginDto {
  role: string;
}

type AuthPayload = {
  access_token?: string;
  token?: string;
  user?: {
    email: string;
    role: string;
  };
};

type AuthResponse = StandardResponse<AuthPayload>;

export const register = async (data: RegisterDto) => {
  return api.post<AuthResponse, RegisterDto>("/auth/register", data);
};

export const login = async (data: LoginDto) => {
  const response = await api.post<AuthResponse, LoginDto>("/auth/login", data);

  const token = response.data?.access_token ?? response.data?.token;
  persistAuthSession({
    token,
    user: response.data?.user,
  });

  return response;
};

export const logout = async () => {
  const response = await api.post<AuthResponse>("/auth/logout");

  clearAuthSession();

  return response;
};
