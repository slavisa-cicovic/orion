"use client";

import { Box, Stack, Card, CardContent, CardHeader, Button } from "@mui/material";
import MainLayout from "@/layouts/main/MainLayout";
import CustomBreadcrumbs from "@/components/custom-breadcrumbs";
import { paths } from "@/routes/paths";
import { AppEditForm } from "../app-edit-form";
import { useGetAppVersions } from "@/api/app-versions";
import AppVersionsTable from "@/sections/app-versions/app-versions-table";
import { RouterLink } from "@/routes/components";

type Props = {
  appId: string;
};

export default function AppDetailsView({ appId }: Props) {
  const {
    versionRows,
    versionsLoading,
    versionsEmpty
  } = useGetAppVersions({ appId });

  return (
    <MainLayout>
      <Stack spacing={2}>
        <CustomBreadcrumbs
          heading="Application details"
          description="Manage app settings and versions."
          links={[
            { name: "Overview", href: paths.dashboard.root },
            { name: "Applications", href: paths.dashboard.apps.root },
            { name: appId }
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
            <AppEditForm />
          </Box>
          <Box>
            <Card>
              <CardHeader
                title="App versions"
                action={(
                  <Button component={RouterLink} href={paths.dashboard.apps.versionNew(appId)} variant="contained">
                    New version
                  </Button>
                )}
              />
              <CardContent>
                <AppVersionsTable
                  rows={versionRows}
                  loading={versionsLoading}
                  empty={versionsEmpty}
                />
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Stack>
    </MainLayout>
  );
}
