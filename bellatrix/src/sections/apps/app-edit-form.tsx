"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import FormProvider, { RHFTextField, RHFUploadAvatar } from "@/components/hook-form";
import RHFSwitch from "@/components/hook-form/rhf-switch";
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { AppApi } from "@/api/apps";
import { UploadApi } from "@/api/uploads";
import { App } from "@/api/types/apps";
import { AppData, AppFormValues } from "@/sections/apps/types";
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

  const ICON_MAX_SIZE = 300 * 1024;

  const AppSchema = Yup.object({
    displayName: Yup.string().trim().required("Display name is required"),
    packageName: Yup.string().trim().required("Package name is required"),
    description: Yup.string().trim().defined(),
    iconUrl: Yup.string().trim().defined(),
    iconFile: Yup.mixed().nullable().defined(),
    active: Yup.boolean().required(),
    reason: Yup.string().trim().when([], {
      is: () => Boolean(currentApp?.id),
      then: (schema) => schema.required("Reason is required"),
      otherwise: (schema) => schema.optional()
    })
  }) as Yup.ObjectSchema<AppFormValues>;

  const iconPreviewUrl = useMemo(() => {
    if (!currentApp?.iconUrl) return null;
    const baseUrl = (process.env.NEXT_PUBLIC_HOST_API ?? "").replace(/\/$/, "");
    const apiBase = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
    return `${apiBase}/uploads/${currentApp.iconUrl.replace(/^\/+/, "")}`;
  }, [currentApp?.iconUrl]);

  const defaultValues = useMemo<AppFormValues>(
    () => ({
      displayName: currentApp?.displayName ?? "",
      packageName: currentApp?.packageName ?? "",
      description: currentApp?.description ?? "",
      iconUrl: currentApp?.iconUrl ?? "",
      iconFile: iconPreviewUrl ?? null,
      active: currentApp?.active ?? true,
      reason: ""
    }),
    [currentApp, iconPreviewUrl]
  );

  const methods = useForm<AppFormValues>({
    resolver: yupResolver(AppSchema),
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

  const onSubmit = async (data: AppFormValues) => {
    try {
      setErrorMsg("");
      let iconUrl = data.iconUrl;
      if (data.iconFile && typeof data.iconFile !== "string") {
        const upload = await UploadApi.uploadFile("ICON", data.iconFile);
        iconUrl = upload.path;
      }
      const payload: AppData = {
        displayName: data.displayName,
        packageName: data.packageName,
        description: data.description,
        active: data.active,
        iconUrl,
        reason: data.reason
      };
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
