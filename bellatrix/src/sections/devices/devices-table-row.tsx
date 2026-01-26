"use client";

import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { DeviceRow } from "@/sections/devices/types";

type DevicesTableRowProps = {
  row: DeviceRow;
};

export default function DevicesTableRow({ row }: DevicesTableRowProps) {
  return (
    <TableRow hover>
      <TableCell>{row.userFullName}</TableCell>
      <TableCell>{row.deviceId}</TableCell>
      <TableCell>{row.platform}</TableCell>
      <TableCell>{row.model}</TableCell>
      <TableCell>{row.osVersion}</TableCell>
      <TableCell>{row.createdAt}</TableCell>
    </TableRow>
  );
}
