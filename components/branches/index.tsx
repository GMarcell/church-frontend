"use client";
import { useBranches } from "@/services/branch";
import { DataTable } from "../datatable";
import { columns } from "./list/column";
import { Branch } from "@/type/branch";
import BranchesRow from "./list/row";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function Branches() {
  const { data } = useBranches();

  console.log(data);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3">
        <Input />
        <Button>Create</Button>
      </div>
      <DataTable
        columns={columns}
        data={data as Branch[]}
        renderRow={(row) => <BranchesRow row={row} key={row.id} />}
      />
    </div>
  );
}
