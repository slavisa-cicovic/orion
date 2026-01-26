"use client";

import { Stack } from "@mui/material";
import MainLayout from "@/layouts/main/MainLayout";
import CustomBreadcrumbs from "@/components/custom-breadcrumbs";
import { paths } from "@/routes/paths";
import { UserEditForm } from "../user-edit-form";

export default function UsersCreateView() {
  return (
    <MainLayout>
      <Stack spacing={2}>
        <CustomBreadcrumbs
          heading="Create new user"
          description="create.description"
          links={[
            { name: "Overview", href: paths.dashboard.root },
            { name: "Users", href: paths.dashboard.users.root },
            { name: "new" }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <UserEditForm />
      </Stack>
    </MainLayout>
  );
}
