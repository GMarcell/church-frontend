export const APP_ROLES = ["ADMIN", "STAFF", "MEMBER"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type SessionUser = {
  email?: string;
  name?: string;
  memberId?: string;
  role: string;
};

export type ProtectedRoute = {
  path: string;
  roles: string[];
};

export type RoleAccessMap = Record<string, string[]>;

export const defaultProtectedRoutes: ProtectedRoute[] = [
  { path: "/dashboard", roles: ["ADMIN", "STAFF"] },
  { path: "/dashboard/branches", roles: ["ADMIN", "STAFF"] },
  { path: "/dashboard/regions", roles: ["ADMIN", "STAFF"] },
  { path: "/dashboard/families", roles: ["ADMIN", "STAFF"] },
  { path: "/dashboard/members", roles: ["ADMIN", "STAFF", "MEMBER"] },
  { path: "/dashboard/attendance", roles: ["ADMIN", "STAFF"] },
  { path: "/dashboard/users", roles: ["ADMIN"] },
  { path: "/dashboard/settings", roles: ["ADMIN"] },
  { path: "/dashboard/giving", roles: ["ADMIN"] },
];

export const protectedRoutes = defaultProtectedRoutes;

export const defaultRoleAccessMap: RoleAccessMap = Object.fromEntries(
  defaultProtectedRoutes.map((route) => [route.path, route.roles]),
);

const protectedAdminOnlyRoutes = ["/dashboard/settings"];

export const resolveRoleAccessMap = (overrides?: Partial<RoleAccessMap>) => {
  const merged = { ...defaultRoleAccessMap } as RoleAccessMap;

  Object.entries(overrides ?? {}).forEach(([path, roles]) => {
    if (roles) {
      merged[path] = roles;
    }
  });

  protectedAdminOnlyRoutes.forEach((path) => {
    merged[path] = ["ADMIN"];
  });

  return merged;
};

export const serializeRoleAccessMap = (config: RoleAccessMap) =>
  JSON.stringify(resolveRoleAccessMap(config));

export const parseRoleAccessMap = (rawConfig?: string | null) => {
  if (!rawConfig) {
    return resolveRoleAccessMap();
  }

  try {
    const parsed = JSON.parse(rawConfig) as Partial<RoleAccessMap>;
    return resolveRoleAccessMap(parsed);
  } catch {
    return resolveRoleAccessMap();
  }
};

export const hasRequiredRole = (
  role: string | null | undefined,
  allowedRoles?: string[],
) => {
  if (!allowedRoles?.length) return true;
  if (!role) return false;
  return allowedRoles.includes(role);
};

export const getAllowedRolesForPath = (pathname: string) => {
  return getAllowedRolesForPathFromConfig(pathname, resolveRoleAccessMap());
};

export const getAllowedRolesForPathFromConfig = (
  pathname: string,
  roleAccessMap: RoleAccessMap,
) => {
  const resolvedRoutes = getProtectedRouteItems(roleAccessMap);

  return resolvedRoutes
    .filter((route) => pathname === route.path || pathname.startsWith(`${route.path}/`))
    .sort((current, next) => next.path.length - current.path.length)[0]?.roles;
};

export const getProtectedRouteItems = (roleAccessMap?: RoleAccessMap) => {
  const resolved = resolveRoleAccessMap(roleAccessMap);

  return protectedRoutes.map((route) => ({
    ...route,
    roles: resolved[route.path] ?? route.roles,
  }));
};

export const getDefaultDashboardPath = (role?: string | null) => {
  if (role === "MEMBER") {
    return "/dashboard/members";
  }

  return "/dashboard";
};
