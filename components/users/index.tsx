"use client";

import { useState } from "react";
import {
  EntityManager,
  FormValues,
} from "@/components/dashboard/entity-manager";
import { getErrorMessage } from "@/lib/helper";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/services/user";
import { User } from "@/type/user";

const toUserPayload = (values: FormValues) => ({
  email: String(values.email),
  password: String(values.password),
  role: String(values.role),
});

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: userResult, isLoading } = useUsers({ page, limit });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  return (
    <EntityManager<User>
      title="Users"
      entityLabel="User"
      description="Manage staff and admin accounts for the church system."
      createLabel="Create User"
      updateLabel="Update User"
      searchPlaceholder="Search users by email or role"
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
          required: true,
        },
        {
          name: "role",
          label: "Role",
          type: "select",
          required: true,
          options: [
            { label: "Admin", value: "ADMIN" },
            { label: "Staff", value: "STAFF" },
          ],
        },
      ]}
      initialValues={{ email: "", password: "", role: "" }}
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
          key: "createdAt",
          label: "Created",
          render: (item) => new Date(item.createdAt).toLocaleDateString(),
        },
      ]}
      getItemId={(item) => item.id}
      filterItems={(item, query) =>
        item.email.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query)
      }
      getEditValues={(item) => ({
        email: item.email,
        password: "",
        role: item.role,
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
