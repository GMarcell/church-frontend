"use client";

import { SessionUser } from "./rbac";

const ACCESS_TOKEN_KEY = "access_token";
const AUTH_USER_KEY = "auth_user";

const setCookie = (name: string, value: string, maxAge = 60 * 60 * 24 * 7) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
};

const clearCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
};

export const persistAuthSession = (payload: {
  token?: string;
  user?: SessionUser;
}) => {
  if (typeof window === "undefined") return;

  if (payload.token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, payload.token);
  }

  if (payload.user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(payload.user));
    setCookie("user_role", payload.user.role);
    setCookie("user_email", payload.user.email);
  }
};

export const clearAuthSession = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }

  clearCookie("user_role");
  clearCookie("user_email");
};

export const getStoredUser = (): SessionUser | null => {
  if (typeof window === "undefined") return null;

  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as SessionUser;
  } catch {
    return null;
  }
};
