"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from "@mui/material";
import { useMemo, useState, type SyntheticEvent } from "react";
import MainLayout from "@/layouts/main/MainLayout";
import CustomBreadcrumbs from "@/components/custom-breadcrumbs";
import { paths } from "@/routes/paths";
import { CompanyEditForm } from "@/sections/companies/company-edit-form";
import { useGetCompany, useGetCompanyApps, useGetCompanyUsers } from "@/api/companies";
import { TableHeadCustom, TableNoData, TableSkeleton } from "@/components/table";

type Props = {
  companyId: string;
};

const APP_TABLE_HEAD = [
  { id: "appName", label: "App", minWidth: 180 },
  { id: "latestVersion", label: "Latest published version", minWidth: 200 },
  { id: "publishedUsersCount", label: "Published users", minWidth: 160 }
];

const USER_TABLE_HEAD = [
  { id: "firstName", label: "First name", minWidth: 140 },
  { id: "lastName", label: "Last name", minWidth: 140 },
  { id: "email", label: "Email", minWidth: 220 },
  { id: "status", label: "Status", minWidth: 140 },
  { id: "active", label: "Active", minWidth: 100 },
  { id: "lastLoggedInAt", label: "Last logged in", minWidth: 180 }
];

const formatDateTime = (value: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export default function CompanyDetailsView({ companyId }: Props) {
  const { company, companyError } = useGetCompany(companyId);
  const { apps, appsLoading, appsError, appsEmpty } = useGetCompanyApps(companyId);
  const { users, usersLoading, usersError, usersEmpty } = useGetCompanyUsers(companyId);

  const [tab, setTab] = useState<"apps" | "users">("apps");

  const handleTabChange = (_event: SyntheticEvent, value: "apps" | "users") => {
    setTab(value);
  };

  const appRows = useMemo(
    () =>
      apps.map((app) => ({
        appId: app.appId,
        appName: app.appName,
        latestPublishedVersionName: app.latestPublishedVersionName ?? "-",
        publishedUsersCount: app.publishedUsersCount
      })),
    [apps]
  );

  const userRows = useMemo(
    () =>
      users.map((user) => ({
        id: user.id,
        firstName: user.firstName ?? "-",
        lastName: user.lastName ?? "-",
        email: user.email,
        status: user.status,
        active: user.active ? "Yes" : "No",
        lastLoggedInAt: formatDateTime(user.lastLoggedInAt)
      })),
    [users]
  );

  return (
    <MainLayout>
      <Stack spacing={2}>
        <CustomBreadcrumbs
          heading="Company details"
          description="Manage company settings, apps, and users."
          links={[
            { name: "Overview", href: paths.dashboard.root },
            { name: "Companies", href: paths.dashboard.companies.root },
            { name: company?.name ?? "" }
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
            {companyError && <Alert severity="error">Failed to load company.</Alert>}
            <CompanyEditForm currentCompany={company ?? undefined} />
          </Box>
          <Box>
            <Card>
              <CardHeader title="Company data" />
              <CardContent>
                <Tabs value={tab} onChange={handleTabChange}>
                  <Tab value="apps" label="Apps" />
                  <Tab value="users" label="Users" />
                </Tabs>

                {tab === "apps" && (
                  <Box sx={{ mt: 2 }}>
                    {appsError && <Alert severity="error">Failed to load apps.</Alert>}
                    <TableContainer sx={{ position: "relative", overflow: "unset" }}>
                      <Table size="medium">
                        <TableHeadCustom headLabel={APP_TABLE_HEAD} />
                        <TableBody>
                          {appsLoading && <TableSkeleton />}
                          {!appsLoading &&
                            appRows.map((row) => (
                              <TableRow key={row.appId} hover>
                                <TableCell>{row.appName}</TableCell>
                                <TableCell>{row.latestPublishedVersionName}</TableCell>
                                <TableCell>{row.publishedUsersCount}</TableCell>
                              </TableRow>
                            ))}
                          <TableNoData notFound={appsEmpty} />
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {tab === "users" && (
                  <Box sx={{ mt: 2 }}>
                    {usersError && <Alert severity="error">Failed to load users.</Alert>}
                    <TableContainer sx={{ position: "relative", overflow: "unset" }}>
                      <Table size="medium">
                        <TableHeadCustom headLabel={USER_TABLE_HEAD} />
                        <TableBody>
                          {usersLoading && <TableSkeleton />}
                          {!usersLoading &&
                            userRows.map((row) => (
                              <TableRow key={row.id} hover>
                                <TableCell>{row.firstName}</TableCell>
                                <TableCell>{row.lastName}</TableCell>
                                <TableCell>{row.email}</TableCell>
                                <TableCell>{row.status}</TableCell>
                                <TableCell>{row.active}</TableCell>
                                <TableCell>{row.lastLoggedInAt}</TableCell>
                              </TableRow>
                            ))}
                          <TableNoData notFound={usersEmpty} />
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Stack>
    </MainLayout>
  );
}
