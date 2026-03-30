"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_ROLES, defaultRoleAccessMap, RoleAccessMap } from "@/lib/rbac";
import {
  getStoredRoleAccessMap,
  persistRoleAccessMap,
  resetStoredRoleAccessMap,
} from "@/lib/rbac-config";
import { menuItems } from "@/nav/const";

const lockedRoutes = new Set(["/dashboard/settings"]);

export default function SettingsPage() {
  const [config, setConfig] = useState<RoleAccessMap>(() =>
    getStoredRoleAccessMap(),
  );
  const [message, setMessage] = useState<string | null>(null);

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
    setConfig((current) => {
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
    setMessage("Role access settings saved.");
  };

  const handleReset = () => {
    resetStoredRoleAccessMap();
    setConfig(defaultRoleAccessMap);
    setMessage("Role access reset to defaults.");
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-white/70">
        <CardHeader className="border-b border-border/60 bg-[linear-gradient(135deg,rgba(34,71,146,0.08),rgba(204,169,88,0.08))]">
          <CardTitle className="text-2xl tracking-tight">
            Role Access Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Control which roles can open each dashboard menu. Settings stays
            admin-only to avoid locking everyone out.
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          {message ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-white/65 shadow-[0_18px_40px_-30px_rgba(23,32,62,0.32)] backdrop-blur-sm">
            <div className="grid grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(120px,1fr))] gap-px bg-border/60">
              <div className="bg-[linear-gradient(180deg,rgba(247,244,235,0.95),rgba(255,255,255,0.8))] px-5 py-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Menu
              </div>
              {APP_ROLES.map((role) => (
                <div
                  key={role}
                  className="bg-[linear-gradient(180deg,rgba(247,244,235,0.95),rgba(255,255,255,0.8))] px-5 py-4 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground"
                >
                  {role}
                </div>
              ))}

              {configurableMenuItems.map((item) => (
                <>
                  <div
                    key={`${item.href}-label`}
                    className="bg-white/85 px-5 py-4 text-sm font-medium"
                  >
                    {item.title}
                  </div>
                  {APP_ROLES.map((role) => {
                    const enabled = (config[item.href] ?? []).includes(role);

                    return (
                      <label
                        key={`${item.href}-${role}`}
                        className="flex cursor-pointer items-center justify-center bg-white/85 px-5 py-4"
                      >
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleRole(item.href, role)}
                          className="h-4 w-4 rounded border-border"
                        />
                      </label>
                    );
                  })}
                </>
              ))}
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
