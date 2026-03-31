"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_ROLES, RoleAccessMap } from "@/lib/rbac";
import {
  persistRoleAccessMap,
  resetStoredRoleAccessMap,
  useStoredRoleAccessMap,
} from "@/lib/rbac-config";
import { menuItems } from "@/nav/const";

const lockedRoutes = new Set(["/dashboard/settings"]);

export default function SettingsPage() {
  const storedConfig = useStoredRoleAccessMap();
  const [draftConfig, setDraftConfig] = useState<RoleAccessMap | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const config = draftConfig ?? storedConfig;

  const configurableMenuItems = useMemo(
    () =>
      menuItems.filter((item) => !lockedRoutes.has(item.href)).map((item) => ({
        title: item.title,
        href: item.href,
      })),
    [],
  );

  const toggleRole = (path: string, role: string) => {
    setMessage(null);
    setDraftConfig((currentDraft) => {
      const current = currentDraft ?? storedConfig;
      const currentRoles = current[path] ?? [];
      const hasRole = currentRoles.includes(role);
      const nextRoles = hasRole
        ? currentRoles.filter((item) => item !== role)
        : [...currentRoles, role];

      return {
        ...current,
        [path]: nextRoles,
      };
    });
  };

  const handleSave = () => {
    persistRoleAccessMap(config);
    setDraftConfig(null);
    setMessage("Role access settings saved.");
  };

  const handleReset = () => {
    resetStoredRoleAccessMap();
    setDraftConfig(null);
    setMessage("Role access reset to defaults.");
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-white/70">
        <CardHeader className="border-b border-border/60 bg-[linear-gradient(135deg,rgba(34,71,146,0.08),rgba(204,169,88,0.08))]">
          <CardTitle className="text-2xl tracking-tight">
            Page Access by Role
          </CardTitle>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Use this page to decide which roles can open each dashboard page.
            </p>
            <p>
              Each row is one page. A checked box means that role can view it.
              An unchecked box means the page is hidden and blocked for that role.
            </p>
            <p>Settings stays Admin-only so access cannot be removed by mistake.</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          {message ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          <div className="rounded-[1.5rem] border border-border/70 bg-white/65 p-4 shadow-[0_18px_40px_-30px_rgba(23,32,62,0.32)] backdrop-blur-sm sm:p-5">
            <div className="mb-4 rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
              Check the roles that should be allowed to open each page.
            </div>

            <div className="overflow-x-auto rounded-[1.25rem] border border-border/70">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-[linear-gradient(180deg,rgba(247,244,235,0.95),rgba(255,255,255,0.8))]">
                    <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Dashboard Page
                    </th>
                    {APP_ROLES.map((role) => (
                      <th
                        key={role}
                        className="px-5 py-4 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        {role}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {configurableMenuItems.map((item) => (
                    <tr key={item.href} className="border-t border-border/60 bg-white/85">
                      <td className="px-5 py-4 align-middle">
                        <div className="text-sm font-medium text-foreground">
                          {item.title}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {item.href}
                        </div>
                      </td>

                      {APP_ROLES.map((role) => {
                        const enabled = (config[item.href] ?? []).includes(role);

                        return (
                          <td
                            key={`${item.href}-${role}`}
                            className="px-5 py-4 text-center align-middle"
                          >
                            <label className="inline-flex cursor-pointer items-center justify-center">
                              <span className="sr-only">
                                Allow {role} to access {item.title}
                              </span>
                              <input
                                type="checkbox"
                                checked={enabled}
                                onChange={() => toggleRole(item.href, role)}
                                className="h-4 w-4 rounded border-border"
                              />
                            </label>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave}>Save Access Rules</Button>
            <Button variant="outline" onClick={handleReset}>
              Reset Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
