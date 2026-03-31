"use client";

import { Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { useStoredUser } from "@/lib/auth-session";
import { logout } from "@/services/auth";
import { toTitleCase } from "@/lib/helper";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean).pop();
  const currentUser = useStoredUser();

  const handleLogout = async () => {
    try {
      await logout();

      router.push("/public/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-background/72 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6 xl:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/80 bg-white/75 shadow-sm md:hidden">
            <Menu className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Administration
            </p>
            <h1 className="text-xl font-semibold tracking-tight">
              {toTitleCase(segment as string)}
            </h1>
          </div>
        </div>

        <div className="hidden rounded-full border border-border/70 bg-white/70 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur md:flex">
          Ministry records, people, and branch operations
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium">{currentUser?.role ?? "User"}</p>
            <p className="text-xs text-muted-foreground">
              {currentUser?.email ?? currentUser?.name ?? "No profile"}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-11 w-11 rounded-2xl border-white/70 bg-white/75 p-0 shadow-sm backdrop-blur"
              >
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-sm font-semibold text-white">
                    {currentUser?.email?.slice(0, 2).toUpperCase() ?? "US"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 rounded-2xl border-white/60 bg-white/95 p-2 shadow-xl backdrop-blur"
            >
              <div className="px-2 py-2 text-sm">
                <p className="font-medium">{currentUser?.role ?? "User"}</p>
                <p className="text-xs text-muted-foreground">
                  {currentUser?.email ?? currentUser?.name ?? "No profile"}
                </p>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="rounded-xl">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem className="rounded-xl" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
