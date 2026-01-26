"use client";

import { Stack} from "@mui/material";
import MainLayout from "@/layouts/main/MainLayout";
import CustomBreadcrumbs from "@/components/custom-breadcrumbs";
import { paths } from "@/routes/paths";
import { CompanyEditForm } from "../company-edit-form";

export default function CompaniesCreateView() {
  return (
    <MainLayout>
      <Stack spacing={2}>
        <CustomBreadcrumbs
        heading='Create new company'
        description='create.description'
        links={[
          { name: 'Overview', href: paths.dashboard.root },
          { name: 'Companies', href: paths.dashboard.companies.root },
          { name: 'new'},
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <CompanyEditForm />
      </Stack>
    </MainLayout>
  );
}
