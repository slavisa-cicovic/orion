"use client";

import { useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableContainer
} from "@mui/material";
import {
  emptyRows,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSkeleton,
  useTable
} from "@/components/table";
import { AppVersionRow } from "@/sections/app-versions/types";
import AppVersionsTableRow from "@/sections/app-versions/app-versions-table-row";

const TABLE_HEAD = [
  { id: "versionName", label: "Version", minWidth: 140 },
  { id: "versionCode", label: "Code", width: 90 },
  { id: "platform", label: "Platform", width: 120 },
  { id: "status", label: "Status", minWidth: 140 }
];

type Props = {
  appId: string,
  rows: AppVersionRow[];
  loading: boolean;
  empty: boolean;
};

export default function AppVersionsTable({ appId, rows, loading, empty }: Props) {
  const table = useTable({ defaultOrderBy: "versionCode", defaultRowsPerPage: 25, defaultDense: true });

  const dataSorted = useMemo(
    () => rows.slice().sort(getComparator(table.order, table.orderBy)),
    [rows, table.order, table.orderBy]
  );

  const dataInPage = useMemo(
    () =>
      dataSorted.slice(
        table.page * table.rowsPerPage,
        table.page * table.rowsPerPage + table.rowsPerPage
      ),
    [dataSorted, table.page, table.rowsPerPage]
  );

  return (
    <>
      <TableContainer sx={{ position: "relative", overflow: "unset" }}>
        <Table size="medium">
          <TableHeadCustom
            order={table.order}
            orderBy={table.orderBy}
            headLabel={TABLE_HEAD}
            onSort={table.onSort}
            rowCount={dataSorted.length}
            numSelected={0}
          />
          <TableBody>
            {loading && <TableSkeleton />}

            {!loading &&
              dataInPage.map((row) => (
                <AppVersionsTableRow key={row.id} row={row} appId={appId} />
              ))}

            <TableEmptyRows
              height={64}
              emptyRows={emptyRows(table.page, table.rowsPerPage, dataSorted.length)}
            />

            <TableNoData notFound={empty} />
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ position: "relative" }}>
        <TablePaginationCustom
          count={dataSorted.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Box>
    </>
  );
}
