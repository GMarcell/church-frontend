"use client";

import { useState } from "react";
import {
  EntityManager,
  FormValues,
} from "@/components/dashboard/entity-manager";
import { getErrorMessage } from "@/lib/helper";
import {
  useCreateFamily,
  useDeleteFamily,
  useFamilies,
  useUpdateFamily,
} from "@/services/family";
import { useRegions } from "@/services/region";
import { Family } from "@/type/family";

const toFamilyPayload = (values: FormValues) => ({
  familyName: String(values.familyName),
  address: String(values.address),
  regionId: String(values.regionId),
});

export default function FamiliesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: familyResult, isLoading } = useFamilies({ page, limit });
  const { data: regionResult } = useRegions({ page: 1, limit: 100 });
  const regions = regionResult?.items ?? [];
  const createFamily = useCreateFamily();
  const updateFamily = useUpdateFamily();
  const deleteFamily = useDeleteFamily();

  return (
    <EntityManager<Family>
      title="Families"
      entityLabel="Family"
      description="Manage household records and link them to a region."
      createLabel="Create Family"
      updateLabel="Update Family"
      searchPlaceholder="Search by family, address, or region"
      fields={[
        {
          name: "familyName",
          label: "Family Name",
          placeholder: "The Example Family",
          required: true,
        },
        {
          name: "address",
          label: "Address",
          placeholder: "123 Grace Street",
          required: true,
        },
        {
          name: "regionId",
          label: "Region",
          type: "select",
          required: true,
          options: regions.map((region) => ({
            label: region.name,
            value: region.id,
          })),
        },
      ]}
      initialValues={{ familyName: "", address: "", regionId: "" }}
      items={familyResult?.items ?? []}
      columns={[
        {
          key: "familyName",
          label: "Family",
          render: (item) => item.familyName,
        },
        {
          key: "address",
          label: "Address",
          render: (item) => item.address,
        },
        {
          key: "region",
          label: "Region",
          render: (item) => item.region?.name ?? item.regionId,
        },
      ]}
      getItemId={(item) => item.id}
      filterItems={(item, query) =>
        item.familyName.toLowerCase().includes(query) ||
        item.address.toLowerCase().includes(query) ||
        (item.region?.name ?? "").toLowerCase().includes(query)
      }
      getEditValues={(item) => ({
        familyName: item.familyName,
        address: item.address,
        regionId: item.regionId,
      })}
      isLoading={isLoading}
      isSubmitting={createFamily.isPending || updateFamily.isPending}
      deletingId={deleteFamily.variables ?? null}
      editingId={updateFamily.variables?.id ?? null}
      pagination={familyResult?.meta}
      onPageChange={setPage}
      onPageSizeChange={(nextLimit) => {
        setLimit(nextLimit);
        setPage(1);
      }}
      onCreate={async (values) => {
        await createFamily.mutateAsync(toFamilyPayload(values));
      }}
      onUpdate={async (item, values) => {
        try {
          await updateFamily.mutateAsync({
            id: item.id,
            data: toFamilyPayload(values),
          });
        } catch (error) {
          throw new Error(getErrorMessage(error, "Failed to update family."));
        }
      }}
      onDelete={async (item) => {
        try {
          await deleteFamily.mutateAsync(item.id);
        } catch (error) {
          throw new Error(getErrorMessage(error, "Failed to delete family."));
        }
      }}
    />
  );
}
