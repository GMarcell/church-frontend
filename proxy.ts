import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getAllowedRolesForPathFromConfig,
  hasRequiredRole,
  parseRoleAccessMap,
} from "./lib/rbac";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const userRole = request.cookies.get("user_role")?.value;
  const roleAccessConfigCookie =
    request.cookies.get("role_access_config")?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith("/public");
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  // Not logged in → trying to access dashboard
  if (!token && isDashboard) {
    return NextResponse.redirect(new URL("/public/login", request.url));
  }

  // Logged in → trying to access login
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (token && isDashboard && userRole) {
    const allowedRoles = getAllowedRolesForPathFromConfig(
      request.nextUrl.pathname,
      parseRoleAccessMap(roleAccessConfigCookie),
    );

    if (!hasRequiredRole(userRole, allowedRoles)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/public/login"],
};
