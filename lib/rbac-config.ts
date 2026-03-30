"use client";

import {
  defaultRoleAccessMap,
  parseRoleAccessMap,
  RoleAccessMap,
  serializeRoleAccessMap,
} from "@/lib/rbac";

const ROLE_ACCESS_STORAGE_KEY = "role_access_config";
const ROLE_ACCESS_COOKIE_KEY = "role_access_config";
const ROLE_ACCESS_EVENT = "role-access-config-updated";

const setCookie = (name: string, value: string, maxAge = 60 * 60 * 24 * 30) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
};

export const getStoredRoleAccessMap = (): RoleAccessMap => {
  if (typeof window === "undefined") {
    return defaultRoleAccessMap;
  }

  const rawConfig = localStorage.getItem(ROLE_ACCESS_STORAGE_KEY);
  return parseRoleAccessMap(rawConfig);
};

export const persistRoleAccessMap = (config: RoleAccessMap) => {
  if (typeof window === "undefined") return;

  const serialized = serializeRoleAccessMap(config);
  localStorage.setItem(ROLE_ACCESS_STORAGE_KEY, serialized);
  setCookie(ROLE_ACCESS_COOKIE_KEY, serialized);
  window.dispatchEvent(new CustomEvent(ROLE_ACCESS_EVENT));
};

export const resetStoredRoleAccessMap = () => {
  persistRoleAccessMap(defaultRoleAccessMap);
};

export const roleAccessConfigEvent = ROLE_ACCESS_EVENT;
