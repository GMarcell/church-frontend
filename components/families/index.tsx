"use client";

import { useMemo, useState } from "react";
import { useStoredUser } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getErrorMessage } from "@/lib/helper";
import {
  useCreateFamily,
  useDeleteFamily,
  useFamilies,
  useUpdateFamily,
} from "@/services/family";
import { useMembers, useUpdateMember } from "@/services/member";
import { useRegions } from "@/services/region";
import { Family } from "@/type/family";
import { Member } from "@/type/member";

type FamilyFormValues = {
  familyName: string;
  address: string;
  regionId: string;
};

type FamilyMemberDraft = {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  phone: string;
  email: string;
  role: string;
  isActive: boolean;
};

const initialFamilyValues: FamilyFormValues = {
  familyName: "",
  address: "",
  regionId: "",
};

const createEmptyMember = (): FamilyMemberDraft => ({
  id: crypto.randomUUID(),
  name: "",
  gender: "",
  birthDate: "",
  phone: "",
  email: "",
  role: "",
  isActive: true,
});

const memberRoleOptions = [
  { label: "Family Head", value: "FAMILY_HEAD" },
  { label: "Wife", value: "WIFE" },
  { label: "Child", value: "CHILD" },
  { label: "Other", value: "OTHER" },
];

const genderOptions = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
];

const formatMemberRole = (role: string) =>
  role
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());

