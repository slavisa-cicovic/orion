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
import { useAuth } from "@/auth/useAuth";
import { RouterLink } from "@/routes/components";
import { paths } from "@/routes/paths";
import { useGetUsers } from "@/api/users";
import UsersTableRow from "@/sections/users/users-table-row";
import { UsersTableToolbar, IUsersTableFilters, IUsersTableFilterValue } from "@/sections/users/users-table-toolbar";
import { UsersTableFiltersResult } from "@/sections/users/users-table-filters-result";

const TABLE_HEAD = [
  { id: "email", label: "Email", minWidth: 200 },
  { id: "fullName", label: "Full name", minWidth: 180 },
  { id: "companyName", label: "Company", minWidth: 160 },
  { id: "isActive", label: "Active", width: 80 },
  { id: "createdAt", label: "Created at", minWidth: 140 }
];

const SUPER_ADMIN_EMAIL = "super.admin@example.com";

const defaultFilters: IUsersTableFilters = {
  search: "",
  isActive: ""
};

export default function UsersListView() {
  const [filters, setFilters] = useState(defaultFilters);
  const [confirmAction, setConfirmAction] = useState<"delete" | "activate" | "deactivate" | null>(null);
  const table = useTable({ defaultOrderBy: "email", defaultRowsPerPage: 25, defaultDense: true });
  const { user } = useAuth();
  const currentUserId = user?.userId ?? null;

  const { userRows, usersLoading, usersError, usersEmpty, total } = useGetUsers({
    search: filters.search,
    isActive: filters.isActive ? filters.isActive === "true" : undefined
  });

  const dataFiltered = useMemo(
    () => userRows.slice().sort(getComparator(table.order, table.orderBy)),
    [userRows, table.order, table.orderBy]
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
    (name: string, value: IUsersTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({ ...prevState, [name]: value }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const selectableIds = useMemo(
    () =>
      dataFiltered
        .filter((row) => row.id !== currentUserId && row.email !== SUPER_ADMIN_EMAIL)
        .map((row) => row.id),
    [dataFiltered, currentUserId]
  );

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
    ? `Confirm ${confirmAction} users`
    : "Confirm action";
  const confirmContent = confirmAction === "delete"
    ? (
      <>
        {`You are about to delete ${table.selected.length} users.`}
        <br />
        {"You cannot delete your own account or super.admin@example.com."}
      </>
    )
    : confirmAction
      ? `You are about to ${confirmAction} ${table.selected.length} users.`
      : undefined;

  return (
    <MainLayout>
      <Stack spacing={2}>
        <CustomBreadcrumbs
          heading="Users"
          description="Manage user accounts and access status."
          links={[
            { name: "Overview", href: paths.dashboard.root },
            { name: "Users", href: paths.dashboard.users.root }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 3 }}>
          <Button variant="contained" component={RouterLink} href={paths.dashboard.users.new}>
            New user
          </Button>
        </Stack>
        <Card>
          <UsersTableToolbar filters={filters} onFilters={handleFilters} />
          {canReset && (
            <UsersTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={total}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}
          <CardContent>
            {usersError && (
              <EmptyContent
                filled
                title="Failed to load users."
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

            {!usersLoading && usersEmpty && !usersError && (
              <Alert severity="info">No users found.</Alert>
            )}
            {!usersLoading && !usersError && dataFiltered.length > 0 && (
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
                    {usersLoading && <TableSkeleton />}

                    {!usersLoading &&
                      dataInPage.map((row) => (
                        <UsersTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          disableSelection={row.id === currentUserId || row.email === SUPER_ADMIN_EMAIL}
                        />
                      ))}

                    <TableEmptyRows
                      height={rowHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />

                    <TableNoData notFound={usersEmpty} />
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
