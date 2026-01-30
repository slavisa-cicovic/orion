"use client";

import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { AppVersionRow } from "@/sections/app-versions/types";
import { paths } from "@/routes/paths";
import { RouterLink } from "@/routes/components";

type Props = {
  appId: string,
  row: AppVersionRow;
};

export default function AppVersionsTableRow({ appId, row }: Props) {
  return (
    <TableRow hover sx={{ "&.Mui-selected": { backgroundColor: "transparent" } }}>
      <TableCell>
        <RouterLink href={paths.dashboard.apps.versionDetails(appId, row.id)}>{row.versionName}</RouterLink>
      </TableCell>
      <TableCell>{row.versionCode}</TableCell>
      <TableCell>{row.platform}</TableCell>
      <TableCell>{row.status}</TableCell>
    </TableRow>
  );
}
