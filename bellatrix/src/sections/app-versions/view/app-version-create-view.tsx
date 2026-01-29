"use client";

import { Stack } from "@mui/material";
import MainLayout from "@/layouts/main/MainLayout";
import CustomBreadcrumbs from "@/components/custom-breadcrumbs";
import { paths } from "@/routes/paths";
import AppVersionEditForm from "@/sections/app-versions/app-version-edit-form";

type Props = {
  appId: string;
};

export default function AppVersionCreateView({ appId }: Props) {
  return (
    <MainLayout>
      <Stack spacing={2}>
        <CustomBreadcrumbs
          heading="Create new app version"
          description="Upload APK/IPA and version metadata."
          links={[
            { name: "Overview", href: paths.dashboard.root },
            { name: "Applications", href: paths.dashboard.apps.root },
            { name: appId, href: paths.dashboard.apps.details(appId) },
            { name: "New version" }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <AppVersionEditForm appId={appId} />
      </Stack>
    </MainLayout>
  );
}
