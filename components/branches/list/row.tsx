import { TableCell, TableRow } from "@/components/ui/table";
import { Branch } from "@/type/branch";
import { Row } from "@tanstack/react-table";

export default function BranchesRow({ row }: { row: Row<Branch> }) {
  return (
    <TableRow key={row.id} className="hover:bg-muted">
      <TableCell>{row?.original?.name ?? ""}</TableCell>
      <TableCell>
        {row.original.regions?.map((item) => (
          <div key={item.id}>{item.name}</div>
        ))}
      </TableCell>
    </TableRow>
  );
}
