"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from "@mui/material";
import MainLayout from "@/layouts/main/MainLayout";
import CustomBreadcrumbs from "@/components/custom-breadcrumbs";
import { paths } from "@/routes/paths";
import { useGetUser, useGetUserApps } from "@/api/users";
import { UserEditForm } from "@/sections/users/user-edit-form";
import { TableHeadCustom, TableNoData, TableSkeleton } from "@/components/table";

type Props = {
  userId: string;
};

const APP_TABLE_HEAD = [
  { id: "appName", label: "App", minWidth: 180 },
  { id: "versionName", label: "Version", minWidth: 160 },
  { id: "status", label: "Status", minWidth: 180 }
];

export default function UserDetailsView({ userId }: Props) {
  const { user, userLoading, userError } = useGetUser(userId);
  const { apps, appsLoading, appsError, appsEmpty } = useGetUserApps(userId);

  return (
    <MainLayout>
      <Stack spacing={2}>
        <CustomBreadcrumbs
          heading="User details"
          description="Manage user profile and published apps."
          links={[
            { name: "Overview", href: paths.dashboard.root },
            { name: "Users", href: paths.dashboard.users.root },
            { name: user?.email ?? "" }
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
            {userError && <Alert severity="error">Failed to load user.</Alert>}
            {!userLoading && <UserEditForm currentUser={user ?? undefined} />}
          </Box>
          <Box>
            <Card>
              <CardHeader title="Published apps" />
              <CardContent>
                {appsError && <Alert severity="error">Failed to load apps.</Alert>}
                <TableContainer sx={{ position: "relative", overflow: "unset" }}>
                  <Table size="medium">
                    <TableHeadCustom headLabel={APP_TABLE_HEAD} />
                    <TableBody>
                      {appsLoading && <TableSkeleton />}
                      {!appsLoading &&
                        apps.map((row) => (
                          <TableRow key={row.appId} hover>
                            <TableCell>{row.appName}</TableCell>
                            <TableCell>{row.versionName}</TableCell>
                            <TableCell>{row.status}</TableCell>
                          </TableRow>
                        ))}
                      <TableNoData notFound={appsEmpty} />
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Stack>
    </MainLayout>
  );
}
