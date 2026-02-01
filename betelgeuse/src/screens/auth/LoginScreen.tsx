import { login } from "@src/api/auth";
import ApiFeedback from "@src/components/ui/api-feedback";
import LinkButton from "@src/components/ui/link-button";
import SubmitButton from "@src/components/ui/submit-button";
import AuthScreenLayout from "@src/screens/auth/components/layout/auth-screen-layout";
import AuthField from "@src/screens/auth/components/ui/auth-field";
import AuthHeader from "@src/screens/auth/components/ui/auth-header";
import { useAuthStore } from "@src/state/auth-store";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function LoginScreen() {
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await login({ usernameOrEmail, password });
      setAccessToken(data.accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout>
      <AuthHeader title="Welcome back" subtitle="Sign in to continue" />
      <ApiFeedback message={error} />
      <AuthField
        label="Email or username"
        value={usernameOrEmail}
        onChange={setUsernameOrEmail}
        placeholder="Email or username"
        keyboardType="email-address"
        iconName="account"
      />
      <AuthField
        label="Password"
        value={password}
        onChange={setPassword}
        placeholder="Password"
        secureTextEntry
        iconName="lock"
      />
      <SubmitButton label="Sign in" loadingLabel="Signing in..." loading={loading} onPress={onSubmit} />
      <LinkButton label="Create account" onPress={() => router.push("/register")} />
      <LinkButton label="Forgot password?" onPress={() => router.push("/forgot-password")} />
    </AuthScreenLayout>
  );
}
