"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import FormProvider, { RHFTextField } from "@/components/hook-form";
import RHFSwitch from "@/components/hook-form/rhf-switch";
import RHFAutocomplete from "@/components/hook-form/rhf-autocomplete";
import { Alert, Button, Card, CardActions, CardContent, CardHeader } from "@mui/material";
import Grid from "@mui/material/Grid";
import { AppApi } from "@/api/apps";
import { App } from "@/api/types/apps";
import { AppData } from "@/sections/apps/types";
import { useGetCompanies } from "@/api/companies";
import { useSnackbar } from "notistack";
import { paths } from "@/routes/paths";
import { useRouter } from "src/routes/hooks";

type Props = {
  currentApp?: App;
};

export function AppEditForm({ currentApp }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { companies } = useGetCompanies();

  const [errorMsg, setErrorMsg] = useState("");

  const companyOptions = useMemo(() => companies.map((company) => company.id), [companies]);
  const companyLabelById = useMemo(
    () => new Map(companies.map((company) => [company.id, company.name])),
    [companies]
  );
  const getCompanyLabel = (companyId: string) => {
    if (!companyId) return "";
    return companyLabelById.get(companyId) ?? companyId;
  };

  const AppSchema: Yup.ObjectSchema<AppData> = Yup.object({
    displayName: Yup.string().trim().required("Display name is required"),
    packageName: Yup.string().trim().required("Package name is required"),
    description: Yup.string().trim().defined(),
    iconUrl: Yup.string().trim().defined(),
    ownerCompanyId: Yup.string().trim().defined(),
    active: Yup.boolean().required()
  });

  const defaultValues = useMemo<AppData>(
    () => ({
      displayName: currentApp?.displayName ?? "",
      packageName: currentApp?.packageName ?? "",
      description: currentApp?.description ?? "",
      iconUrl: currentApp?.iconUrl ?? "",
      ownerCompanyId: currentApp?.ownerCompanyId != null ? String(currentApp.ownerCompanyId) : "",
      active: currentApp?.active ?? true
    }),
    [currentApp]
  );

  const methods = useForm<AppData>({
    resolver: yupResolver(AppSchema),
    defaultValues,
    mode: "onChange"
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = methods;

  const onSubmit = async (data: AppData) => {
    try {
      setErrorMsg("");
      await AppApi.createApp(data);
      reset(defaultValues);
      enqueueSnackbar(currentApp?.id ? "update success" : "create_success");
      router.push(paths.dashboard.apps.root);
    } catch (error: unknown) {
      console.error(error);
      let message = "Unknown error";

      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.detail ?? error.response?.data?.title;
        message = apiMessage || error.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setErrorMsg(message);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title={currentApp ? "Edit app" : "Create app"} />
            <CardContent>
              <Grid container spacing={2}>
                {errorMsg && (
                  <Grid item xs={12}>
                    <Alert severity="error">{errorMsg}</Alert>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <RHFTextField name="displayName" label="Display name" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="packageName" label="Package name" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="description" label="Description" multiline rows={3} />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="iconUrl" label="Icon URL" />
                </Grid>
                <Grid item xs={12}>
                  <RHFAutocomplete
                    name="ownerCompanyId"
                    label="Owner company"
                    placeholder="Select company"
                    options={companyOptions}
                    getOptionLabel={getCompanyLabel}
                    isOptionEqualToValue={(option, value) => option === value}
                    freeSolo
                  />
                </Grid>
                <Grid item xs={12}>
                  <RHFSwitch name="active" label="Active" />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end", px: 3, pb: 3 }}>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {currentApp ? "Save changes" : "Create app"}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
