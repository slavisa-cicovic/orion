"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/auth/useAuth";
import * as yup from "yup";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type FormState = {
  usernameOrEmail: string;
  password: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const loginSchema = yup.object({
  usernameOrEmail: yup.string().required("Email or username is required"),
  password: yup.string().required("Password is required")
});

export default function LoginView() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState<FormState>({ usernameOrEmail: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      await loginSchema.validate(form, { abortEarly: false });
      await login({ ...form, rememberMe });
      router.replace("/");
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const nextErrors: FieldErrors = {};
        err.inner.forEach((issue) => {
          if (issue.path && !nextErrors[issue.path as keyof FormState]) {
            nextErrors[issue.path as keyof FormState] = issue.message;
          }
        });
        setFieldErrors(nextErrors);
        return;
      }
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="main" sx={{ maxWidth: 420, mx: "auto", mt: 9, px: 3 }}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4">Sign in</Typography>
          <Typography variant="body2" color="text.secondary">
            Use your work email and password to continue.
          </Typography>
        </Stack>
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              name="usernameOrEmail"
              type="text"
              label="Email or username"
              value={form.usernameOrEmail}
              onChange={onChange}
              autoComplete="username"
              required
              fullWidth
              error={Boolean(fieldErrors.usernameOrEmail)}
              helperText={fieldErrors.usernameOrEmail}
            />
            <TextField
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              value={form.password}
              onChange={onChange}
              autoComplete="current-password"
              required
              fullWidth
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                }
                label="Remember me"
              />
              <MuiLink component={Link} href="/forgot-password" variant="body2">
                Forgot password?
              </MuiLink>
            </Stack>
            {error ? (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            ) : null}
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
