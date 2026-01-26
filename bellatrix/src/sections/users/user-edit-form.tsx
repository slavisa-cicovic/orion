"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import FormProvider, { RHFTextField } from "@/components/hook-form";
import RHFAutocomplete from "@/components/hook-form/rhf-autocomplete";
import { Alert, Button, Card, CardActions, CardContent, CardHeader } from "@mui/material";
import Grid from "@mui/material/Grid";
import { UserApi } from "@/api/users";
import { User } from "@/api/types/users";
import { UserData } from "@/sections/users/types";
import { useGetCompanies } from "@/api/companies";
import { useSnackbar } from "notistack";
import { paths } from "@/routes/paths";
import { useRouter } from "src/routes/hooks";

type Props = {
  currentUser?: User;
};

export function UserEditForm({ currentUser }: Props) {
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

  const UserSchema: Yup.ObjectSchema<UserData> = Yup.object({
    email: Yup.string().trim().email("Invalid email").required("Email is required"),
    fullName: Yup.string().trim().defined(),
    companyId: Yup.string().trim().required("Company ID is required"),
    password: Yup.string().required("Password is required")
  });

  const defaultValues = useMemo<UserData>(
    () => ({
      email: currentUser?.email ?? "",
      fullName: currentUser?.fullName ?? "",
      companyId: currentUser?.companyId ?? "",
      password: ""
    }),
    [currentUser]
  );

  const methods = useForm<UserData>({
    resolver: yupResolver(UserSchema),
    defaultValues,
    mode: "onChange"
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = methods;

  const onSubmit = async (data: UserData) => {
    try {
      setErrorMsg("");
      await UserApi.createUser(data);
      reset(defaultValues);
      enqueueSnackbar(currentUser?.id ? "update success" : "create_success");
      router.push(paths.dashboard.users.root);
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
            <CardHeader title={currentUser ? "Edit user" : "Create user"} />
            <CardContent>
              <Grid container spacing={2}>
                {errorMsg && (
                  <Grid item xs={12}>
                    <Alert severity="error">{errorMsg}</Alert>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <RHFTextField name="email" label="Email" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="fullName" label="Full name" />
                </Grid>
                <Grid item xs={12}>
                  <RHFAutocomplete
                    name="companyId"
                    label="Company"
                    placeholder="Select company"
                    options={companyOptions}
                    getOptionLabel={getCompanyLabel}
                    isOptionEqualToValue={(option, value) => option === value}
                    freeSolo
                  />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="password" type="password" label="Password" />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end", px: 3, pb: 3 }}>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {currentUser ? "Save changes" : "Create user"}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
