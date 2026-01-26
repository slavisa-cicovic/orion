"use client";

import { useCallback, useMemo, useState } from "react";
import { isEqual } from 'lodash';
import {
  Box,
  Card,
  Table,
  Stack,
  TableBody,
  TableContainer,
  CardContent,
  Alert,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  emptyRows,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSkeleton,
  useTable,
  TableSelectedAction
} from "@/components/table";
import MainLayout from "@/layouts/main/MainLayout";
import { useGetApps } from "@/api/apps";
import AppsTableRow from "@/sections/apps/apps-table-row";
import CustomBreadcrumbs from "@/components/custom-breadcrumbs";
import { paths } from "@/routes/paths";
import { AppsTableToolbar, IAppsTableFilters, IAppsTableFilterValue } from "../apps-table-toolbar";
import { AppsTableFiltersResult } from "../apps-table-filters-result";
import EmptyContent from "@/components/empty-content";
import Iconify from "@/components/iconify";
import { RouterLink } from "@/routes/components";
import { ConfirmDialog } from "@/components/custom-dialog";

const TABLE_HEAD = [
  { id: "displayName", label: "Display name", minWidth: 180 },
  { id: "packageName", label: "Package name", minWidth: 220 },
  { id: "isActive", label: "Active", width: 80 },
  { id: "createdAt", label: "Created at", minWidth: 140 }
];

const defaultFilters: IAppsTableFilters = {
  search: '',
};



export default function AppsListView() {

  const [filters, setFilters] = useState(defaultFilters);
  const [confirmAction, setConfirmAction] = useState<"delete" | "activate" | "deactivate" | null>(null);

  const table = useTable({ defaultOrderBy: "displayName", defaultRowsPerPage: 25, defaultDense: true });

  const { appRows, appsLoading, appsEmpty, appsError, total } = useGetApps({
    search: filters.search
  });

  const dataFiltered = useMemo(
    () => appRows.slice().sort(getComparator(table.order, table.orderBy)),
    [appRows, table.order, table.orderBy]
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
  // const notFound = (!appRows.length && canReset) || appsEmpty;

  const handleFilters = useCallback(
    (name: string, value: IAppsTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({ ...prevState, [name]: value }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const openConfirm = useCallback((action: "delete" | "activate" | "deactivate") => {
    setConfirmAction(action);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmAction(null);
  }, []);

  const handleConfirmAction = useCallback(() => {
    if (!confirmAction) {
      return;
    }
    console.info(`TODO: bulk ${confirmAction}`, table.selected);
    table.setSelected([]);
    setConfirmAction(null);
  }, [confirmAction, table]);

  const confirmTitle = confirmAction
    ? `Confirm ${confirmAction} apps`
    : "Confirm action";
  const confirmContent = confirmAction
    ? `You are about to ${confirmAction} ${table.selected.length} apps.`
    : undefined;

  return (
    <MainLayout>
      <Stack spacing={2}>
        <CustomBreadcrumbs
          heading='Applications'
          description='Manage internal applications and their metadata.'
          links={[
            { name: 'Overview', href: paths.dashboard.root },
            { name: 'Applications', href: paths.dashboard.apps.root },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 3 }}>
          <Button variant="contained" component={RouterLink} href={paths.dashboard.apps.new}>
            New application
          </Button>
        </Stack>
        <Card>
          <AppsTableToolbar
            filters={filters}
            onFilters={handleFilters}
          />
          {canReset && (
            <AppsTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={total}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}
          <CardContent>
            {appsError && (
              <EmptyContent
                filled
                title="Failed to load applications."
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

            {!appsLoading && appsEmpty && !appsError && (
              <Alert severity="info">No applications found.</Alert>
            )}
            {!appsLoading && !appsError && appRows && appRows.length > 0 && (
              <TableContainer sx={{ position: "relative", overflow: "unset" }}>
                <TableSelectedAction
                  dense={table.dense}
                  numSelected={table.selected.length}
                  rowCount={dataFiltered.length}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                  actions={[
                    {
                      key: "bulk-delete",
                      node: (
                        <Tooltip title="Delete" arrow>
                          <IconButton color="primary" onClick={() => openConfirm("delete")}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Tooltip>
                      )
                    },
                    {
                      key: "bulk-activate",
                      node: (
                        <Tooltip title="Activate" arrow>
                          <IconButton color="primary" onClick={() => openConfirm("activate")}>
                            <Iconify icon="solar:check-circle-bold" />
                          </IconButton>
                        </Tooltip>
                      )
                    },
                    {
                      key: "bulk-deactivate",
                      node: (
                        <Tooltip title="Deactivate" arrow>
                          <IconButton color="primary" onClick={() => openConfirm("deactivate")}>
                            <Iconify icon="solar:close-circle-bold" />
                          </IconButton>
                        </Tooltip>
                      )
                    }
                  ]}
                />
                <Table size="medium">
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    onSort={table.onSort}
                    rowCount={dataFiltered.length}
                    numSelected={table.selected.length}
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        dataFiltered.map((row) => row.id)
                      )
                    }
                  />
                  <TableBody>
                    {appsLoading && <TableSkeleton />}

                    {!appsLoading &&
                      dataInPage.map((row) => (
                        <AppsTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                        />
                      ))}

                    <TableEmptyRows
                      height={rowHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />

                    <TableNoData notFound={appsEmpty} />
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
      <ConfirmDialog
        open={Boolean(confirmAction)}
        onClose={closeConfirm}
        title={confirmTitle}
        content={confirmContent}
        action={
          <Button variant="contained" color="primary" onClick={handleConfirmAction} sx={{ minWidth: "100px" }}>
            Confirm
          </Button>
        }
      />
    </MainLayout>
  );
}
