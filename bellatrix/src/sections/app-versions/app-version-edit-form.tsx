"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { Alert, Button, Card, CardActions, CardContent, CardHeader } from "@mui/material";
import Grid from "@mui/material/Grid";
import FormProvider, { RHFTextField } from "@/components/hook-form";
import RHFSwitch from "@/components/hook-form/rhf-switch";
import RHFAutocomplete from "@/components/hook-form/rhf-autocomplete";
import { UploadApi } from "@/api/uploads";
import { AppVersionApi } from "@/api/app-versions";
import { useSnackbar } from "notistack";

type AppVersionData = {
  versionName: string;
  versionCode: number;
  platform: "ANDROID" | "IOS";
  minSdk: number | "";
  targetSdk: number | "";
  fileUrl: string;
  checksum: string;
  active: boolean;
};

type Props = {
  appId: string;
};

const PLATFORM_OPTIONS: Array<AppVersionData["platform"]> = ["ANDROID", "IOS"];

export default function AppVersionEditForm({ appId }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [errorMsg, setErrorMsg] = useState("");
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [ipaFile, setIpaFile] = useState<File | null>(null);

  const FILE_MAX_SIZE = 300 * 1024 * 1024;

  const AppVersionSchema: Yup.ObjectSchema<AppVersionData> = Yup.object({
    versionName: Yup.string().trim().required("Version name is required"),
    versionCode: Yup.number().typeError("Version code must be a number").required("Version code is required"),
    platform: Yup.mixed<AppVersionData["platform"]>()
      .oneOf(PLATFORM_OPTIONS)
      .required("Platform is required"),
    minSdk: Yup.mixed<number | "">().defined(),
    targetSdk: Yup.mixed<number | "">().defined(),
    fileUrl: Yup.string().trim().defined(),
    checksum: Yup.string().trim().defined(),
    active: Yup.boolean().required()
  });

  const defaultValues = useMemo<AppVersionData>(
    () => ({
      versionName: "",
      versionCode: 1,
      platform: "ANDROID",
      minSdk: "",
      targetSdk: "",
      fileUrl: "",
      checksum: "",
      active: true
    }),
    []
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
    formState: { isSubmitting }
  } = methods;

  const platform = watch("platform");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setApkFile(null);
      setIpaFile(null);
      return;
    }

    if (file.size > FILE_MAX_SIZE) {
      setErrorMsg("File must be smaller than 300MB.");
      return;
    }

    setErrorMsg("");
    if (platform === "ANDROID") {
      setApkFile(file);
    } else {
      setIpaFile(file);
    }
  };

  const onSubmit = async (data: AppVersionData) => {
    try {
      setErrorMsg("");
      let fileUrl = data.fileUrl;
      if (platform === "ANDROID" && apkFile) {
        const upload = await UploadApi.uploadFile("APK", apkFile);
        fileUrl = upload.path;
      }
      if (platform === "IOS" && ipaFile) {
        const upload = await UploadApi.uploadFile("IPA", ipaFile);
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
        checksum: data.checksum.trim() || null,
        active: data.active
      };

      await AppVersionApi.createVersion(payload);
      enqueueSnackbar("create_success");
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
                <Grid item xs={12} md={6}>
                  <RHFTextField name="versionName" label="Version name" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFTextField name="versionCode" label="Version code" type="number" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFAutocomplete
                    name="platform"
                    label="Platform"
                    options={PLATFORM_OPTIONS}
                    getOptionLabel={(option) => option}
                    isOptionEqualToValue={(option, value) => option === value}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFTextField name="minSdk" label="Min SDK" type="number" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFTextField name="targetSdk" label="Target SDK" type="number" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="checksum" label="Checksum" />
                </Grid>
                <Grid item xs={12}>
                  <input
                    accept={platform === "ANDROID" ? ".apk" : ".ipa"}
                    type="file"
                    onChange={handleFileChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <RHFSwitch name="active" label="Active" />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end", px: 3, pb: 3 }}>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                Create version
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
