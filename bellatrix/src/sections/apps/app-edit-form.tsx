"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import FormProvider, { RHFTextField } from "@/components/hook-form";
import RHFSwitch from "@/components/hook-form/rhf-switch";
import { Alert, Button, Card, CardActions, CardContent, CardHeader } from "@mui/material";
import Grid from "@mui/material/Grid";
import { AppApi } from "@/api/apps";
import { UploadApi } from "@/api/uploads";
import { App } from "@/api/types/apps";
import { AppData } from "@/sections/apps/types";
import { useSnackbar } from "notistack";
import { paths } from "@/routes/paths";
import { useRouter } from "src/routes/hooks";

type Props = {
  currentApp?: App;
};

export function AppEditForm({ currentApp }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);

  const ICON_MAX_SIZE = 300 * 1024;
  const ICON_TYPES = ["image/png", "image/jpeg"];

  const AppSchema: Yup.ObjectSchema<AppData> = Yup.object({
    displayName: Yup.string().trim().required("Display name is required"),
    packageName: Yup.string().trim().required("Package name is required"),
    description: Yup.string().trim().defined(),
    iconUrl: Yup.string().trim().defined(),
    active: Yup.boolean().required(),
    reason: Yup.string().trim().when([], {
      is: () => Boolean(currentApp?.id),
      then: (schema) => schema.required("Reason is required"),
      otherwise: (schema) => schema.optional()
    })
  });

  const defaultValues = useMemo<AppData>(
    () => ({
      displayName: currentApp?.displayName ?? "",
      packageName: currentApp?.packageName ?? "",
      description: currentApp?.description ?? "",
      iconUrl: currentApp?.iconUrl ?? "",
      active: currentApp?.active ?? true,
      reason: ""
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

    setErrorMsg("");
    setIconFile(file);
  };

  const onSubmit = async (data: AppData) => {
    try {
      setErrorMsg("");
      let iconUrl = data.iconUrl;
      if (iconFile) {
        const upload = await UploadApi.uploadFile("ICON", iconFile);
        iconUrl = upload.path;
      }
      const payload = { ...data, iconUrl };
      if (currentApp?.id) {
        await AppApi.updateApp(String(currentApp.id), payload);
      } else {
        await AppApi.createApp(payload);
      }
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
        <Grid item xs={12}>
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
                  <input
                    accept="image/png,image/jpeg"
                    type="file"
                    onChange={handleIconChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <RHFSwitch name="active" label="Active" />
                </Grid>
                {currentApp?.id && (
                  <Grid item xs={12}>
                    <RHFTextField name="reason" label="Reason" />
                  </Grid>
                )}
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
