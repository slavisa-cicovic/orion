"use client";

import Checkbox from "@mui/material/Checkbox";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import { UserRow } from "@/sections/users/types";
import { RouterLink } from "@/routes/components";
import { paths } from "@/routes/paths";

type UsersTableRowProps = {
  row: UserRow;
  selected: boolean;
  onSelectRow: VoidFunction;
  disableSelection?: boolean;
};

export default function UsersTableRow({
  row,
  selected,
  onSelectRow,
  disableSelection = false
}: UsersTableRowProps) {
  const checkbox = (
    <Checkbox checked={selected} disabled={disableSelection} onClick={onSelectRow} />
  );

  return (
    <TableRow hover selected={selected} sx={{ "&.Mui-selected": { backgroundColor: "transparent" } }}>
      <TableCell padding="checkbox">
        {disableSelection ? (
          <Tooltip title="This account cannot be modified">
            <span>{checkbox}</span>
          </Tooltip>
        ) : (
          checkbox
        )}
      </TableCell>
      <TableCell>
        <RouterLink href={paths.dashboard.users.details(row.id)}>
          {row.email}
        </RouterLink>
      </TableCell>
      <TableCell>{row.fullName}</TableCell>
      <TableCell>{row.companyName}</TableCell>
      <TableCell>{row.isActive ? "Yes" : "No"}</TableCell>
    </TableRow>
  );
}
