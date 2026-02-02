import { StyleSheet, Text, View } from "react-native";
import ScrollScreen from "@src/components/layout/scroll-screen";

export default function HomeScreen() {
  return (
    <ScrollScreen title="Home">
      <View style={styles.container}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>Placeholder content for Betelgeuse.</Text>
      </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 420, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 16 },
});
