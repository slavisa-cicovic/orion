"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, { RHFTextField, RHFUploadAvatar } from "@/components/hook-form";
import RHFSwitch from "@/components/hook-form/rhf-switch";
import { Alert, Button, Card, CardActions, CardContent, CardHeader, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { CompanyApi } from "@/api/companies";
import { UploadApi } from "@/api/uploads";
import { Company } from "@/api/types/companies";
import { CompanyData } from "@/sections/companies/types";
import { useSnackbar } from "notistack";
import { paths } from "@/routes/paths";
import { useRouter } from 'src/routes/hooks';

type Props = {
  currentCompany?: Company;
};

export function CompanyEditForm({ currentCompany }: Props) {


  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const ICON_MAX_SIZE = 300 * 1024;

  const CompanySchema: Yup.ObjectSchema<CompanyData> = Yup.object({
    code: Yup.string().trim().required("Code is required"),
    name: Yup.string().trim().required("Name is required"),
    address: Yup.string().trim().defined(),
    city: Yup.string().trim().defined(),
    zip: Yup.string().trim().defined(),
    iconUrl: Yup.string().trim().defined(),
    iconFile: Yup.mixed().nullable().defined(),
    active: Yup.boolean().required(),
    reason: Yup.string().trim().when([], {
      is: () => Boolean(currentCompany?.id),
      then: (schema) => schema.required("Reason is required"),
      otherwise: (schema) => schema.optional()
    })
  });

  const iconPreviewUrl = useMemo(() => {
    if (!currentCompany?.iconUrl) return null;
    const baseUrl = (process.env.NEXT_PUBLIC_HOST_API ?? "").replace(/\/$/, "");
    const apiBase = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
    return `${apiBase}/uploads/${currentCompany.iconUrl.replace(/^\/+/, "")}`;
  }, [currentCompany?.iconUrl]);

  const defaultValues = useMemo<CompanyData>(
    () => ({
      code: currentCompany?.code ?? "",
      name: currentCompany?.name ?? "",
      address: currentCompany?.address ?? "",
      city: currentCompany?.city ?? "",
      zip: currentCompany?.zip ?? "",
      iconUrl: currentCompany?.iconUrl ?? "",
      iconFile: iconPreviewUrl ?? null,
      active: currentCompany?.active ?? true,
      reason: ""
    }),
    [currentCompany, iconPreviewUrl]
  );

  const methods = useForm<CompanyData>({
    resolver: yupResolver(CompanySchema),
    defaultValues,
    mode: "onChange"
  });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting }
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (data: CompanyData) => {
    try {
      setErrorMsg('');
      let iconUrl = data.iconUrl;
      if (data.iconFile && typeof data.iconFile !== "string") {
        const upload = await UploadApi.uploadFile("COMPANY_ICON", data.iconFile);
        iconUrl = upload.path;
      }
      const payload = { ...data, iconUrl };
      if (currentCompany?.id) {
        await CompanyApi.updateCompany(currentCompany.id, payload);
      } else {
        await CompanyApi.createCompany(payload);
      }
      reset(defaultValues);
      enqueueSnackbar(currentCompany?.id ? 'update success' : 'create_success');
      router.push(paths.dashboard.companies.root);
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
            <CardHeader title={currentCompany ? "Edit company" : "Create company"} />
            <CardContent>
              <Grid container spacing={2}>
                {errorMsg && (
                  <Grid item xs={12}>
                    <Alert severity="error">{errorMsg}</Alert>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <RHFTextField name="code" label="Company code" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="name" label="Company name" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="address" label="Address" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="city" label="City" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="zip" label="Zip" />
                </Grid>
                <Grid item xs={12}>
                  <RHFUploadAvatar
                    name="iconFile"
                    maxSize={ICON_MAX_SIZE}
                    accept={{ "image/png": [], "image/jpeg": [] }}
                    onDrop={(acceptedFiles) => {
                      const file = acceptedFiles[0];
                      if (!file) return;
                      const fileWithPreview = Object.assign(file, {
                        preview: URL.createObjectURL(file)
                      });
                      setValue("iconFile", fileWithPreview, { shouldValidate: true });
                    }}
                    helperText={
                      <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 1 }}>
                        PNG/JPG up to 300KB
                      </Typography>
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <RHFSwitch name="active" label="Active" />
                </Grid>
                {currentCompany?.id && (
                  <Grid item xs={12}>
                    <RHFTextField name="reason" label="Reason" />
                  </Grid>
                )}
              </Grid>
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end", px: 3, pb: 3 }}>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {currentCompany ? "Save changes" : "Create company"}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
