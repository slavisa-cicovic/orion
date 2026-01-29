"use client";

import { Box, Stack } from "@mui/material";
import MainLayout from "@/layouts/main/MainLayout";
import CustomBreadcrumbs from "@/components/custom-breadcrumbs";
import { paths } from "@/routes/paths";
import { AppEditForm } from "../app-edit-form";

export default function AppsCreateView() {
  return (
    <MainLayout>
      <Stack spacing={2}>
        <CustomBreadcrumbs
          heading="Create new app"
          description="create.description"
          links={[
            { name: "Overview", href: paths.dashboard.root },
            { name: "Applications", href: paths.dashboard.apps.root },
            { name: "new" }
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
          <AppEditForm />
        </Box>
      </Stack>
    </MainLayout>
  );
}
