"use client";

import { Branch } from "@/type/branch";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Branch>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "regions",
    header: "Regions",
  },
];
