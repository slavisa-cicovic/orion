"use client";

import { useCallback, useMemo, useState } from "react";
import { isEqual } from "lodash";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
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
import CustomBreadcrumbs from "@/components/custom-breadcrumbs";
import EmptyContent from "@/components/empty-content";
import Iconify from "@/components/iconify";
import MainLayout from "@/layouts/main/MainLayout";
import { RouterLink } from "@/routes/components";
import { paths } from "@/routes/paths";
import { useGetDevices } from "@/api/devices";
import DevicesTableRow from "@/sections/devices/devices-table-row";
import {
  DevicesTableToolbar,
  IDevicesTableFilters,
  IDevicesTableFilterValue
} from "@/sections/devices/devices-table-toolbar";
import { DevicesTableFiltersResult } from "@/sections/devices/devices-table-filters-result";

const TABLE_HEAD = [
  { id: "userFullName", label: "User", minWidth: 180 },
  { id: "deviceId", label: "Device ID", minWidth: 200 },
  { id: "platform", label: "Platform", minWidth: 120 },
  { id: "model", label: "Model", minWidth: 160 },
  { id: "osVersion", label: "OS version", minWidth: 140 },
  { id: "createdAt", label: "Created at", minWidth: 140 }
];

const defaultFilters: IDevicesTableFilters = {
  userId: "",
  platform: ""
};

export default function DevicesListView() {
  const [filters, setFilters] = useState(defaultFilters);
  const table = useTable({ defaultOrderBy: "createdAt", defaultRowsPerPage: 25, defaultDense: true });

  const { deviceRows, devicesLoading, devicesError, devicesEmpty, total } = useGetDevices({
    userId: filters.userId ? filters.userId : null,
    platform: filters.platform || undefined
  });

  const dataFiltered = useMemo(
    () => deviceRows.slice().sort(getComparator(table.order, table.orderBy)),
    [deviceRows, table.order, table.orderBy]
  );

  const dataInPage = useMemo(
    () =>
      dataFiltered.slice(
        table.page * table.rowsPerPage,
        table.page * table.rowsPerPage + table.rowsPerPage
      ),
    [dataFiltered, table.page, table.rowsPerPage]
  );

  const rowHeight = 72;
  const canReset = !isEqual(defaultFilters, filters);
  const hasUserId = Boolean(filters.userId);

  const handleFilters = useCallback(
    (name: string, value: IDevicesTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({ ...prevState, [name]: value }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <MainLayout>
      <Stack spacing={2}>
        <CustomBreadcrumbs
          heading="Devices"
          description="Track registered devices across the organization."
          links={[
            { name: "Overview", href: paths.dashboard.root },
            { name: "Devices", href: paths.dashboard.devices.root }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Card>
          <DevicesTableToolbar filters={filters} onFilters={handleFilters} />
          {canReset && (
            <DevicesTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={total}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}
          <CardContent>
            {devicesError && (
              <EmptyContent
                filled
                title="Failed to load devices."
                action={
                  <Button
                    component={RouterLink}
                    href={paths.dashboard.root}
                    startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
                    sx={{ mt: 3 }}
                  >
                    Back to dashboard
                  </Button>
                }
                sx={{ py: 6 }}
              />
            )}

            {!hasUserId && <Alert severity="info">Enter a user ID to load devices.</Alert>}
            {hasUserId && !devicesLoading && devicesEmpty && !devicesError && (
              <Alert severity="info">No devices found.</Alert>
            )}
            {hasUserId && !devicesLoading && !devicesError && dataFiltered.length > 0 && (
              <TableContainer sx={{ position: "relative", overflow: "unset" }}>
                <Table size="medium">
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    onSort={table.onSort}
                  />
                  <TableBody>
                    {devicesLoading && <TableSkeleton />}

                    {!devicesLoading &&
                      dataInPage.map((row) => <DevicesTableRow key={row.id} row={row} />)}

                    <TableEmptyRows
                      height={rowHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />

                    <TableNoData notFound={devicesEmpty} />
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Box sx={{ position: "relative" }}>
              <TablePaginationCustom
                count={dataFiltered.length}
                page={table.page}
                rowsPerPage={table.rowsPerPage}
                onPageChange={table.onChangePage}
                onRowsPerPageChange={table.onChangeRowsPerPage}
              />
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
}
