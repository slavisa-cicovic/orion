"use client";

import Checkbox from "@mui/material/Checkbox";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Avatar from "@mui/material/Avatar";
import { AppRow } from "@/sections/apps/types";
import { RouterLink } from "@/routes/components";
import { paths } from "@/routes/paths";

type AppsTableRowProps = {
  row: AppRow;
  selected: boolean;
  onSelectRow: VoidFunction;
};

export default function AppsTableRow({ row, selected, onSelectRow }: AppsTableRowProps) {
  return (
    <TableRow hover selected={selected} sx={{ "&.Mui-selected": { backgroundColor: "transparent" } }}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>
      <TableCell>
        <Avatar
          src={row.iconUrl ?? undefined}
          alt={row.displayName}
          sx={{ width: 32, height: 32 }}
          variant="rounded"
        >
          {row.displayName?.[0] ?? "A"}
        </Avatar>
      </TableCell>
      <TableCell>
        <RouterLink href={paths.dashboard.apps.details(row.id)}>{row.displayName}</RouterLink>
      </TableCell>
      <TableCell>{row.packageName}</TableCell>
      <TableCell>{row.isActive ? "Yes" : "No"}</TableCell>
    </TableRow>
  );
}
