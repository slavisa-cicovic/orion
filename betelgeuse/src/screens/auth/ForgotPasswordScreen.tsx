import { useState } from "react";
import { useRouter } from "expo-router";
import { forgotPassword } from "@src/api/auth";
import ApiFeedback from "@src/components/ui/api-feedback";
import LinkButton from "@src/components/ui/link-button";
import SubmitButton from "@src/components/ui/submit-button";
import AuthScreenLayout from "@src/screens/auth/components/layout/auth-screen-layout";
import AuthField from "@src/screens/auth/components/ui/auth-field";
import AuthHeader from "@src/screens/auth/components/ui/auth-header";
import { getApiErrorMessage } from "@src/utils/api-error";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await forgotPassword({ email });
      setSuccess("Check your inbox for reset instructions.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Request failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout>
      <AuthHeader title="Forgot password" subtitle="We will send you a reset link" />
      <ApiFeedback message={error || success} tone={error ? "error" : "success"} />
      <AuthField
        label="Email"
        value={email}
        onChange={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        iconName="email"
      />
      <SubmitButton
        label="Send reset link"
        loadingLabel="Sending..."
        loading={loading}
        onPress={onSubmit}
      />
      <LinkButton label="Back to login" onPress={() => router.push("/login")} />
    </AuthScreenLayout>
  );
}