export default function FamiliesPage() {
  const currentUser = useStoredUser();
  const isCoordinator = currentUser?.role === "COORDINATOR";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [membersFamilyId, setMembersFamilyId] = useState<string | null>(null);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<Member | null>(
    null,
  );
  const [memberValues, setMemberValues] = useState({
    name: "",
    gender: "",
    birthDate: "",
    phone: "",
    email: "",
    role: "",
    isActive: true,
  });
  const [memberError, setMemberError] = useState<string | null>(null);
  const [createValues, setCreateValues] =
    useState<FamilyFormValues>(initialFamilyValues);
  const [createMembers, setCreateMembers] = useState<FamilyMemberDraft[]>([]);
  const [editValues, setEditValues] =
    useState<FamilyFormValues>(initialFamilyValues);

  const { data: familyResult, isLoading } = useFamilies({ page, limit });
  const { data: memberResult, isLoading: isMembersLoading } = useMembers({
    page: 1,
    limit: 1000,
  });
  const { data: regionResult } = useRegions({ page: 1, limit: 100 });
  const accessibleRegions = useMemo(() => {
    const regions = regionResult?.items ?? [];

    if (!isCoordinator) {
      return regions;
    }

    return regions.filter(
      (region) =>
        region.id === currentUser?.regionId ||
        region.coordinatorId === currentUser?.memberId ||
        region.coordinatorId === currentUser?.id,
    );
  }, [
    currentUser?.id,
    currentUser?.memberId,
    currentUser?.regionId,
    isCoordinator,
    regionResult?.items,
  ]);
  const accessibleRegionIds = useMemo(
    () => new Set(accessibleRegions.map((region) => region.id)),
    [accessibleRegions],
  );
  const createFamily = useCreateFamily();
  const updateFamily = useUpdateFamily();
  const deleteFamily = useDeleteFamily();
  const updateMember = useUpdateMember();

  const filteredFamilies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const families = (familyResult?.items ?? []).filter(
      (item) => !isCoordinator || accessibleRegionIds.has(item.regionId),
    );
    if (!normalizedQuery) return families;

    return families.filter(
      (item) =>
        item.familyName.toLowerCase().includes(normalizedQuery) ||
        item.address.toLowerCase().includes(normalizedQuery) ||
        (item.region?.name ?? "").toLowerCase().includes(normalizedQuery),
    );
  }, [accessibleRegionIds, familyResult?.items, isCoordinator, query]);

  const canGoPrevious = (familyResult?.meta.page ?? 1) > 1;
  const canGoNext = familyResult
    ? familyResult.meta.page < familyResult.meta.totalPages
    : false;
  const familyMembers = useMemo(() => {
    if (!membersFamilyId) return [];

    return (memberResult?.items ?? []).filter(
      (member) => member.familyId === membersFamilyId,
    );
  }, [memberResult?.items, membersFamilyId]);

  const resetCreateForm = () => {
    setCreateValues({
      ...initialFamilyValues,
      regionId: isCoordinator ? accessibleRegions[0]?.id ?? "" : "",
    });
    setCreateMembers([]);
    setError(null);
  };

  const handleCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open);

    if (!open) {
      resetCreateForm();
    } else {
      setMessage(null);
    }
  };

  const handleEditOpenChange = (open: boolean) => {
    if (!open) {
      setEditingItemId(null);
      setEditValues(initialFamilyValues);
      setError(null);
    }
  };

  const handleMembersOpenChange = (open: boolean) => {
    if (!open) {
      setMembersFamilyId(null);
      setSelectedFamilyMember(null);
      setMemberError(null);
    }
  };

  const handleCreateValueChange = (
    field: keyof FamilyFormValues,
    value: string,
  ) => {
    setCreateValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleEditValueChange = (
    field: keyof FamilyFormValues,
    value: string,
  ) => {
    setEditValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleMemberChange = (
    memberId: string,
    field: keyof FamilyMemberDraft,
    value: string | boolean,
  ) => {
    setCreateMembers((current) =>
      current.map((member) =>
        member.id === memberId ? { ...member, [field]: value } : member,
      ),
    );
  };

  const handleAddMember = () => {
    setCreateMembers((current) => [...current, createEmptyMember()]);
  };

  const handleRemoveMember = (memberId: string) => {
    setCreateMembers((current) =>
      current.filter((member) => member.id !== memberId),
    );
  };

  const handleEdit = (item: Family) => {
    setMessage(null);
    setError(null);
    setEditingItemId(item.id);
    setEditValues({
      familyName: item.familyName,
      address: item.address,
      regionId: item.regionId,
    });
  };

  const handleOpenMembers = (familyId: string) => {
    setMessage(null);
    setError(null);
    setMemberError(null);
    setSelectedFamilyMember(null);
    setMembersFamilyId(familyId);
  };

  const handleOpenMemberEditor = (member: Member) => {
    setMemberError(null);
    setSelectedFamilyMember(member);
    setMemberValues({
      name: member.name,
      gender: member.gender,
      birthDate: member.birthDate.slice(0, 10),
      phone: member.phone,
      email: member.email,
      role: member.role,
      isActive: member.isActive,
    });
  };

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!createValues.regionId) {
      setError("Please select a region for this family.");
      return;
    }

    const incompleteMember = createMembers.find(
      (member) => !member.gender || !member.role,
    );

    if (incompleteMember) {
      setError("Please choose gender and role for every family member.");
      return;
    }

    try {
      await createFamily.mutateAsync({
        familyName: createValues.familyName,
        address: createValues.address,
        regionId: createValues.regionId,
        members: createMembers.map((member) => ({
          name: member.name,
          gender: member.gender,
          birthDate: new Date(member.birthDate).toISOString(),
          phone: member.phone,
          email: member.email,
          role: member.role,
          isActive: member.isActive,
        })),
      });

      setMessage(
        createMembers.length
          ? "Family and initial members created successfully."
          : "Family created successfully.",
      );
      setIsCreateOpen(false);
      resetCreateForm();
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Failed to create family."));
    }
  };

  const handleEditSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    familyId: string,
  ) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!editValues.regionId) {
      setError("Please select a region for this family.");
      return;
    }

    try {
      await updateFamily.mutateAsync({
        id: familyId,
        data: {
          familyName: editValues.familyName,
          address: editValues.address,
          regionId: editValues.regionId,
        },
      });

      setMessage("Family updated successfully.");
      setEditingItemId(null);
      setEditValues(initialFamilyValues);
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Failed to update family."));
    }
  };

  const handleDelete = async (item: Family) => {
    try {
      setError(null);
      setMessage(null);
      await deleteFamily.mutateAsync(item.id);
      setMessage("Family deleted successfully.");
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Failed to delete family."));
    }
  };

  const handleMemberSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFamilyMember) {
      return;
    }

    try {
      setMemberError(null);
      setMessage(null);
      await updateMember.mutateAsync({
        id: selectedFamilyMember.id,
        data: {
          name: memberValues.name,
          gender: memberValues.gender,
          birthDate: new Date(memberValues.birthDate).toISOString(),
          phone: memberValues.phone,
          email: memberValues.email,
          role: memberValues.role,
          isActive: memberValues.isActive,
        },
      });
      setMessage("Family member updated successfully.");
      setSelectedFamilyMember(null);
    } catch (submitError) {
      setMemberError(
        getErrorMessage(submitError, "Failed to update family member."),
      );
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-white/70">
        <CardHeader className="shrink-0 border-b border-border/60 bg-[linear-gradient(135deg,rgba(34,71,146,0.08),rgba(204,169,88,0.08))] px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Management
              </p>
              <CardTitle className="mt-2 text-xl tracking-tight sm:text-2xl">
                Families
              </CardTitle>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Manage household records, assign them to a region, and add
                family members during creation.
              </p>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto sm:min-w-36">
                  Create Family
                </Button>
              </DialogTrigger>

              <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[1.5rem] border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,247,241,0.98))] p-5 shadow-[0_40px_90px_-40px_rgba(16,28,56,0.45)] sm:rounded-[1.75rem] sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl tracking-tight sm:text-2xl">
                    Create Family
                  </DialogTitle>
                  <DialogDescription>
                    Add the family details below. You can also add family
                    members now so you do not need to switch pages afterward.
                  </DialogDescription>
                </DialogHeader>

                <form className="space-y-6" onSubmit={handleCreateSubmit}>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-family-name">Family Name</Label>
                      <Input
                        id="create-family-name"
                        className="h-11 rounded-2xl border-border/70 bg-white/80 px-4"
                        placeholder="The Example Family"
                        required
                        value={createValues.familyName}
                        onChange={(event) =>
                          handleCreateValueChange("familyName", event.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-family-address">Address</Label>
                      <Input
                        id="create-family-address"
                        className="h-11 rounded-2xl border-border/70 bg-white/80 px-4"
                        placeholder="123 Grace Street"
                        required
                        value={createValues.address}
                        onChange={(event) =>
                          handleCreateValueChange("address", event.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-family-region">Region</Label>
                      <Select
                        value={createValues.regionId || undefined}
                        onValueChange={(value) =>
                          handleCreateValueChange("regionId", value)
                        }
                      >
                        <SelectTrigger id="create-family-region">
                          <SelectValue placeholder="Select Region" />
                        </SelectTrigger>
                        <SelectContent>
                          {accessibleRegions.map((region) => (
                            <SelectItem key={region.id} value={region.id}>
                              {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold tracking-tight">
                          Initial Family Members
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Optional. Add members here and they will be created
                          together with the family.
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddMember}
                      >
                        Add Member
                      </Button>
                    </div>

                    {createMembers.length ? (
                      <div className="space-y-4">
                        {createMembers.map((member, index) => (
                          <div
                            key={member.id}
                            className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4"
                          >
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <div className="text-sm font-medium">
                                Member {index + 1}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                Remove
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`member-name-${member.id}`}>
                                  Full Name
                                </Label>
                                <Input
                                  id={`member-name-${member.id}`}
                                  className="h-11 rounded-2xl border-border/70 bg-white/80 px-4"
                                  required
                                  value={member.name}
                                  onChange={(event) =>
                                    handleMemberChange(
                                      member.id,
                                      "name",
                                      event.target.value,
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`member-gender-${member.id}`}>
                                  Gender
                                </Label>
                                <Select
                                  value={member.gender || undefined}
                                  onValueChange={(value) =>
                                    handleMemberChange(member.id, "gender", value)
                                  }
                                >
                                  <SelectTrigger id={`member-gender-${member.id}`}>
                                    <SelectValue placeholder="Select Gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {genderOptions.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`member-birthdate-${member.id}`}>
                                  Birth Date
                                </Label>
                                <Input
                                  id={`member-birthdate-${member.id}`}
                                  type="date"
                                  className="h-11 rounded-2xl border-border/70 bg-white/80 px-4"
                                  required
                                  value={member.birthDate}
                                  onChange={(event) =>
                                    handleMemberChange(
                                      member.id,
                                      "birthDate",
                                      event.target.value,
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`member-role-${member.id}`}>
                                  Role
                                </Label>
                                <Select
                                  value={member.role || undefined}
                                  onValueChange={(value) =>
                                    handleMemberChange(member.id, "role", value)
                                  }
                                >
                                  <SelectTrigger id={`member-role-${member.id}`}>
                                    <SelectValue placeholder="Select Role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {memberRoleOptions.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`member-phone-${member.id}`}>
                                  Phone
                                </Label>
                                <Input
                                  id={`member-phone-${member.id}`}
                                  className="h-11 rounded-2xl border-border/70 bg-white/80 px-4"
                                  required
                                  value={member.phone}
                                  onChange={(event) =>
                                    handleMemberChange(
                                      member.id,
                                      "phone",
                                      event.target.value,
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`member-email-${member.id}`}>
                                  Email
                                </Label>
                                <Input
                                  id={`member-email-${member.id}`}
                                  type="email"
                                  className="h-11 rounded-2xl border-border/70 bg-white/80 px-4"
                                  required
                                  value={member.email}
                                  onChange={(event) =>
                                    handleMemberChange(
                                      member.id,
                                      "email",
                                      event.target.value,
                                    )
                                  }
                                />
                              </div>

                              <label className="flex h-11 items-center gap-2 rounded-2xl border border-border/70 bg-white/80 px-4 text-sm md:col-span-2">
                                <input
                                  type="checkbox"
                                  checked={member.isActive}
                                  onChange={(event) =>
                                    handleMemberChange(
                                      member.id,
                                      "isActive",
                                      event.target.checked,
                                    )
                                  }
                                />
                                Active member
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 px-4 py-6 text-sm text-muted-foreground">
                        No members added yet. You can still create the family
                        now, or click “Add Member” to include them immediately.
                      </div>
                    )}
                  </div>

                  {error ? <p className="text-sm text-red-500">{error}</p> : null}

                  <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      disabled={createFamily.isPending}
                      type="submit"
                      className="w-full sm:w-auto"
                    >
                      {createFamily.isPending ? "Saving..." : "Create Family"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4 sm:px-6">
          {message ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          {error && !isCreateOpen && !editingItemId ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Input
              className="h-12 rounded-2xl border-border/70 bg-white/80 px-4 shadow-xs md:max-w-md"
              placeholder="Search by family, address, or region"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />

            <div className="w-full rounded-2xl border border-border/70 bg-white/70 px-4 py-2 text-center text-sm text-muted-foreground shadow-xs sm:w-auto sm:rounded-full">
              {filteredFamilies.length} visible entries
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-[1.5rem] border border-border/70 bg-white/65 shadow-[0_18px_40px_-30px_rgba(23,32,62,0.32)] backdrop-blur-sm">
            <div className="h-full overflow-auto">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="bg-[linear-gradient(180deg,rgba(247,244,235,0.95),rgba(255,255,255,0.8))]">
                    <TableHead className="sticky top-0 z-10 h-14 bg-[linear-gradient(180deg,rgba(247,244,235,0.98),rgba(255,255,255,0.92))] text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Family
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 h-14 bg-[linear-gradient(180deg,rgba(247,244,235,0.98),rgba(255,255,255,0.92))] text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Address
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 h-14 bg-[linear-gradient(180deg,rgba(247,244,235,0.98),rgba(255,255,255,0.92))] text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Region
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 w-[180px] bg-[linear-gradient(180deg,rgba(247,244,235,0.98),rgba(255,255,255,0.92))] text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredFamilies.length ? (
                    filteredFamilies.map((item) => {
                      const isEditing = editingItemId === item.id;

                      return (
                        <TableRow
                          key={item.id}
                          className="border-border/60 transition-colors hover:bg-[rgba(34,71,146,0.035)]"
                        >
                          <TableCell>{item.familyName}</TableCell>
                          <TableCell>{item.address}</TableCell>
                          <TableCell>{item.region?.name ?? item.regionId}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Dialog
                                open={isEditing}
                                onOpenChange={handleEditOpenChange}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={updateFamily.isPending}
                                    onClick={() => handleEdit(item)}
                                  >
                                    {updateFamily.isPending && isEditing
                                      ? "Saving..."
                                      : "Edit"}
                                  </Button>
                                </DialogTrigger>

                                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[1.5rem] border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,247,241,0.98))] p-5 shadow-[0_40px_90px_-40px_rgba(16,28,56,0.45)] sm:rounded-[1.75rem] sm:p-6">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl tracking-tight sm:text-2xl">
                                      Update Family
                                    </DialogTitle>
                                    <DialogDescription>
                                      Update the details for this family.
                                    </DialogDescription>
                                  </DialogHeader>

                                  <form
                                    className="space-y-4"
                                    onSubmit={(event) =>
                                      handleEditSubmit(event, item.id)
                                    }
                                  >
                                    <div className="grid grid-cols-1 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor={`edit-family-name-${item.id}`}>
                                          Family Name
                                        </Label>
                                        <Input
                                          id={`edit-family-name-${item.id}`}
                                          className="h-11 rounded-2xl border-border/70 bg-white/80 px-4"
                                          required
                                          value={editValues.familyName}
                                          onChange={(event) =>
                                            handleEditValueChange(
                                              "familyName",
                                              event.target.value,
                                            )
                                          }
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor={`edit-family-address-${item.id}`}>
                                          Address
                                        </Label>
                                        <Input
                                          id={`edit-family-address-${item.id}`}
                                          className="h-11 rounded-2xl border-border/70 bg-white/80 px-4"
                                          required
                                          value={editValues.address}
                                          onChange={(event) =>
                                            handleEditValueChange(
                                              "address",
                                              event.target.value,
                                            )
                                          }
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor={`edit-family-region-${item.id}`}>
                                          Region
                                        </Label>
                                        <Select
                                          value={editValues.regionId || undefined}
                                          onValueChange={(value) =>
                                            handleEditValueChange("regionId", value)
                                          }
                                        >
                                          <SelectTrigger
                                            id={`edit-family-region-${item.id}`}
                                          >
                                            <SelectValue placeholder="Select Region" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {accessibleRegions.map((region) => (
                                              <SelectItem
                                                key={region.id}
                                                value={region.id}
                                              >
                                                {region.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>

                                    {error ? (
                                      <p className="text-sm text-red-500">{error}</p>
                                    ) : null}

                                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                                      <DialogClose asChild>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className="w-full sm:w-auto"
                                        >
                                          Cancel
                                        </Button>
                                      </DialogClose>
                                      <Button
                                        disabled={updateFamily.isPending}
                                        type="submit"
                                        className="w-full sm:w-auto"
                                      >
                                        {updateFamily.isPending
                                          ? "Saving..."
                                          : "Update Family"}
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>

                              <Dialog
                                open={membersFamilyId === item.id}
                                onOpenChange={handleMembersOpenChange}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenMembers(item.id)}
                                  >
                                    Members
                                  </Button>
                                </DialogTrigger>

                                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[1.5rem] border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,247,241,0.98))] p-5 shadow-[0_40px_90px_-40px_rgba(16,28,56,0.45)] sm:rounded-[1.75rem] sm:p-6">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl tracking-tight sm:text-2xl">
                                      Family Members
                                    </DialogTitle>
                                    <DialogDescription>
                                      Edit members assigned to {item.familyName}.
                                    </DialogDescription>
                                  </DialogHeader>

                                  <div className="space-y-4">
                                    <div className="space-y-3 rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                                      <div>
                                        <h3 className="text-base font-semibold tracking-tight">
                                          Household List
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                          Choose a member to update their profile
                                          data from this family menu.
                                        </p>
                                      </div>

                                      {isMembersLoading ? (
                                        <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 px-4 py-6 text-sm text-muted-foreground">
                                          Loading family members...
                                        </div>
                                      ) : familyMembers.length ? (
                                        <div className="space-y-3">
                                          {familyMembers.map((member) => (
                                            <div
                                              key={member.id}
                                              className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 md:flex-row md:items-center md:justify-between"
                                            >
                                              <div>
                                                <p className="text-sm font-medium">
                                                  {member.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  {formatMemberRole(member.role)} •{" "}
                                                  {member.phone || "No phone"}
                                                </p>
                                              </div>

                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                  handleOpenMemberEditor(member)
                                                }
                                              >
                                                Edit Member
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 px-4 py-6 text-sm text-muted-foreground">
                                          No members found for this family.
                                        </div>
                                      )}
                                    </div>

                                    {selectedFamilyMember ? (
                                      <form
                                        className="space-y-4 rounded-[1.25rem] border border-border/70 bg-white/70 p-4"
                                        onSubmit={handleMemberSubmit}
                                      >
                                        <div>
                                          <h3 className="text-base font-semibold tracking-tight">
                                            Edit {selectedFamilyMember.name}
                                          </h3>
                                          <p className="text-sm text-muted-foreground">
                                            Update the selected family member&apos;s
                                            information below.
                                          </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                          <div className="space-y-2">
                                            <Label htmlFor={`edit-member-name-${item.id}`}>
                                              Full Name
                                            </Label>
                                            <Input
                                              id={`edit-member-name-${item.id}`}
                                              className="h-11 rounded-2xl border-border/70 bg-white/80 px-4"
                                              required
                                              value={memberValues.name}
                                              onChange={(event) =>
                                                setMemberValues((current) => ({
                                                  ...current,
                                                  name: event.target.value,
                                                }))
                                              }
                                            />
                                          </div>

                                          <div className="space-y-2">
                                            <Label htmlFor={`edit-member-gender-${item.id}`}>
                                              Gender
                                            </Label>
                                            <Select
                                              value={memberValues.gender || undefined}
                                              onValueChange={(value) =>
                                                setMemberValues((current) => ({
                                                  ...current,
                                                  gender: value,
                                                }))
                                              }
                                            >
                                              <SelectTrigger
                                                id={`edit-member-gender-${item.id}`}
                                              >
                                                <SelectValue placeholder="Select Gender" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {genderOptions.map((option) => (
                                                  <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                  >
                                                    {option.label}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          <div className="space-y-2">
                                            <Label htmlFor={`edit-member-birthdate-${item.id}`}>
                                              Birth Date
                                            </Label>
                                            <Input
                                              id={`edit-member-birthdate-${item.id}`}
                                              type="date"
                                              className="h-11 rounded-2xl border-border/70 bg-white/80 px-4"
                                              required
                                              value={memberValues.birthDate}
                                              onChange={(event) =>
                                                setMemberValues((current) => ({
                                                  ...current,
                                                  birthDate: event.target.value,
                                                }))
                                              }
                                            />
                                          </div>

                                          <div className="space-y-2">
                                            <Label htmlFor={`edit-member-role-${item.id}`}>
                                              Role
                                            </Label>
                                            <Select
                                              value={memberValues.role || undefined}
                                              onValueChange={(value) =>
                                                setMemberValues((current) => ({
                                                  ...current,
                                                  role: value,
                                                }))
                                              }
                                            >
                                              <SelectTrigger
                                                id={`edit-member-role-${item.id}`}
                                              >
                                                <SelectValue placeholder="Select Role" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {memberRoleOptions.map((option) => (
                                                  <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                  >
                                                    {option.label}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          <div className="space-y-2">
                                            <Label htmlFor={`edit-member-phone-${item.id}`}>
                                              Phone
                                            </Label>
                                            <Input
                                              id={`edit-member-phone-${item.id}`}
                                              className="h-11 rounded-2xl border-border/70 bg-white/80 px-4"
                                              required
                                              value={memberValues.phone}
                                              onChange={(event) =>
                                                setMemberValues((current) => ({
                                                  ...current,
                                                  phone: event.target.value,
                                                }))
                                              }
                                            />
                                          </div>

                                          <div className="space-y-2">
                                            <Label htmlFor={`edit-member-email-${item.id}`}>
                                              Email
                                            </Label>
                                            <Input
                                              id={`edit-member-email-${item.id}`}
                                              type="email"
                                              className="h-11 rounded-2xl border-border/70 bg-white/80 px-4"
                                              required
                                              value={memberValues.email}
                                              onChange={(event) =>
                                                setMemberValues((current) => ({
                                                  ...current,
                                                  email: event.target.value,
                                                }))
                                              }
                                            />
                                          </div>

                                          <label className="flex h-11 items-center gap-2 rounded-2xl border border-border/70 bg-white/80 px-4 text-sm md:col-span-2">
                                            <input
                                              type="checkbox"
                                              checked={memberValues.isActive}
                                              onChange={(event) =>
                                                setMemberValues((current) => ({
                                                  ...current,
                                                  isActive: event.target.checked,
                                                }))
                                              }
                                            />
                                            Active member
                                          </label>
                                        </div>

                                        {memberError ? (
                                          <p className="text-sm text-red-500">
                                            {memberError}
                                          </p>
                                        ) : null}

                                        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                                          <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full sm:w-auto"
                                            onClick={() =>
                                              setSelectedFamilyMember(null)
                                            }
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            disabled={updateMember.isPending}
                                            type="submit"
                                            className="w-full sm:w-auto"
                                          >
                                            {updateMember.isPending
                                              ? "Saving..."
                                              : "Save Member"}
                                          </Button>
                                        </DialogFooter>
                                      </form>
                                    ) : null}
                                  </div>
                                </DialogContent>
                              </Dialog>

                              {!isCoordinator ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={deleteFamily.isPending}
                                  onClick={() => handleDelete(item)}
                                >
                                  {deleteFamily.isPending &&
                                  deleteFamily.variables === item.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {familyResult?.meta ? (
            <div className="flex flex-col gap-3 border-t border-border/60 pt-2 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">
                Page {familyResult.meta.page} of {familyResult.meta.totalPages} •{" "}
                {familyResult.meta.total} total records
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <div className="flex items-center justify-between gap-2 sm:justify-start">
                  <Label htmlFor="families-page-size" className="text-sm">
                    Rows
                  </Label>
                  <Select
                    value={String(familyResult.meta.limit)}
                    onValueChange={(value) => {
                      setLimit(Number(value));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger
                      id="families-page-size"
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
                    disabled={!canGoPrevious}
                    onClick={() => setPage((current) => current - 1)}
                    className="w-full sm:w-auto"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!canGoNext}
                    onClick={() => setPage((current) => current + 1)}
                    className="w-full sm:w-auto"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
