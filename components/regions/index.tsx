"use client";

import { useState } from "react";
import {
  EntityManager,
  FormValues,
} from "@/components/dashboard/entity-manager";
import { getErrorMessage } from "@/lib/helper";
import { useBranches } from "@/services/branch";
import {
  useCreateRegion,
  useDeleteRegion,
  useRegions,
  useUpdateRegion,
} from "@/services/region";
import { Regions } from "@/type/region";

const toRegionPayload = (values: FormValues) => ({
  name: String(values.name),
  branchId: String(values.branchId),
});

export default function RegionsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: regionResult, isLoading } = useRegions({ page, limit });
  const { data: branchResult } = useBranches({ page: 1, limit: 100 });
  const branches = branchResult?.items ?? [];
  const createRegion = useCreateRegion();
  const updateRegion = useUpdateRegion();
  const deleteRegion = useDeleteRegion();

  return (
    <EntityManager<Regions>
      title="Regions"
      entityLabel="Region"
      description="Create and manage church regions under each branch."
      createLabel="Create Region"
      updateLabel="Update Region"
      searchPlaceholder="Search regions by name or branch"
      fields={[
        {
          name: "name",
          label: "Region Name",
          placeholder: "Region 1",
          required: true,
        },
        {
          name: "branchId",
          label: "Branch",
          type: "select",
          required: true,
          options: branches.map((branch) => ({
            label: branch.name,
            value: branch.id,
          })),
        },
      ]}
      initialValues={{ name: "", branchId: "" }}
      items={regionResult?.items ?? []}
      columns={[
        {
          key: "name",
          label: "Region",
          render: (item) => item.name,
        },
        {
          key: "branch",
          label: "Branch",
          render: (item) => item.branch?.name ?? item.branchId,
        },
        {
          key: "createdAt",
          label: "Created",
          render: (item) => new Date(item.createdAt).toLocaleDateString(),
        },
      ]}
      getItemId={(item) => item.id}
      filterItems={(item, query) =>
        item.name.toLowerCase().includes(query) ||
        (item.branch?.name ?? "").toLowerCase().includes(query)
      }
      getEditValues={(item) => ({
        name: item.name,
        branchId: item.branchId,
      })}
      isLoading={isLoading}
      isSubmitting={createRegion.isPending || updateRegion.isPending}
      deletingId={deleteRegion.variables ?? null}
      editingId={updateRegion.variables?.id ?? null}
      pagination={regionResult?.meta}
      onPageChange={setPage}
      onPageSizeChange={(nextLimit) => {
        setLimit(nextLimit);
        setPage(1);
      }}
      onCreate={async (values) => {
        await createRegion.mutateAsync(toRegionPayload(values));
      }}
      onUpdate={async (item, values) => {
        try {
          await updateRegion.mutateAsync({
            id: item.id,
            data: toRegionPayload(values),
          });
        } catch (error) {
          throw new Error(getErrorMessage(error, "Failed to update region."));
        }
      }}
      onDelete={async (item) => {
        try {
          await deleteRegion.mutateAsync(item.id);
        } catch (error) {
          throw new Error(getErrorMessage(error, "Failed to delete region."));
        }
      }}
    />
  );
}
