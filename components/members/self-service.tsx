"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/helper";
import { useStoredUser } from "@/lib/auth-session";
import { useMember, useMembers, useUpdateMember } from "@/services/member";
import { Member } from "@/type/member";

const formatMemberRole = (role: string) =>
  role
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());

export default function MemberSelfService() {
  const currentUser = useStoredUser();
  const memberId = currentUser?.memberId;
  const { data: member, isLoading } = useMember(memberId ?? "");
  const { data: familyMemberResult } = useMembers({ page: 1, limit: 100 });
  const updateMember = useUpdateMember();
  const [formValues, setFormValues] = useState({
    name: "",
    gender: "",
    birthDate: "",
    phone: "",
    email: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<Member | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [familyError, setFamilyError] = useState<string | null>(null);

  const familyMembers = (familyMemberResult?.items ?? []).filter(
    (item) => item.familyId === member?.familyId && item.id !== member?.id,
  );
  const canManageFamily = member?.role === "FAMILY_HEAD";

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      setSelectedFamilyMember(null);
      setError(null);
      setFamilyError(null);
    }
  };

  const openEditor = () => {
    if (!member) return;

    setFormValues({
      name: member.name,
      gender: member.gender,
      birthDate: member.birthDate.slice(0, 10),
      phone: member.phone,
      email: member.email,
    });
    setError(null);
    setIsOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!member) return;

    try {
      await updateMember.mutateAsync({
        id: member.id,
        data: {
          name: formValues.name,
          gender: formValues.gender,
          birthDate: new Date(formValues.birthDate).toISOString(),
          phone: formValues.phone,
          email: formValues.email,
        },
      });
      setIsOpen(false);
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Failed to update profile."));
    }
  };

  const openFamilyMemberEditor = (familyMember: Member) => {
    setSelectedFamilyMember(familyMember);
    setFamilyError(null);
    setFormValues({
      name: familyMember.name,
      gender: familyMember.gender,
      birthDate: familyMember.birthDate.slice(0, 10),
      phone: familyMember.phone,
      email: familyMember.email,
    });
    setIsOpen(true);
  };

  const handleFamilyMemberSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!selectedFamilyMember) return;

    try {
      await updateMember.mutateAsync({
        id: selectedFamilyMember.id,
        data: {
          name: formValues.name,
          gender: formValues.gender,
          birthDate: new Date(formValues.birthDate).toISOString(),
          phone: formValues.phone,
          email: formValues.email,
        },
      });
      setIsOpen(false);
      setSelectedFamilyMember(null);
    } catch (submitError) {
      setFamilyError(
        getErrorMessage(submitError, "Failed to update family member."),
      );
    }
  };

  if (!memberId) {
    return (
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Member Profile Unavailable</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Your session did not include a member identifier, so the app cannot
          load your profile yet.
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !member) {
    return (
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Loading Profile</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Fetching your member details.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl overflow-hidden border-white/70">
      <CardHeader className="border-b border-border/60 bg-[linear-gradient(135deg,rgba(34,71,146,0.08),rgba(204,169,88,0.08))]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Member Profile
            </p>
            <CardTitle className="mt-2 text-2xl tracking-tight">{member.name}</CardTitle>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {canManageFamily
                ? "As family head, you can update your profile and your family members' data."
                : "You can update your own personal information here."}
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button onClick={openEditor}>Edit My Data</Button>
            </DialogTrigger>

            <DialogContent className="rounded-[1.75rem] border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,247,241,0.98))] shadow-[0_40px_90px_-40px_rgba(16,28,56,0.45)]">
              <DialogHeader>
                <DialogTitle className="text-2xl tracking-tight">
                  {selectedFamilyMember ? "Update Family Member" : "Update My Data"}
                </DialogTitle>
                <DialogDescription>
                  {selectedFamilyMember
                    ? `Update ${selectedFamilyMember.name}'s details.`
                    : "Keep your personal details current."}
                </DialogDescription>
              </DialogHeader>

              <form
                className="space-y-4"
                onSubmit={selectedFamilyMember ? handleFamilyMemberSubmit : handleSubmit}
              >
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="self-name">Full Name</Label>
                    <Input
                      id="self-name"
                      className="h-11 rounded-2xl border-border/70 bg-white/80 px-4"
                      value={formValues.name}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="self-gender">Gender</Label>
                    <select
                      id="self-gender"
                      className="flex h-11 w-full rounded-2xl border border-border/70 bg-white/80 px-4 py-2 text-sm shadow-xs outline-none"
                      value={formValues.gender}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          gender: event.target.value,
                        }))
                      }
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="self-birthdate">Birth Date</Label>
                    <Input
                      id="self-birthdate"
                      type="date"
                      className="h-11 rounded-2xl border-border/70 bg-white/80 px-4"
                      value={formValues.birthDate}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          birthDate: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="self-phone">Phone</Label>
                    <Input
                      id="self-phone"
                      className="h-11 rounded-2xl border-border/70 bg-white/80 px-4"
                      value={formValues.phone}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="self-email">Email</Label>
                    <Input
                      id="self-email"
                      type="email"
                      className="h-11 rounded-2xl border-border/70 bg-white/80 px-4"
                      value={formValues.email}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {selectedFamilyMember ? (
                  familyError ? (
                    <p className="text-sm text-red-500">{familyError}</p>
                  ) : null
                ) : error ? (
                  <p className="text-sm text-red-500">{error}</p>
                ) : null}

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button disabled={updateMember.isPending} type="submit">
                    {updateMember.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Family
          </p>
          <p className="mt-2 text-sm font-medium">
            {member.family?.familyName ?? "Not assigned"}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Role
          </p>
          <p className="mt-2 text-sm font-medium">
            {formatMemberRole(member.role)}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Phone
          </p>
          <p className="mt-2 text-sm font-medium">{member.phone || "-"}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Email
          </p>
          <p className="mt-2 text-sm font-medium">{member.email || "-"}</p>
        </div>
        </div>

        {canManageFamily ? (
          <div className="rounded-[1.5rem] border border-border/70 bg-white/65 p-4 shadow-[0_18px_40px_-30px_rgba(23,32,62,0.32)] backdrop-blur-sm">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Household Members
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                You can update the personal data of members in your family.
              </p>
            </div>

            <div className="space-y-3">
              {familyMembers.map((familyMember) => (
                <div
                  key={familyMember.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-white/80 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{familyMember.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatMemberRole(familyMember.role)} • {familyMember.phone || "No phone"}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => openFamilyMemberEditor(familyMember)}
                  >
                    Edit Data
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
