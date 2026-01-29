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
  TextField,
  Tooltip
} from "@mui/material";
import {
  emptyRows,
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
import { CompanyApi, useGetCompanies } from "@/api/companies";
import CompaniesTableRow from "@/sections/companies/companies-table-row";
import {
  CompaniesTableToolbar,
  ICompaniesTableFilters,
  ICompaniesTableFilterValue
} from "@/sections/companies/companies-table-toolbar";
import { CompaniesTableFiltersResult } from "@/sections/companies/companies-table-filters-result";

const TABLE_HEAD = [
  { id: "icon", label: "", width: 64 },
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
  const [confirmReason, setConfirmReason] = useState("");
  const table = useTable({ defaultOrderBy: "name", defaultRowsPerPage: 25, defaultDense: false });

  const sortFieldMap: Record<string, string> = {
    code: "code",
    name: "name",
    city: "city",
    zip: "zip",
    active: "active"
  };
  const sortParam = `${sortFieldMap[table.orderBy] ?? "name"},${table.order}`;

  const { companyRows, companiesLoading, companiesError, companiesEmpty, total, mutate } = useGetCompanies({
    search: filters.search,
    isActive: filters.isActive ? filters.isActive === "true" : undefined,
    page: table.page,
    pageSize: table.rowsPerPage,
    sort: sortParam
  });

  const selectableIds = useMemo(
    () => companyRows.filter((row) => row.id !== SYSTEM_COMPANY_ID).map((row) => row.id),
    [companyRows]
  );

  const dataInPage = useMemo(() => companyRows, [companyRows]);

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
    setConfirmReason("");
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmAction(null);
    setConfirmReason("");
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!confirmAction) {
      return;
    }

    const reason = confirmReason.trim();
    if (!reason) {
      return;
    }

    const selectedIds = table.selected;
    try {
      if (confirmAction === "delete") {
        await CompanyApi.deleteCompanies(selectedIds, reason);
      } else {
        await CompanyApi.updateCompaniesStatus(selectedIds, confirmAction === "activate", reason);
      }
      await mutate();
      table.setSelected([]);
    } catch (error) {
      console.error(error);
    }
    setConfirmAction(null);
    setConfirmReason("");
  }, [confirmAction, confirmReason, mutate, table]);

  const confirmTitle = confirmAction
    ? `Confirm ${confirmAction} companies`
    : "Confirm action";
  const confirmContent = confirmAction
    ? (
      <>
        {confirmAction === "delete" ? (
          <>
            {`You are about to delete ${table.selected.length} companies.`}
            <br />
            {"Users belonging to the selected companies will also be deleted."}
          </>
        ) : (
          `You are about to ${confirmAction} ${table.selected.length} companies.`
        )}
        <TextField
          fullWidth
          label="Reason"
          value={confirmReason}
          onChange={(event) => setConfirmReason(event.target.value)}
          sx={{ mt: 2 }}
        />
      </>
    )
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
            {!companiesLoading && !companiesError && dataInPage.length > 0 && (
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
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataInPage.length)}
                    />

                    <TableNoData notFound={companiesEmpty} />
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Box sx={{ position: "relative" }}>
              <TablePaginationCustom
                count={total}
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
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmAction}
            sx={{ minWidth: "100px" }}
            disabled={!confirmReason.trim()}
          >
            Confirm
          </Button>
        }
      />
    </MainLayout>
  );
}
