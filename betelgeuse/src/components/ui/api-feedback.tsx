import { StyleSheet, Text } from "react-native";

type ApiFeedbackProps = {
  message?: string | null;
  tone?: "error" | "success";
};

export default function ApiFeedback({ message, tone = "error" }: ApiFeedbackProps) {
  if (!message) return null;
  return <Text style={[styles.message, tone === "error" ? styles.error : styles.success]}>{message}</Text>;
}

const styles = StyleSheet.create({
  message: { marginTop: 8, marginBottom: 4, textAlign: "center" },
  error: { color: "#b91c1c" },
  success: { color: "#2f8f5b" },
});
