"use client";

import Checkbox from "@mui/material/Checkbox";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import { CompanyRow } from "@/sections/companies/types";
import { RouterLink } from "@/routes/components";
import { paths } from "@/routes/paths";
import { Box, ListItemText } from "@mui/material";

type CompaniesTableRowProps = {
  row: CompanyRow;
  selected: boolean;
  onSelectRow: VoidFunction;
  disableSelection?: boolean;
};

export default function CompaniesTableRow({
  row,
  selected,
  onSelectRow,
  disableSelection = false
}: CompaniesTableRowProps) {
  const checkbox = (
    <Checkbox checked={selected} disabled={disableSelection} onClick={onSelectRow} />
  );

  return (
    <TableRow hover selected={selected} sx={{ "&.Mui-selected": { backgroundColor: "transparent" } }}>
      <TableCell padding="checkbox">
        {disableSelection ? (
          <Tooltip title="System company cannot be modified">
            <span>{checkbox}</span>
          </Tooltip>
        ) : (
          checkbox
        )}
      </TableCell>
      <TableCell>
        <Avatar
          src={row.iconUrl ?? undefined}
          alt={row.name}
          sx={{ width: 32, height: 32 }}
          variant="rounded"
        >
          {row.name?.[0] ?? "C"}
        </Avatar>
      </TableCell>
      <TableCell>
        <ListItemText
          disableTypography
          primary={
            <RouterLink href={paths.dashboard.companies.details(row.id)}>
              {row.name}
            </RouterLink>
          }
          secondary={null}
        />
      </TableCell>
      <TableCell>{row.code}</TableCell>
      <TableCell>
        <Box component="span" sx={{ typography: "body2" }}>
          {[row.zip, row.city].filter(Boolean).join(" ").trim() || "-"}
        </Box>
      </TableCell>
      <TableCell>{row.active ? "Yes" : "No"}</TableCell>
    </TableRow>
  );
}
