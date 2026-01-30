"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { Alert, Button, Card, CardActions, CardContent, CardHeader, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import FormProvider, { RHFTextField, RHFUpload } from "@/components/hook-form";
import RHFSwitch from "@/components/hook-form/rhf-switch";
import RHFAutocomplete from "@/components/hook-form/rhf-autocomplete";
import { UploadApi } from "@/api/uploads";
import { AppVersionApi } from "@/api/app-versions";
import { useSnackbar } from "notistack";
import { AppVersion } from "@/api/types/app-versions";

type AppVersionData = {
  versionName: string;
  versionCode: number;
  platform: "ANDROID" | "IOS";
  minSdk: number | "";
  targetSdk: number | "";
  fileUrl: string;
  fileRef: File | string | null;
  checksum: string;
  active: boolean;
  reason?: string;
};

type Props = {
  appId: string;
  currentAppVersion?: AppVersion;
  isLatest?: boolean;
  publishedToCompany?: boolean;
};

const PLATFORM_OPTIONS: Array<AppVersionData["platform"]> = ["ANDROID", "IOS"];

export default function AppVersionEditForm({
  appId,
  currentAppVersion,
  isLatest = true,
  publishedToCompany = false
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [errorMsg, setErrorMsg] = useState("");

  const FILE_MAX_SIZE = 300 * 1024 * 1024;

  const AppVersionSchema = Yup.object({
    versionName: Yup.string().trim().required("Version name is required"),
    versionCode: Yup.number().typeError("Version code must be a number").required("Version code is required"),
    platform: Yup.mixed<AppVersionData["platform"]>()
      .oneOf(PLATFORM_OPTIONS)
      .required("Platform is required"),
    minSdk: Yup.mixed<number | "">().defined(),
    targetSdk: Yup.mixed<number | "">().defined(),
    fileUrl: Yup.string().trim().defined(),
    fileRef: Yup.mixed().nullable().defined(),
    checksum: Yup.string().trim().defined(),
    active: Yup.boolean().required(),
    reason: Yup.string().trim().when([], {
      is: () => Boolean(currentAppVersion?.id),
      then: (schema) => schema.required("Reason is required"),
      otherwise: (schema) => schema.optional()
    })
  }) as Yup.ObjectSchema<AppVersionData>;

  const defaultValues = useMemo<AppVersionData>(
    () => ({
      versionName: currentAppVersion?.versionName ?? "",
      versionCode: currentAppVersion?.versionCode ?? 1,
      platform: currentAppVersion?.platform ?? "ANDROID",
      minSdk: currentAppVersion?.minSdk ?? "",
      targetSdk: currentAppVersion?.targetSdk ?? "",
      fileUrl: currentAppVersion?.fileUrl ?? "",
      fileRef: currentAppVersion?.fileUrl ?? "",
      checksum: currentAppVersion?.checksum ?? "",
      active: currentAppVersion?.active ?? true,
      reason: ""
    }),
    [currentAppVersion]
  );

  const methods = useForm<AppVersionData>({
    resolver: yupResolver(AppVersionSchema),
    defaultValues,
    mode: "onChange"
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting }
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const platform = watch("platform");
  const fileRef = watch("fileRef");
  const lockAll = Boolean(currentAppVersion?.id) && !isLatest;
  const lockVersionFields = Boolean(currentAppVersion?.id) && publishedToCompany;

  const selectedFileName = useMemo(() => {
    if (!fileRef) return "";
    if (typeof fileRef === "string") {
      const parts = fileRef.split("/");
      return parts[parts.length - 1] || fileRef;
    }
    return fileRef.name || "";
  }, [fileRef]);

  const originalFileName = currentAppVersion?.originalFileName ?? "";

  const onSubmit = async (data: AppVersionData) => {
    try {
      setErrorMsg("");
      if (lockAll) {
        setErrorMsg("Only the latest version can be updated.");
        return;
      }
      let fileUrl = data.fileUrl;
      if (data.fileRef && typeof data.fileRef !== "string") {
        const upload = await UploadApi.uploadFile(platform === "ANDROID" ? "APK" : "IPA", data.fileRef);
        fileUrl = upload.path;
      }

      const payload = {
        applicationId: Number(appId),
        versionName: data.versionName.trim(),
        versionCode: data.versionCode,
        platform: data.platform,
        minSdk: data.minSdk === "" ? null : Number(data.minSdk),
        targetSdk: data.targetSdk === "" ? null : Number(data.targetSdk),
        fileUrl,
        originalFileName: selectedFileName || originalFileName || null,
        checksum: data.checksum.trim() || null,
        active: data.active
      };

      if (currentAppVersion?.id) {
        await AppVersionApi.updateVersion(currentAppVersion.id, {
          ...payload,
          reason: data.reason?.trim() || ""
        });
        enqueueSnackbar("update_success");
      } else {
        await AppVersionApi.createVersion(payload);
        enqueueSnackbar("create_success");
      }
      reset(defaultValues);
    } catch (error: unknown) {
      console.error(error);
      let message = "Unknown error";
      if (axios.isAxiosError(error)) {
        const apiMessage =
          error.response?.data?.reason ??
          error.response?.data?.detail ??
          error.response?.data?.title ??
          error.response?.data?.message;
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
            <CardHeader title="App version details" />
            <CardContent>
              <Grid container spacing={2}>
                {errorMsg && (
                  <Grid item xs={12}>
                    <Alert severity="error">{errorMsg}</Alert>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <RHFTextField name="versionName" label="Version name" disabled={lockAll || lockVersionFields} />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="versionCode" label="Version code" type="number" disabled={lockAll || lockVersionFields} />
                </Grid>
                <Grid item xs={12}>
                  <RHFAutocomplete
                    name="platform"
                    label="Platform"
                    options={PLATFORM_OPTIONS}
                    getOptionLabel={(option) => option}
                    isOptionEqualToValue={(option, value) => option === value}
                    disabled={lockAll || lockVersionFields}
                  />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="minSdk" label="Min SDK" type="number" disabled={lockAll} />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="targetSdk" label="Target SDK" type="number" disabled={lockAll} />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="checksum" label="Checksum" disabled={lockAll || lockVersionFields} />
                </Grid>
                <Grid item xs={12}>
                  <RHFUpload
                    name="fileRef"
                    maxSize={FILE_MAX_SIZE}
                    accept={
                      platform === "ANDROID"
                        ? { "application/vnd.android.package-archive": [".apk"] }
                        : { "application/octet-stream": [".ipa"] }
                    }
                    helperText={
                      (selectedFileName || originalFileName) ? (
                        <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                          {selectedFileName ? `Selected file: ${selectedFileName}` : `Original file: ${originalFileName}`}
                        </Typography>
                      ) : undefined
                    }
                    onDrop={(acceptedFiles) => {
                      const file = acceptedFiles[0];
                      if (!file) return;
                      setErrorMsg("");
                      setValue("fileRef", file, { shouldValidate: true });
                    }}
                    disabled={lockAll || lockVersionFields}
                  />
                </Grid>
                <Grid item xs={12}>
                  <RHFSwitch name="active" label="Active" disabled={lockAll} />
                </Grid>
                {currentAppVersion?.id && (
                  <Grid item xs={12}>
                    <RHFTextField name="reason" label="Reason" disabled={lockAll} />
                  </Grid>
                )}
              </Grid>
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end", px: 3, pb: 3 }}>
              <Button type="submit" variant="contained" disabled={isSubmitting || lockAll}>
                {currentAppVersion?.id ? "Save changes" : "Create version"}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
