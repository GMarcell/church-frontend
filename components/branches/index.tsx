"use client";

import { useState } from "react";
import {
  EntityManager,
  FormValues,
} from "@/components/dashboard/entity-manager";
import { getErrorMessage } from "@/lib/helper";
import {
  useBranches,
  useCreateBranch,
  useDeleteBranch,
  useUpdateBranch,
} from "@/services/branch";
import { Branch } from "@/type/branch";

const toBranchPayload = (values: FormValues) => ({
  name: String(values.name),
});

export default function Branches() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: branchResult, isLoading } = useBranches({ page, limit });
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const deleteBranch = useDeleteBranch();

  return (
    <EntityManager<Branch>
      title="Branches"
      entityLabel="Branch"
      description="Manage church branches and keep an eye on connected regions."
      createLabel="Create Branch"
      updateLabel="Update Branch"
      searchPlaceholder="Search branches by name"
      fields={[
        {
          name: "name",
          label: "Branch Name",
          placeholder: "Central Branch",
          required: true,
        },
      ]}
      initialValues={{ name: "" }}
      items={branchResult?.items ?? []}
      columns={[
        {
          key: "name",
          label: "Branch",
          render: (item) => item.name,
        },
        {
          key: "regions",
          label: "Regions",
          render: (item) => item.regions?.length ?? 0,
        },
        {
          key: "createdAt",
          label: "Created",
          render: (item) => new Date(item.createdAt).toLocaleDateString(),
        },
      ]}
      getItemId={(item) => item.id}
      filterItems={(item, query) => item.name.toLowerCase().includes(query)}
      getEditValues={(item) => ({ name: item.name })}
      isLoading={isLoading}
      isSubmitting={createBranch.isPending || updateBranch.isPending}
      deletingId={deleteBranch.variables ?? null}
      editingId={updateBranch.variables?.id ?? null}
      pagination={branchResult?.meta}
      onPageChange={setPage}
      onPageSizeChange={(nextLimit) => {
        setLimit(nextLimit);
        setPage(1);
      }}
      onCreate={async (values) => {
        await createBranch.mutateAsync(toBranchPayload(values));
      }}
      onUpdate={async (item, values) => {
        try {
          await updateBranch.mutateAsync({
            id: item.id,
            data: toBranchPayload(values),
          });
        } catch (error) {
          throw new Error(getErrorMessage(error, "Failed to update branch."));
        }
      }}
      onDelete={async (item) => {
        try {
          await deleteBranch.mutateAsync(item.id);
        } catch (error) {
          throw new Error(getErrorMessage(error, "Failed to delete branch."));
        }
      }}
    />
  );
}
