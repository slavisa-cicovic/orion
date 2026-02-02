import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "@src/state/auth-store";

export default function HomeScreen() {
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Placeholder content for Betelgeuse.</Text>
      <Pressable style={styles.button} onPress={() => void clearSession()}>
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 16 },
  button: { backgroundColor: "#111827", padding: 12, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "600" }
});
