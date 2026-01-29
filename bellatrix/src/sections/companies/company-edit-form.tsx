"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, { RHFTextField } from "@/components/hook-form";
import RHFSwitch from "@/components/hook-form/rhf-switch";
import { Alert, Button, Card, CardActions, CardContent, CardHeader } from "@mui/material";
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
  const [iconFile, setIconFile] = useState<File | null>(null);

  const ICON_MAX_SIZE = 300 * 1024;
  const ICON_TYPES = ["image/png", "image/jpeg"];

  const CompanySchema: Yup.ObjectSchema<CompanyData> = Yup.object({
    code: Yup.string().trim().required("Code is required"),
    name: Yup.string().trim().required("Name is required"),
    address: Yup.string().trim().defined(),
    city: Yup.string().trim().defined(),
    zip: Yup.string().trim().defined(),
    iconUrl: Yup.string().trim().defined(),
    active: Yup.boolean().required()
  });

  const defaultValues = useMemo<CompanyData>(
    () => ({
      code: currentCompany?.code ?? "",
      name: currentCompany?.name ?? "",
      address: currentCompany?.address ?? "",
      city: currentCompany?.city ?? "",
      zip: currentCompany?.zip ?? "",
      iconUrl: currentCompany?.iconUrl ?? "",
      active: currentCompany?.active ?? true
    }),
    [currentCompany]
  );

  const methods = useForm<CompanyData>({
    resolver: yupResolver(CompanySchema),
    defaultValues,
    mode: "onChange"
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = methods;

  const handleIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setIconFile(null);
      return;
    }

    if (!ICON_TYPES.includes(file.type)) {
      setErrorMsg("Icon must be a PNG or JPG image.");
      return;
    }

    if (file.size > ICON_MAX_SIZE) {
      setErrorMsg("Icon must be smaller than 300KB.");
      return;
    }

    setErrorMsg('');
    setIconFile(file);
  };

  const onSubmit = async (data: CompanyData) => {
    try {
      setErrorMsg('');
      let iconUrl = data.iconUrl;
      if (iconFile) {
        const upload = await UploadApi.uploadFile("COMPANY_ICON", iconFile);
        iconUrl = upload.path;
      }
      const payload = { ...data, iconUrl };
      await CompanyApi.createCompany(payload);
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
                  <input
                    accept="image/png,image/jpeg"
                    type="file"
                    onChange={handleIconChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <RHFSwitch name="active" label="Active" />
                </Grid>
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
