import { StyleSheet, Text } from "react-native";

type ApiFeedbackProps = {
  message?: string | null;
};

export default function ApiFeedback({ message }: ApiFeedbackProps) {
  if (!message) return null;
  return <Text style={styles.message}>{message}</Text>;
}

const styles = StyleSheet.create({
  message: { color: "#2f8f5b", marginTop: 8, marginBottom: 4, textAlign: "center" },
});
