"use client";

import { useState } from "react";
import {
  EntityManager,
  FormValues,
} from "@/components/dashboard/entity-manager";
import { getErrorMessage } from "@/lib/helper";
import { useFamilies } from "@/services/family";
import {
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

const memberRoleOptions = [
  { label: "Family Head", value: "FAMILY_HEAD" },
  { label: "Spouse", value: "SPOUSE" },
  { label: "Child", value: "CHILD" },
  { label: "Other", value: "OTHER" },
];

export default function MembersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: memberResult, isLoading } = useMembers({ page, limit });
  const { data: familyResult } = useFamilies({ page: 1, limit: 100 });
  const families = familyResult?.items ?? [];
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();

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
          key: "role",
          label: "Role",
          render: (item) => item.role,
        },
        {
          key: "status",
          label: "Status",
          render: (item) => (item.isActive ? "Active" : "Inactive"),
        },
      ]}
      getItemId={(item) => item.id}
      filterItems={(item, query) =>
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.phone.toLowerCase().includes(query) ||
        (item.family?.familyName ?? "").toLowerCase().includes(query)
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
