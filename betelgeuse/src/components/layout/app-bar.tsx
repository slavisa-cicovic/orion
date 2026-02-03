import { InteractionManager, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@src/state/auth-store";

type MaterialCommunityIconName = keyof typeof MaterialCommunityIcons.glyphMap;

type AppBarProps = {
  title: string;
  action?: {
    icon: MaterialCommunityIconName;
    onPress: () => void;
    disabled?: boolean;
    accessibilityLabel?: string;
  };
};

export default function AppBar({ title, action }: AppBarProps) {
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) =>
      InteractionManager.runAfterInteractions(() => resolve())
    );
    await clearSession();
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Orion / Betelgeuse</Text>
          <Text style={styles.headerSubtitle}>{title}</Text>
        </View>
        <View style={styles.actions}>
          {action ? (
            <TouchableOpacity
              style={[styles.iconButton, action.disabled ? styles.iconButtonDisabled : null]}
              onPress={action.onPress}
              disabled={action.disabled}
              accessibilityLabel={action.accessibilityLabel}
            >
              <MaterialCommunityIcons name={action.icon} size={18} color="#3a4c7a" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout-variant" size={18} color="#3a4c7a" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    position: "relative",
    zIndex: 2,
  },
  headerContent: { flex: 1, alignItems: "center" },
  headerTitle: { color: "#1f2a44", fontSize: 20, fontWeight: "700" },
  headerSubtitle: { color: "#6b7aa6", fontSize: 12, marginTop: 4 },
  actions: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 0, marginRight: 8 },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e1e6f3",
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },
});
