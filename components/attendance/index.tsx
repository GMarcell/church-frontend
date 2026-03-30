"use client";

import { useState } from "react";
import {
  EntityManager,
  FormValues,
} from "@/components/dashboard/entity-manager";
import { getErrorMessage } from "@/lib/helper";
import {
  useAttendances,
  useCreateAttendance,
  useDeleteAttendance,
  useUpdateAttendance,
} from "@/services/attendance";
import { Attendance } from "@/type/attendance";

const toAttendancePayload = (values: FormValues) => ({
  serviceDate: new Date(String(values.serviceDate)).toISOString(),
  serviceType: String(values.serviceType),
  maleCount: Number(values.maleCount),
  femaleCount: Number(values.femaleCount),
});

export default function AttendancePage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: attendanceResult, isLoading } = useAttendances({ page, limit });
  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  const deleteAttendance = useDeleteAttendance();

  return (
    <EntityManager<Attendance>
      title="Attendance"
      entityLabel="Attendance"
      description="Record worship attendance and keep a history of services."
      createLabel="Create Attendance"
      updateLabel="Update Attendance"
      searchPlaceholder="Search by service type or date"
      fields={[
        {
          name: "serviceDate",
          label: "Service Date",
          type: "date",
          required: true,
        },
        {
          name: "serviceType",
          label: "Service Type",
          placeholder: "Sunday Service",
          required: true,
        },
        {
          name: "maleCount",
          label: "Male Count",
          type: "number",
          required: true,
        },
        {
          name: "femaleCount",
          label: "Female Count",
          type: "number",
          required: true,
        },
      ]}
      initialValues={{
        serviceDate: "",
        serviceType: "",
        maleCount: 0,
        femaleCount: 0,
      }}
      items={attendanceResult?.items ?? []}
      columns={[
        {
          key: "serviceType",
          label: "Service",
          render: (item) => item.serviceType,
        },
        {
          key: "serviceDate",
          label: "Date",
          render: (item) => new Date(item.serviceDate).toLocaleDateString(),
        },
        {
          key: "total",
          label: "Total Attendance",
          render: (item) => item.maleCount + item.femaleCount,
        },
      ]}
      getItemId={(item) => item.id}
      filterItems={(item, query) =>
        item.serviceType.toLowerCase().includes(query) ||
        new Date(item.serviceDate).toLocaleDateString().toLowerCase().includes(query)
      }
      getEditValues={(item) => ({
        serviceDate: item.serviceDate.slice(0, 10),
        serviceType: item.serviceType,
        maleCount: item.maleCount,
        femaleCount: item.femaleCount,
      })}
      isLoading={isLoading}
      isSubmitting={createAttendance.isPending || updateAttendance.isPending}
      deletingId={deleteAttendance.variables ?? null}
      editingId={updateAttendance.variables?.id ?? null}
      pagination={attendanceResult?.meta}
      onPageChange={setPage}
      onPageSizeChange={(nextLimit) => {
        setLimit(nextLimit);
        setPage(1);
      }}
      onCreate={async (values) => {
        await createAttendance.mutateAsync(toAttendancePayload(values));
      }}
      onUpdate={async (item, values) => {
        try {
          await updateAttendance.mutateAsync({
            id: item.id,
            data: toAttendancePayload(values),
          });
        } catch (error) {
          throw new Error(
            getErrorMessage(error, "Failed to update attendance record."),
          );
        }
      }}
      onDelete={async (item) => {
        try {
          await deleteAttendance.mutateAsync(item.id);
        } catch (error) {
          throw new Error(
            getErrorMessage(error, "Failed to delete attendance record."),
          );
        }
      }}
    />
  );
}
