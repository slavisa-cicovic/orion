import { createContext, useContext, useMemo, useState } from "react";

type AuthState = {
  accessToken: string | null;
  signIn: (token: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      accessToken,
      signIn: (token: string) => setAccessToken(token),
      signOut: () => setAccessToken(null)
    }),
    [accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
