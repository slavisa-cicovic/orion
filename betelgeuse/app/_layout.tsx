import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore, type AuthState } from "@src/state/auth-store";

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const navState = useRootNavigationState();
  const hydrate = useAuthStore((state: AuthState) => state.hydrate);
  const hydrated = useAuthStore((state: AuthState) => state.hydrated);
  const accessToken = useAuthStore((state: AuthState) => state.accessToken);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!navState?.key) return;
    if (!segments.length) return;
    if (!hydrated) return;
    const inAuthRoute =
      segments[0] === "login" ||
      segments[0] === "register" ||
      segments[0] === "forgot-password";

    if (!accessToken && !inAuthRoute) {
      router.replace("/login");
    } else if (accessToken && inAuthRoute) {
      router.replace("/home");
    }
  }, [accessToken, router, segments, hydrated, navState?.key]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="publish-users" />
      <Stack.Screen name="index" />
    </Stack>
  );
}

export default function RootLayout() {
  return <AuthGate />;
}
