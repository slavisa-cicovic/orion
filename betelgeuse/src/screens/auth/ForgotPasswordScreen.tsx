import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { forgotPassword } from "@src/api/auth";
import { Link } from "expo-router";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      await forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot password</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {success && (
        <Text style={styles.successText}>Check your inbox for reset instructions</Text>
      )}
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <Pressable style={styles.button} onPress={onSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Sending..." : "Send reset link"}</Text>
      </Pressable>
      <View style={styles.links}>
        <Link href="/login">Back to login</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  links: { marginTop: 16 },
  errorText: { color: "#b91c1c", marginBottom: 12 },
  successText: { color: "#166534", marginBottom: 12 }
});
