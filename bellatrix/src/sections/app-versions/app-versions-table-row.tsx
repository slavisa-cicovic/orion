"use client";

import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { AppVersionRow } from "@/sections/app-versions/types";

type Props = {
  row: AppVersionRow;
};

export default function AppVersionsTableRow({ row }: Props) {
  return (
    <TableRow hover sx={{ "&.Mui-selected": { backgroundColor: "transparent" } }}>
      <TableCell>{row.versionName}</TableCell>
      <TableCell>{row.versionCode}</TableCell>
      <TableCell>{row.platform}</TableCell>
      <TableCell>{row.status}</TableCell>
      <TableCell>{row.createdAt}</TableCell>
    </TableRow>
  );
}
