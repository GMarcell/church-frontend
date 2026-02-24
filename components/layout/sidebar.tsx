"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { menuItems } from "@/nav/const";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-background p-4">
      {/* Logo */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">Church System</h2>
        <p className="text-sm text-muted-foreground">Admin Dashboard</p>
      </div>

      <Separator className="mb-4" />

      {/* Menu */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "font-semibold",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto">
        <Separator className="my-4" />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Church System
        </p>
      </div>
    </aside>
  );
}
