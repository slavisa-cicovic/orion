"use client";

import { Box, Stack } from "@mui/material";
import MainLayout from "@/layouts/main/MainLayout";
import CustomBreadcrumbs from "@/components/custom-breadcrumbs";
import { paths } from "@/routes/paths";
import AppVersionEditForm from "@/sections/app-versions/app-version-edit-form";
import { useGetApp } from "@/api/apps";

type Props = {
  appId: string;
};

export default function AppVersionCreateView({ appId }: Props) {
  const { app } = useGetApp(appId);
  const appName = app?.displayName ?? appId;

  return (
    <MainLayout>
      <Stack spacing={2}>
        <CustomBreadcrumbs
          heading="Create new app version"
          description="Upload APK/IPA and version metadata."
          links={[
            { name: "Overview", href: paths.dashboard.root },
            { name: "Applications", href: paths.dashboard.apps.root },
            { name: appName, href: paths.dashboard.apps.details(appId) },
            { name: "New version" }
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
        <AppVersionEditForm appId={appId} />
        </Box>
      </Stack>
    </MainLayout>
  );
}
