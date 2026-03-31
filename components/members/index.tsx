"use client";

import { useState } from "react";
import { useStoredUser } from "@/lib/auth-session";
import {
  EntityManager,
  FormValues,
} from "@/components/dashboard/entity-manager";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/lib/helper";
import { cn } from "@/lib/utils";
import MemberSelfService from "./self-service";
import { useFamilies } from "@/services/family";
import {
  getPelkatLabel,
  useCreateMember,
  useDeleteMember,
  useMembers,
  useUpdateMember,
} from "@/services/member";
import { Member } from "@/type/member";

const toMemberPayload = (values: FormValues) => ({
  name: String(values.name),
  gender: String(values.gender),
  birthDate: new Date(String(values.birthDate)).toISOString(),
  phone: String(values.phone),
  email: String(values.email),
  role: String(values.role),
  isActive: Boolean(values.isActive),
  familyId: String(values.familyId),
});

const formatMemberRole = (role: string) =>
  role
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());

const memberRoleOptions = [
  { label: "Family Head", value: "FAMILY_HEAD" },
  { label: "Wife", value: "WIFE" },
  { label: "Child", value: "CHILD" },
  { label: "Other", value: "OTHER" },
];

const pelkatBadgeClasses: Record<string, string> = {
  "Pelayanan Anak":
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Persekutuan Taruna":
    "border-amber-200 bg-amber-50 text-amber-700",
  "Gerakan Pemuda":
    "border-blue-200 bg-blue-50 text-blue-700",
  "Persekutuan Kaum Perempuan":
    "border-purple-200 bg-purple-50 text-purple-700",
  "Persekutuan kaum Bapak":
    "border-slate-200 bg-slate-100 text-slate-700",
  "Persekutuan kaum Lanjut Usia":
    "border-orange-200 bg-orange-50 text-orange-700",
};

const statusBadgeClasses: Record<"Active" | "Inactive", string> = {
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Inactive: "border-red-200 bg-red-50 text-red-700",
};

export default function MembersPage() {
  const currentUser = useStoredUser();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: memberResult, isLoading } = useMembers({ page, limit });
  const { data: familyResult } = useFamilies({ page: 1, limit: 100 });
  const families = familyResult?.items ?? [];
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();

  if (currentUser?.role === "MEMBER") {
    return <MemberSelfService />;
  }

  return (
    <EntityManager<Member>
      title="Members"
      entityLabel="Member"
      description="Track member profiles, household assignment, and status."
      createLabel="Create Member"
      updateLabel="Update Member"
      searchPlaceholder="Search by name, email, phone, or family"
      fields={[
        {
          name: "name",
          label: "Full Name",
          placeholder: "John Example",
          required: true,
        },
        {
          name: "gender",
          label: "Gender",
          type: "select",
          required: true,
          options: [
            { label: "Male", value: "MALE" },
            { label: "Female", value: "FEMALE" },
          ],
        },
        {
          name: "birthDate",
          label: "Birth Date",
          type: "date",
          required: true,
        },
        {
          name: "phone",
          label: "Phone",
          placeholder: "+628123456789",
          required: true,
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "john.example@example.com",
          required: true,
        },
        {
          name: "role",
          label: "Role",
          type: "select",
          required: true,
          options: memberRoleOptions,
        },
        {
          name: "familyId",
          label: "Family",
          type: "select",
          required: true,
          options: families.map((family) => ({
            label: family.familyName,
            value: family.id,
          })),
        },
        {
          name: "isActive",
          label: "Status",
          type: "checkbox",
          checkboxLabel: "Active member",
        },
      ]}
      initialValues={{
        name: "",
        gender: "",
        birthDate: "",
        phone: "",
        email: "",
        role: "",
        familyId: "",
        isActive: true,
      }}
      items={memberResult?.items ?? []}
      columns={[
        {
          key: "name",
          label: "Name",
          render: (item) => item.name,
        },
        {
          key: "family",
          label: "Family",
          render: (item) => item.family?.familyName ?? item.familyId,
        },
        {
          key: "pelkat",
          label: "Pelkat",
          render: (item) => {
            const pelkatValue = item.pelkat ?? item.memberPelkat ?? "";

            if (!pelkatValue) {
              return "-";
            }

            const label = getPelkatLabel(pelkatValue);

            return (
              <Badge
                variant="outline"
                className={cn(
                  "py-1",
                  pelkatBadgeClasses[label] ??
                    "border-border/70 bg-muted/60 text-muted-foreground",
                )}
              >
                {label}
              </Badge>
            );
          },
        },
        {
          key: "role",
          label: "Role",
          render: (item) => formatMemberRole(item.role),
        },
        {
          key: "status",
          label: "Status",
          render: (item) => {
            const status = item.isActive ? "Active" : "Inactive";

            return (
              <Badge
                variant="outline"
                className={cn(
                  "py-1",
                  statusBadgeClasses[status],
                )}
              >
                {status}
              </Badge>
            );
          },
        },
      ]}
      getItemId={(item) => item.id}
      filterItems={(item, query) =>
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.phone.toLowerCase().includes(query) ||
        (item.family?.familyName ?? "").toLowerCase().includes(query) ||
        (item.pelkat ?? item.memberPelkat ?? "").toLowerCase().includes(query)
      }
      getEditValues={(item) => ({
        name: item.name,
        gender: item.gender,
        birthDate: item.birthDate.slice(0, 10),
        phone: item.phone,
        email: item.email,
        role: item.role,
        familyId: item.familyId,
        isActive: item.isActive,
      })}
      isLoading={isLoading}
      isSubmitting={createMember.isPending || updateMember.isPending}
      deletingId={deleteMember.variables ?? null}
      editingId={updateMember.variables?.id ?? null}
      pagination={memberResult?.meta}
      onPageChange={setPage}
      onPageSizeChange={(nextLimit) => {
        setLimit(nextLimit);
        setPage(1);
      }}
      onCreate={async (values) => {
        await createMember.mutateAsync(toMemberPayload(values));
      }}
      onUpdate={async (item, values) => {
        try {
          await updateMember.mutateAsync({
            id: item.id,
            data: toMemberPayload(values),
          });
        } catch (error) {
          throw new Error(getErrorMessage(error, "Failed to update member."));
        }
      }}
      onDelete={async (item) => {
        try {
          await deleteMember.mutateAsync(item.id);
        } catch (error) {
          throw new Error(getErrorMessage(error, "Failed to delete member."));
        }
      }}
    />
  );
}
