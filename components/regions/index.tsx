"use client";

import { useMemo, useState } from "react";
import {
  EntityManager,
  FormValues,
} from "@/components/dashboard/entity-manager";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStoredUser } from "@/lib/auth-session";
import { getErrorMessage } from "@/lib/helper";
import { useBranches } from "@/services/branch";
import {
  useAssignRegionCoordinator,
  useCreateRegion,
  useDeleteRegion,
  useRegions,
  useUpdateRegion,
} from "@/services/region";
import { useUsers } from "@/services/user";
import { Regions } from "@/type/region";

const toRegionPayload = (values: FormValues) => ({
  name: String(values.name),
  branchId: String(values.branchId),
});

export default function RegionsPage() {
  const currentUser = useStoredUser();
  const isCoordinator = currentUser?.role === "COORDINATOR";
  const canManageRegionSettings = currentUser?.role === "ADMIN" || currentUser?.role === "STAFF";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [assigningRegion, setAssigningRegion] = useState<Regions | null>(null);
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState<string>("");
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const { data: regionResult, isLoading } = useRegions({ page, limit });
  const { data: branchResult } = useBranches({ page: 1, limit: 100 });
  const { data: userResult } = useUsers({ page: 1, limit: 200 });
  const branches = branchResult?.items ?? [];
  const coordinatorUsers = (userResult?.items ?? []).filter(
    (user) => user.role === "COORDINATOR",
  );
  const createRegion = useCreateRegion();
  const updateRegion = useUpdateRegion();
  const deleteRegion = useDeleteRegion();
  const assignCoordinator = useAssignRegionCoordinator();

  const items = useMemo(() => {
    const regions = regionResult?.items ?? [];
    if (!isCoordinator) {
      return regions;
    }

    return regions.filter(
      (region) =>
        region.id === currentUser?.regionId ||
        region.coordinatorId === currentUser?.id,
    );
  }, [currentUser?.id, currentUser?.regionId, isCoordinator, regionResult?.items]);

  const openAssignDialog = (region: Regions) => {
    setAssigningRegion(region);
    setSelectedCoordinatorId(region.coordinatorId ?? "none");
    setAssignmentError(null);
  };

  const handleAssignDialogChange = (open: boolean) => {
    if (!open) {
      setAssigningRegion(null);
      setSelectedCoordinatorId("");
      setAssignmentError(null);
    }
  };

  const handleAssignCoordinator = async () => {
    if (!assigningRegion) {
      return;
    }

    setAssignmentError(null);

    try {
      await assignCoordinator.mutateAsync({
        id: assigningRegion.id,
        data: {
          coordinatorId:
            selectedCoordinatorId && selectedCoordinatorId !== "none"
              ? selectedCoordinatorId
              : null,
        },
      });
      handleAssignDialogChange(false);
    } catch (error) {
      setAssignmentError(
        getErrorMessage(error, "Failed to update region coordinator."),
      );
    }
  };

  return (
    <>
      <EntityManager<Regions>
        title="Regions"
        entityLabel="Region"
        description="Create and manage church regions, see the assigned coordinator, and connect each region with the right leader."
        createLabel="Create Region"
        updateLabel="Update Region"
        searchPlaceholder="Search regions by name, branch, or coordinator"
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
        items={items}
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
            key: "coordinator",
            label: "Coordinator",
            render: (item) => item.coordinator?.email ?? item.coordinatorId ?? "Unassigned",
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
          (item.branch?.name ?? "").toLowerCase().includes(query) ||
          (item.coordinator?.email ?? "").toLowerCase().includes(query)
        }
        getEditValues={(item) => ({
          name: item.name,
          branchId: item.branchId,
        })}
        isLoading={isLoading}
        isSubmitting={
          createRegion.isPending ||
          updateRegion.isPending ||
          assignCoordinator.isPending
        }
        deletingId={deleteRegion.variables ?? null}
        editingId={updateRegion.variables?.id ?? null}
        pagination={regionResult?.meta}
        canCreate={canManageRegionSettings}
        canEdit={canManageRegionSettings}
        canDelete={canManageRegionSettings}
        renderRowActions={
          canManageRegionSettings
            ? (item) => (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAssignDialog(item)}
                >
                  Assign Coordinator
                </Button>
              )
            : undefined
        }
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

      <Dialog
        open={Boolean(assigningRegion)}
        onOpenChange={handleAssignDialogChange}
      >
        <DialogContent className="rounded-[1.5rem] border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,247,241,0.98))] p-5 shadow-[0_40px_90px_-40px_rgba(16,28,56,0.45)] sm:rounded-[1.75rem] sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl tracking-tight sm:text-2xl">
              Assign Coordinator
            </DialogTitle>
            <DialogDescription>
              Choose the coordinator for {assigningRegion?.name ?? "this region"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="region-coordinator">Coordinator</Label>
            <Select
              value={selectedCoordinatorId || "none"}
              onValueChange={setSelectedCoordinatorId}
            >
              <SelectTrigger id="region-coordinator">
                <SelectValue placeholder="Select coordinator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No coordinator</SelectItem>
                {coordinatorUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {assignmentError ? (
            <p className="text-sm text-red-500">{assignmentError}</p>
          ) : null}

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={assignCoordinator.isPending}
              onClick={handleAssignCoordinator}
            >
              {assignCoordinator.isPending ? "Saving..." : "Save Coordinator"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
