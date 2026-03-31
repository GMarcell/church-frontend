"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPelkatLabel, useMembersByPelkat, usePelkatCount } from "@/services/member";
import { toTitleCase } from "@/lib/helper";

const pelkatOptions = [
  "Pelayanan Anak",
  "Remaja",
  "Gerakan Pemuda",
  "Persekutuan Kaum Bapa",
  "Persekutuan Wanita",
  "Lansia",
];

export default function PelkatMenu() {
  const [selectedPelkat, setSelectedPelkat] = useState("Gerakan Pemuda");
  const [pelkatQuery, setPelkatQuery] = useState("Gerakan Pemuda");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const activePelkat = pelkatQuery.trim();
  const { data, isLoading, isFetching, error } = useMembersByPelkat({
    pelkat: activePelkat,
    params: { page, limit },
  });
  const { data: pelkatCount } = usePelkatCount(activePelkat);

  const members = data?.items ?? [];
  const pagination = data?.meta;
  const canGoPrevious = (pagination?.page ?? 1) > 1;
  const canGoNext = pagination ? pagination.page < pagination.totalPages : false;
  const activePelkatLabel = getPelkatLabel(activePelkat);

  const summary = useMemo(() => {
    if (!activePelkat) {
      return "Choose a pelkat to load members.";
    }
    if (isLoading || isFetching) {
      return `Loading members for ${activePelkatLabel}...`;
    }
    return `${pelkatCount?.total ?? pagination?.total ?? members.length} members found for ${activePelkatLabel}.`;
  }, [activePelkat, activePelkatLabel, isFetching, isLoading, members.length, pagination?.total, pelkatCount?.total]);

  const handlePelkatSelect = (value: string) => {
    setSelectedPelkat(value);
    setPelkatQuery(value);
    setPage(1);
  };

  const handleSearch = () => {
    setPelkatQuery(selectedPelkat.trim());
    setPage(1);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <Card className="border-white/70 bg-[linear-gradient(135deg,rgba(34,71,146,0.08),rgba(204,169,88,0.08))]">
        <CardHeader className="px-4 py-5 sm:px-6">
          <CardTitle className="text-xl tracking-tight sm:text-2xl">
            Members by Pelkat
          </CardTitle>
          <CardDescription>
            Pick a pelkat from the menu or type the exact backend value, then
            browse matching members.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 px-4 pb-5 sm:px-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="pelkat-menu">Pelkat Menu</Label>
            <Select value={selectedPelkat} onValueChange={handlePelkatSelect}>
              <SelectTrigger id="pelkat-menu">
                <SelectValue placeholder="Choose pelkat" />
              </SelectTrigger>
              <SelectContent>
                {pelkatOptions.map((pelkat) => (
                  <SelectItem key={pelkat} value={pelkat}>
                    {pelkat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pelkat-value">Pelkat Value</Label>
            <Input
              id="pelkat-value"
              className="h-11 rounded-2xl border-border/70 bg-white/80 px-4"
              value={selectedPelkat}
              onChange={(event) => setSelectedPelkat(event.target.value)}
              placeholder="Type the pelkat name expected by the backend"
            />
          </div>

          <Button className="h-11 w-full lg:w-auto" onClick={handleSearch}>
            Load Members
          </Button>
        </CardContent>
      </Card>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-white/70">
        <CardHeader className="gap-3 border-b border-border/60 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg tracking-tight sm:text-xl">
                {activePelkat ? activePelkatLabel : "No pelkat selected"}
              </CardTitle>
              <CardDescription>{summary}</CardDescription>
            </div>

            {pagination ? (
              <div className="rounded-2xl border border-border/70 bg-white/70 px-4 py-2 text-sm text-muted-foreground sm:rounded-full">
                Page {pagination.page} of {pagination.totalPages} • {pelkatCount?.total ?? pagination.total} members
              </div>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="min-h-0 flex-1 overflow-hidden rounded-[1.5rem] border border-border/70 bg-white/65 shadow-[0_18px_40px_-30px_rgba(23,32,62,0.32)] backdrop-blur-sm">
            <div className="h-full overflow-auto">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="bg-[linear-gradient(180deg,rgba(247,244,235,0.95),rgba(255,255,255,0.8))]">
                    <TableHead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Name
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Gender
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Phone
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Email
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Role
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Family
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Loading members...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-red-500">
                        {error instanceof Error
                          ? error.message
                          : "Failed to load members for this pelkat."}
                      </TableCell>
                    </TableRow>
                  ) : members.length ? (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{toTitleCase(member.gender)}</TableCell>
                        <TableCell>{member.phone}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{toTitleCase(member.role.replaceAll("_", " "))}</TableCell>
                        <TableCell>{member.family?.familyName ?? member.familyId}</TableCell>
                        <TableCell>{member.isActive ? "Active" : "Inactive"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No members found for this pelkat.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/60 pt-2 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              Use the menu above to switch between pelkat groups.
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="flex items-center justify-between gap-2 sm:justify-start">
                <Label htmlFor="pelkat-page-size" className="text-sm">
                  Rows
                </Label>
                <Select
                  value={String(limit)}
                  onValueChange={(value) => {
                    setLimit(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger
                    id="pelkat-page-size"
                    className="h-10 w-[88px] rounded-full bg-white/80"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50].map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={!canGoPrevious}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={!canGoNext}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
