"use client";

import { AppVersionApi, useGetAppVersions } from "@/api/app-versions";
import { AppVersion } from "@/api/types/app-versions";
import { UploadApi } from "@/api/uploads";
import FormProvider, { RHFTextField, RHFUpload } from "@/components/hook-form";
import RHFAutocomplete from "@/components/hook-form/rhf-autocomplete";
import RHFSwitch from "@/components/hook-form/rhf-switch";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Button, Card, CardActions, CardContent, CardHeader } from "@mui/material";
import Grid from "@mui/material/Grid";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { useRouter } from "src/routes/hooks";
import { paths } from "@/routes/paths";

type AppVersionData = {
  versionName: string;
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
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");

  const FILE_MAX_SIZE = 300 * 1024 * 1024;

  const AppVersionSchema = Yup.object({
    versionName: Yup.string()
      .trim()
      .required("Version name is required")
      .matches(/^[1-9]\d*\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/, "Version name must be in format x.y.z")
      .test("versionNameGreater", "Version name must be greater than previous", (value) => {
        if (currentAppVersion?.id) return true;
        if (!value || !latestVersionName) return true;
        return compareVersionName(value, latestVersionName) > 0;
      }),
    platform: Yup.mixed<AppVersionData["platform"]>()
      .oneOf(PLATFORM_OPTIONS)
      .required("Platform is required"),
    minSdk: Yup.mixed<number | "">().defined(),
    targetSdk: Yup.mixed<number | "">().defined(),
    fileUrl: Yup.string().trim().defined(),
    fileRef: Yup.mixed().nullable().defined().when([], {
      is: () => !currentAppVersion?.id,
      then: (schema) =>
        schema.test("fileRequired", "APK/IPA file is required", (value) => {
          if (!value) return false;
          if (typeof value === "string") return value.trim().length > 0;
          return true;
        }),
      otherwise: (schema) => schema.optional()
    }),
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
      platform: currentAppVersion?.platform ?? "ANDROID",
      minSdk: currentAppVersion?.minSdk ?? "",
      targetSdk: currentAppVersion?.targetSdk ?? "",
      fileUrl: currentAppVersion?.fileUrl ?? "",
      fileRef: currentAppVersion?.fileUrl ?? null,
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

  const compareVersionName = (left: string, right: string) => {
    const leftParts = left.split(".");
    const rightParts = right.split(".");
    const numericOnly = [...leftParts, ...rightParts].every((part) => /^\d+$/.test(part));
    if (numericOnly) {
      const max = Math.max(leftParts.length, rightParts.length);
      for (let i = 0; i < max; i += 1) {
        const l = Number(leftParts[i] ?? 0);
        const r = Number(rightParts[i] ?? 0);
        if (l !== r) return l - r;
      }
      return 0;
    }
    return left.localeCompare(right, undefined, { sensitivity: "base" });
  };

  const platform = watch("platform");
  const fileRef = watch("fileRef");
  const { versions } = useGetAppVersions({ appId, platform });
  const lockAll = Boolean(currentAppVersion?.id) && !isLatest;
  const lockVersionFields = Boolean(currentAppVersion?.id) && publishedToCompany;

  const latestVersionName = useMemo(() => {
    if (!versions.length) return null;
    const latest = versions.reduce((acc, v) => (compareVersionName(v.versionName, acc.versionName) > 0 ? v : acc), versions[0]);
    return latest.versionName;
  }, [compareVersionName, versions]);

  useEffect(() => {
    if (!currentAppVersion?.id && latestVersionName) {
      void methods.trigger("versionName");
    }
  }, [currentAppVersion?.id, latestVersionName, methods]);

  const selectedFileName = useMemo(() => {
    if (!fileRef) return "";
    if (typeof fileRef === "string") return "";
    return fileRef.name || "";
  }, [fileRef]);

  const originalFileName = currentAppVersion?.originalFileName ?? "";
  const fileLabel = selectedFileName || originalFileName;

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
        reset(defaultValues);
      } else {
        await AppVersionApi.createVersion(payload);
        enqueueSnackbar("create_success");
        reset(defaultValues);
        router.push(paths.dashboard.apps.details(appId));
      }
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
            {currentAppVersion && <CardHeader title="App version details" />}
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
                    originalFileName={originalFileName}
                    accept={
                      platform === "ANDROID"
                        ? { "application/vnd.android.package-archive": [".apk"] }
                        : { "application/octet-stream": [".ipa"] }
                    }
                    onDrop={(acceptedFiles) => {
                      const file = acceptedFiles[0];
                      if (!file) return;
                      setErrorMsg("");
                      setValue("fileRef", file, { shouldValidate: true });
                    }}
                    helperText={fileLabel ? `Selected file: ${fileLabel}` : "Upload APK/IPA file"}
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
