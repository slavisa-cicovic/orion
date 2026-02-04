import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore, type AuthState } from "@src/state/auth-store";

function decodeJwtPayload(token: string | null): Record<string, unknown> | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  if (typeof globalThis.atob !== "function") {
    return null;
  }

  try {
    return JSON.parse(globalThis.atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const navState = useRootNavigationState();
  const hydrate = useAuthStore((state: AuthState) => state.hydrate);
  const hydrated = useAuthStore((state: AuthState) => state.hydrated);
  const accessToken = useAuthStore((state: AuthState) => state.accessToken);
  const clearSession = useAuthStore((state: AuthState) => state.clearSession);

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
    const payload = decodeJwtPayload(accessToken);
    const roles = payload?.roles;
    const roleList = Array.isArray(roles) ? roles : [];
    const hasMobileRole =
      roleList.includes("COMPANY_ADMIN") ||
      roleList.includes("COMPANY_USER") ||
      roleList.includes("COMPANY_PILOT_USER");

    if (accessToken && !hasMobileRole) {
      void clearSession();
      router.replace("/login");
      return;
    }

    if (!accessToken && !inAuthRoute) {
      router.replace("/login");
    } else if (accessToken && inAuthRoute) {
      router.replace("/home");
    }
  }, [accessToken, router, segments, hydrated, navState?.key, clearSession]);

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
      <Stack.Screen name="index" />
    </Stack>
  );
}

export default function RootLayout() {
  return <AuthGate />;
}
