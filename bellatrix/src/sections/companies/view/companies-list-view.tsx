"use client";

import { useCallback, useMemo, useState } from "react";
import { isEqual } from "lodash";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableContainer,
  Tooltip
} from "@mui/material";
import {
  emptyRows,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  TableSkeleton,
  useTable
} from "@/components/table";
import CustomBreadcrumbs from "@/components/custom-breadcrumbs";
import { ConfirmDialog } from "@/components/custom-dialog";
import EmptyContent from "@/components/empty-content";
import Iconify from "@/components/iconify";
import MainLayout from "@/layouts/main/MainLayout";
import { RouterLink } from "@/routes/components";
import { paths } from "@/routes/paths";
import { useGetCompanies } from "@/api/companies";
import CompaniesTableRow from "@/sections/companies/companies-table-row";
import {
  CompaniesTableToolbar,
  ICompaniesTableFilters,
  ICompaniesTableFilterValue
} from "@/sections/companies/companies-table-toolbar";
import { CompaniesTableFiltersResult } from "@/sections/companies/companies-table-filters-result";

const TABLE_HEAD = [
  { id: "code", label: "Code", minWidth: 120 },
  { id: "name", label: "Name", minWidth: 180 },
  { id: "city", label: "City", minWidth: 140 },
  { id: "zip", label: "Zip", minWidth: 100 },
  { id: "active", label: "Active", width: 80 }
];

const SYSTEM_COMPANY_ID = "44444444-4444-4444-4444-444444444444";

const defaultFilters: ICompaniesTableFilters = {
  search: "",
  isActive: ""
};

export default function CompaniesListView() {
  const [filters, setFilters] = useState(defaultFilters);
  const [confirmAction, setConfirmAction] = useState<"delete" | "activate" | "deactivate" | null>(null);
  const table = useTable({ defaultOrderBy: "name", defaultRowsPerPage: 25, defaultDense: false });

  const { companyRows, companiesLoading, companiesError, companiesEmpty, total } = useGetCompanies({
    search: filters.search,
    isActive: filters.isActive ? filters.isActive === "true" : undefined
  });

  const dataFiltered = useMemo(
    () => companyRows.slice().sort(getComparator(table.order, table.orderBy)),
    [companyRows, table.order, table.orderBy]
  );

  const selectableIds = useMemo(
    () => dataFiltered.filter((row) => row.id !== SYSTEM_COMPANY_ID).map((row) => row.id),
    [dataFiltered]
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

  const handleFilters = useCallback(
    (name: string, value: ICompaniesTableFilterValue) => {
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
    ? `Confirm ${confirmAction} companies`
    : "Confirm action";
  const confirmContent = confirmAction === "delete"
    ? (
      <>
        {`You are about to delete ${table.selected.length} companies.`}
        <br />
        {"Users belonging to the selected companies will also be deleted."}
      </>
    )
    : confirmAction
      ? `You are about to ${confirmAction} ${table.selected.length} companies.`
      : undefined;

  return (
    <MainLayout>
      <Stack spacing={2}>
        <CustomBreadcrumbs
          heading="Companies"
          description="Manage tenant organizations and their status."
          links={[
            { name: "Overview", href: paths.dashboard.root },
            { name: "Companies", href: paths.dashboard.companies.root }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 3 }}>
          <Button variant="contained" component={RouterLink} href={paths.dashboard.companies.new}>
            New company
          </Button>
        </Stack>
        <Card>
          <CompaniesTableToolbar filters={filters} onFilters={handleFilters} />
          {canReset && (
            <CompaniesTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={total}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}
          <CardContent>
            {companiesError && (
              <EmptyContent
                filled
                title="Failed to load companies."
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

            {!companiesLoading && companiesEmpty && !companiesError && (
              <Alert severity="info">No companies found.</Alert>
            )}
            {!companiesLoading && !companiesError && dataFiltered.length > 0 && (
              <TableContainer sx={{ position: "relative", overflow: "unset" }}>
                <TableSelectedAction
                  dense={table.dense}
                  numSelected={table.selected.length}
                  rowCount={selectableIds.length}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      selectableIds
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
                    rowCount={selectableIds.length}
                    numSelected={table.selected.length}
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        selectableIds
                      )
                    }
                  />
                  <TableBody>
                    {companiesLoading && <TableSkeleton />}

                    {!companiesLoading &&
                      dataInPage.map((row) => (
                        <CompaniesTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          disableSelection={row.id === SYSTEM_COMPANY_ID}
                        />
                      ))}

                    <TableEmptyRows
                      height={rowHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />

                    <TableNoData notFound={companiesEmpty} />
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
