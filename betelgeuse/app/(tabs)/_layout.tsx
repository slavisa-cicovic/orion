import { Tabs } from "expo-router";
import { useMemo } from "react";
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

export default function TabsLayout() {
  const accessToken = useAuthStore((state: AuthState) => state.accessToken);
  const isCompanyAdmin = useMemo(() => {
    const payload = decodeJwtPayload(accessToken);
    const roles = payload?.roles;
    if (!Array.isArray(roles)) return false;
    return roles.includes("COMPANY_ADMIN");
  }, [accessToken]);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen
        name="publish-users"
        options={{
          title: "Publish users",
          href: null,
        }}
      />
      <Tabs.Screen
        name="registration-requests"
        options={{
          title: "Registration requests",
          href: isCompanyAdmin ? undefined : null,
        }}
      />
    </Tabs>
  );
}
