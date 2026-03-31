"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useStoredUser } from "@/lib/auth-session";
import { useStoredRoleAccessMap } from "@/lib/rbac-config";
import { hasRequiredRole } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { menuItems } from "@/nav/const";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export function Sidebar({
  mobileOpen = false,
  onMobileOpenChange,
}: SidebarProps) {
  const pathname = usePathname();
  const currentUser = useStoredUser();
  const roleAccessMap = useStoredRoleAccessMap();

  const filteredMenuItems = useMemo(
    () =>
      menuItems.filter((item) =>
        hasRequiredRole(currentUser?.role, roleAccessMap[item.href] ?? item.roles),
      ),
    [currentUser?.role, roleAccessMap],
  );

  const sidebarBody = (
    <div className="relative flex h-full flex-col overflow-hidden px-4 py-5 sm:px-5 sm:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,211,117,0.15),transparent_30%),linear-gradient(180deg,transparent,rgba(255,255,255,0.02))]" />

        <div className="relative mb-6 space-y-4 sm:mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_18px_38px_-18px_rgba(233,194,96,0.72)]">
            CS
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Church System</h2>
            <p className="text-sm text-sidebar-foreground/65">
              Mission control for your ministry
            </p>
          </div>
        </div>

        <div className="relative mb-5 rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-sidebar-foreground/45">
            Signed In
          </p>
          <p className="mt-2 text-sm font-medium">
            {currentUser?.email ?? currentUser?.name ?? "Guest"}
          </p>
          <p className="mt-1 text-xs text-sidebar-foreground/60">
            {currentUser?.role ?? "Unknown role"}
          </p>
        </div>

        <Separator className="mb-5 bg-white/10" />

        <nav className="relative flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onMobileOpenChange?.(false)}
              >
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "h-12 w-full justify-start gap-3 rounded-2xl px-4 text-sidebar-foreground transition-all",
                    isActive
                      ? "bg-white text-slate-900 shadow-[0_18px_36px_-22px_rgba(255,255,255,0.95)]"
                      : "hover:bg-white/8 hover:text-white",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl border text-current",
                      isActive
                        ? "border-slate-200 bg-slate-100"
                        : "border-white/10 bg-white/5",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="relative mt-auto rounded-[1.4rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-sidebar-foreground/45">
            Focus
          </p>
          <p className="mt-2 text-sm font-medium">Keep the flock in view</p>
          <p className="mt-1 text-xs text-sidebar-foreground/60">
            Manage branches, members, attendance, and ministry operations from one place.
          </p>
        </div>

        <div className="relative mt-4">
          <Separator className="my-4 bg-white/10" />
          <p className="text-xs text-sidebar-foreground/45">
            © {new Date().getFullYear()} Church System
          </p>
        </div>
      </div>
  );

  return (
    <>
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          className="w-[min(88vw,22rem)] border-white/10 bg-sidebar p-0 text-sidebar-foreground md:hidden [&>button]:text-white"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>
              Access dashboard navigation on smaller screens.
            </SheetDescription>
          </SheetHeader>
          {sidebarBody}
        </SheetContent>
      </Sheet>

      <aside className="hidden h-screen w-72 shrink-0 border-r border-sidebar-border/60 bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        {sidebarBody}
      </aside>
    </>
  );
}
