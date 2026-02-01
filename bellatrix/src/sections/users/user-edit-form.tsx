"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import FormProvider, { RHFTextField } from "@/components/hook-form";
import RHFSwitch from "@/components/hook-form/rhf-switch";
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

  const UserSchema = Yup.object({
    username: Yup.string().trim().required("Username is required"),
    email: Yup.string().trim().email("Invalid email").required("Email is required"),
    firstName: Yup.string().trim().defined(),
    lastName: Yup.string().trim().defined(),
    phone: Yup.string().trim().defined(),
    companyId: Yup.string().trim().required("Company ID is required"),
    password: Yup.string().when([], {
      is: () => Boolean(currentUser?.id),
      then: (schema) => schema.optional(),
      otherwise: (schema) => schema.required("Password is required")
    }),
    active: Yup.boolean().required(),
    reason: Yup.string().trim().when([], {
      is: () => Boolean(currentUser?.id),
      then: (schema) => schema.required("Reason is required"),
      otherwise: (schema) => schema.optional()
    })
  }) as Yup.ObjectSchema<UserData>;

  const defaultValues = useMemo<UserData>(
    () => ({
      username: currentUser?.username ?? "",
      email: currentUser?.email ?? "",
      firstName: currentUser?.firstName ?? "",
      lastName: currentUser?.lastName ?? "",
      phone: currentUser?.phone ?? "",
      companyId: currentUser?.companyId != null ? String(currentUser.companyId) : "",
      password: "",
      active: currentUser?.active ?? true,
      reason: ""
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

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (data: UserData) => {
    try {
      setErrorMsg("");
      if (currentUser?.id) {
        await UserApi.updateUser(String(currentUser.id), data);
      } else {
        await UserApi.createUser(data);
      }
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
        <Grid item xs={12} >
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
                  <RHFTextField name="username" label="Username" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="email" label="Email" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="firstName" label="First name" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="lastName" label="Last name" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="phone" label="Phone" />
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
                <Grid item xs={12}>
                  <RHFSwitch name="active" label="Active" />
                </Grid>
                {currentUser?.id && (
                  <Grid item xs={12}>
                    <RHFTextField name="reason" label="Reason" />
                  </Grid>
                )}
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
