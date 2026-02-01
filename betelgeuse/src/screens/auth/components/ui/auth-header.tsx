import { StyleSheet, Text, View } from "react-native";

type AuthHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  title: { color: "#415a9c", fontSize: 26, fontWeight: "700", marginTop: 8 },
  subtitle: { color: "#7c8bb5", fontSize: 14, marginBottom: 24, textAlign: "center" },
});
