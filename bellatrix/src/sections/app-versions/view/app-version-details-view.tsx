"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
} from "@mui/material";
import MainLayout from "@/layouts/main/MainLayout";
import CustomBreadcrumbs from "@/components/custom-breadcrumbs";
import { paths } from "@/routes/paths";
import { AppVersionApi, useGetAppVersion, useGetAppVersionCompanies, useGetAppVersions } from "@/api/app-versions";
import AppVersionEditForm from "../app-version-edit-form";
import { ConfirmDialog } from "@/components/custom-dialog";
import { TableHeadCustom, TableNoData, TableSelectedAction, useTable } from "@/components/table";
import { useCallback, useMemo, useState } from "react";

type Props = {
  appVersionId: string;
};

const TABLE_HEAD = [
  { id: "companyName", label: "Company", minWidth: 180 },
  { id: "latestVersion", label: "Latest published version", minWidth: 200 },
  { id: "publishedToUsers", label: "Published to users", minWidth: 160 },
  { id: "address", label: "Address", minWidth: 240 },
];

export default function AppVersionDetailsView({ appVersionId }: Props) {
  const table = useTable({ defaultDense: true });
  const { appVersion, appVersionLoading, appVersionError } = useGetAppVersion(appVersionId);
  const { versions } = useGetAppVersions({
    appId: appVersion?.applicationId ?? null,
    platform: appVersion?.platform,
  });
  const {
    companies,
    companiesLoading,
    companiesEmpty,
    companiesError,
    mutate,
  } = useGetAppVersionCompanies(appVersionId);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmReason, setConfirmReason] = useState("");

  const selectableIds = useMemo(
    () => companies.filter((row) => row.selectable).map((row) => row.companyId),
    [companies]
  );

  const openConfirm = useCallback(() => {
    setConfirmOpen(true);
    setConfirmReason("");
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmOpen(false);
    setConfirmReason("");
  }, []);

  const handlePublish = useCallback(async () => {
    const reason = confirmReason.trim();
    if (!reason) return;
    const selectedIds = table.selected.map((id) => Number(id)).filter((id) => Number.isFinite(id));
    if (!selectedIds.length) return;

    try {
      await AppVersionApi.publishVersion(appVersionId, { companyIds: selectedIds, reason });
      await mutate();
      table.setSelected([]);
      closeConfirm();
    } catch (error) {
      console.error(error);
    }
  }, [appVersionId, closeConfirm, confirmReason, mutate, table]);

  return (
    <MainLayout>
      <Stack spacing={2}>
        <CustomBreadcrumbs
          heading="Application details"
          description="Manage app settings and versions."
          links={[
            { name: "Overview", href: paths.dashboard.root },
            { name: "Applications", href: paths.dashboard.apps.root },
            { name: appVersion?.applicationName || appVersion?.applicationId || "", href: paths.dashboard.apps.details(appVersion?.applicationId || "") },
            { name: appVersion?.versionName || "" }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Box
          sx={{
            display: { xs: "flex", md: "grid" },
            flexDirection: "column",
            gridTemplateColumns: { md: "5fr 7fr" },
            gap: 3
          }}
        >
          <Box>
            {appVersionError && <Alert severity="error">Failed to load app version.</Alert>}
            {!appVersionLoading && appVersion && (
              <AppVersionEditForm
                appId={appVersion.applicationId}
                currentAppVersion={appVersion}
                isLatest={
                  versions.length
                    ? Math.max(...versions.map((v) => v.versionCode)) === appVersion.versionCode
                    : true
                }
                publishedToCompany={
                  appVersion.status === "PUBLISHED_TO_COMPANIES" ||
                  appVersion.status === "PUBLISHED_TO_USERS"
                }
              />
            )}
          </Box>
          <Box>
            <Card>
              <CardHeader
                title="Companies"
              />
              <CardContent>
                {companiesError && <Alert severity="error">Failed to load companies.</Alert>}
                {!companiesLoading && companiesEmpty && !companiesError && (
                  <Alert severity="info">No companies found.</Alert>
                )}
                {!companiesLoading && !companiesError && companies.length > 0 && (
                  <TableContainer sx={{ position: "relative", overflow: "unset" }}>
                    <TableSelectedAction
                      dense
                      numSelected={table.selected.length}
                      rowCount={selectableIds.length}
                      onSelectAllRows={(checked) => table.onSelectAllRows(checked, selectableIds)}
                      actions={[
                        {
                          key: "publish",
                          node: (
                            <Button
                              variant="contained"
                              size="small"
                              disabled={!table.selected.length}
                              onClick={openConfirm}
                            >
                              Publish to companies
                            </Button>
                          )
                        }
                      ]}
                    />
                    <Table size="small">
                      <TableHeadCustom
                        headLabel={TABLE_HEAD}
                        rowCount={selectableIds.length}
                        numSelected={table.selected.length}
                        onSelectAllRows={(checked) => table.onSelectAllRows(checked, selectableIds)}
                      />
                      <TableBody>
                        {companies.map((row) => {
                          const latestLabel = row.latestPublishedVersionName
                            ? `${row.latestPublishedVersionName} (${row.latestPublishedVersionCode ?? "-"})`
                            : "-";
                          const address = [row.address, row.city, row.zip].filter(Boolean).join(", ") || "-";
                          const isSelected = table.selected.includes(row.companyId);
                          return (
                            <TableRow
                              key={row.companyId}
                              hover
                              selected={isSelected}
                              sx={{ cursor: row.selectable ? "pointer" : "default", opacity: row.selectable ? 1 : 0.6 }}
                              onClick={() => row.selectable && table.onSelectRow(row.companyId)}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={isSelected}
                                  disabled={!row.selectable}
                                  onChange={() => table.onSelectRow(row.companyId)}
                                  onClick={(event) => event.stopPropagation()}
                                />
                              </TableCell>
                              <TableCell>{row.companyName}</TableCell>
                              <TableCell>{latestLabel}</TableCell>
                              <TableCell>{row.publishedToUsers ? "Yes" : "No"}</TableCell>
                              <TableCell>{address}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    <TableNoData notFound={!companies.length} />
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Stack>

      <ConfirmDialog
        open={confirmOpen}
        onClose={closeConfirm}
        title="Publish to companies"
        content={
          <>
            {`You are about to publish this version to ${table.selected.length} companies.`}
            <TextField
              fullWidth
              label="Reason"
              value={confirmReason}
              onChange={(event) => setConfirmReason(event.target.value)}
              sx={{ mt: 2 }}
            />
          </>
        }
        action={
          <Button
            variant="contained"
            color="primary"
            onClick={handlePublish}
            disabled={!confirmReason.trim()}
          >
            Publish
          </Button>
        }
      />
    </MainLayout>
  );
}
