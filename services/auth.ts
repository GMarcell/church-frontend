import { api } from "@/lib/api";

interface LoginDto {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: unknown;
  timestamp: string;
}

export const login = async (data: LoginDto) => {
  return api.post<LoginResponse, LoginDto>("auth/login", data);
};

export const logout = async () => {
  return api.post<LoginResponse>("auth/logout");
};
