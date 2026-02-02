import { useState } from "react";
import { register } from "@src/api/auth";
import AuthScreenLayout from "@src/screens/auth/components/layout/auth-screen-layout";
import AuthHeader from "@src/screens/auth/components/ui/auth-header";
import AuthField from "@src/screens/auth/components/ui/auth-field";
import SubmitButton from "@src/components/ui/submit-button";
import LinkButton from "@src/components/ui/link-button";
import ApiFeedback from "@src/components/ui/api-feedback";
import { getApiErrorMessage } from "@src/utils/api-error";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      await register({ firstName, lastName, email, password, companyCode });
      router.replace("/login");
    } catch (err) {
      setError(getApiErrorMessage(err, "Register failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout>
      <AuthHeader title="Create account" subtitle="Register to request access" />
      <ApiFeedback message={error} />
      <AuthField label="First name" value={firstName} onChange={setFirstName} placeholder="First name" iconName="account" />
      <AuthField label="Last name" value={lastName} onChange={setLastName} placeholder="Last name" iconName="account" />
      <AuthField
        label="Email"
        value={email}
        onChange={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        iconName="email"
      />
      <AuthField
        label="Password"
        value={password}
        onChange={setPassword}
        placeholder="Password"
        secureTextEntry
        iconName="lock"
      />
      <AuthField
        label="Company code"
        value={companyCode}
        onChange={setCompanyCode}
        placeholder="Company code"
        iconName="key"
      />
      <SubmitButton label="Register" loadingLabel="Submitting..." loading={loading} onPress={onSubmit} />
      <LinkButton label="Back to login" onPress={() => router.push("/login")} />
    </AuthScreenLayout>
  );
}
