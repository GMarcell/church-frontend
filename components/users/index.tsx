"use client";

import { useState } from "react";
import {
  EntityManager,
  FormValues,
} from "@/components/dashboard/entity-manager";
import { getErrorMessage } from "@/lib/helper";
import { useRegions } from "@/services/region";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/services/user";
import { User } from "@/type/user";

const toUserPayload = (values: FormValues) => {
  const password = String(values.password ?? "").trim();

  return {
    email: String(values.email),
    password: password || undefined,
    role: String(values.role),
    regionId:
      String(values.role) === "COORDINATOR" && values.regionId
        ? String(values.regionId)
        : undefined,
  };
};

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: userResult, isLoading } = useUsers({ page, limit });
  const { data: regionResult } = useRegions({ page: 1, limit: 100 });
  const regions = regionResult?.items ?? [];
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  return (
    <EntityManager<User>
      title="Users"
      entityLabel="User"
      description="Manage admin, staff, and coordinator accounts for the church system."
      createLabel="Create User"
      updateLabel="Update User"
      searchPlaceholder="Search users by email, role, or region"
      fields={[
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "staff@example.com",
          required: true,
        },
        {
          name: "password",
          label: "Password",
          placeholder: "secret123",
          createRequired: true,
          editRequired: false,
        },
        {
          name: "role",
          label: "Role",
          type: "select",
          required: true,
          options: [
            { label: "Admin", value: "ADMIN" },
            { label: "Staff", value: "STAFF" },
            { label: "Coordinator", value: "COORDINATOR" },
          ],
        },
        {
          name: "regionId",
          label: "Region",
          type: "select",
          options: regions.map((region) => ({
            label: region.name,
            value: region.id,
          })),
        },
      ]}
      initialValues={{ email: "", password: "", role: "", regionId: "" }}
      items={userResult?.items ?? []}
      columns={[
        {
          key: "email",
          label: "Email",
          render: (item) => item.email,
        },
        {
          key: "role",
          label: "Role",
          render: (item) => item.role,
        },
        {
          key: "region",
          label: "Region",
          render: (item) =>
            regions.find((region) => region.id === item.regionId)?.name ??
            item.regionId ??
            "-",
        },
        {
          key: "createdAt",
          label: "Created",
          render: (item) => new Date(item.createdAt).toLocaleDateString(),
        },
      ]}
      getItemId={(item) => item.id}
      filterItems={(item, query) =>
        item.email.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query) ||
        (regions.find((region) => region.id === item.regionId)?.name ?? "")
          .toLowerCase()
          .includes(query)
      }
      getEditValues={(item) => ({
        email: item.email,
        password: "",
        role: item.role,
        regionId: item.regionId ?? "",
      })}
      isLoading={isLoading}
      isSubmitting={createUser.isPending || updateUser.isPending}
      deletingId={deleteUser.variables ?? null}
      editingId={updateUser.variables?.id ?? null}
      pagination={userResult?.meta}
      onPageChange={setPage}
      onPageSizeChange={(nextLimit) => {
        setLimit(nextLimit);
        setPage(1);
      }}
      onCreate={async (values) => {
        await createUser.mutateAsync(toUserPayload(values));
      }}
      onUpdate={async (item, values) => {
        try {
          await updateUser.mutateAsync({
            id: item.id,
            data: toUserPayload(values),
          });
        } catch (error) {
          throw new Error(getErrorMessage(error, "Failed to update user."));
        }
      }}
      onDelete={async (item) => {
        try {
          await deleteUser.mutateAsync(item.id);
        } catch (error) {
          throw new Error(getErrorMessage(error, "Failed to delete user."));
        }
      }}
    />
  );
}
