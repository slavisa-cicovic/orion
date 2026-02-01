import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";

type AuthScreenLayoutProps = {
  children: ReactNode;
  keyboardOffset?: number;
  paddingBottom?: number;
};

export default function AuthScreenLayout({
  children,
  keyboardOffset = 64,
  paddingBottom = 100,
}: AuthScreenLayoutProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : keyboardOffset}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom }]} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7ff" },
  content: { padding: 24, alignItems: "center" },
});
