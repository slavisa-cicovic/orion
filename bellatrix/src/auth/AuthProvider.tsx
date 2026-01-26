"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setAuthToken } from "@/auth/auth-token";

type AuthUser = {
  userId?: string;
  companyId?: string;
};

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  roles: string[];
  permissions: string[];
  isAuthenticated: boolean;
  isInitializing: boolean;
};

type LoginInput = {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
};

type AuthContextValue = AuthState & {
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
};

type JwtPayload = {
  sub?: string;
  company_id?: string;
  companyId?: string;
  role?: string | string[];
  roles?: string[];
  permissions?: string[] | string;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const rememberMeKey = "orion.rememberMe";

function parseJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = globalThis.atob(normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, "="));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function getAuthStateFromToken(accessToken: string | null): Omit<AuthState, "isAuthenticated"> {
  if (!accessToken) {
    return {
      accessToken: null,
      user: null,
      roles: [],
      permissions: [],
      isInitializing: false
    };
  }

  const payload = parseJwt(accessToken);
  const roles = payload?.roles ?? payload?.role ?? [];
  const permissions = payload?.permissions ?? [];

  return {
    accessToken,
    user: {
      userId: payload?.sub,
      companyId: payload?.company_id ?? payload?.companyId
    },
    roles: Array.isArray(roles) ? roles : [roles],
    permissions: Array.isArray(permissions) ? permissions : [permissions],
    isInitializing: false
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    accessToken: null,
    user: null,
    roles: [],
    permissions: [],
    isAuthenticated: false,
    isInitializing: true
  }));

  const setAccessToken = useCallback((accessToken: string | null) => {
    const next = getAuthStateFromToken(accessToken);
    setAuthToken(accessToken);
    setState({
      ...next,
      isAuthenticated: Boolean(accessToken),
      isInitializing: false
    });
  }, []);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include"
    });

    if (!res.ok) {
      setAccessToken(null);
      return;
    }

    const data = await res.json();
    setAccessToken(data?.accessToken ?? null);
  }, [setAccessToken]);

  const login = useCallback(async (input: LoginInput) => {
    const { rememberMe, ...payload } = input;
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      setAccessToken(null);
      throw new Error("Login failed");
    }

    const data = await res.json();
    setAccessToken(data?.accessToken ?? null);

    if (rememberMe) {
      localStorage.setItem(rememberMeKey, "true");
    } else {
      localStorage.removeItem(rememberMeKey);
    }
  }, [setAccessToken]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });

    setAccessToken(null);
    localStorage.removeItem(rememberMeKey);
  }, [setAccessToken]);

  const hasPermission = useCallback((permission: string) => {
    return state.permissions.includes(permission);
  }, [state.permissions]);

  useEffect(() => {
    const shouldRemember = localStorage.getItem(rememberMeKey) === "true";
    if (!shouldRemember) {
      setState((prev) => ({ ...prev, isInitializing: false }));
      return;
    }

    refresh().finally(() => {
      setState((prev) => ({ ...prev, isInitializing: false }));
    });
  }, [refresh]);

  const value = useMemo<AuthContextValue>(() => ({
    ...state,
    login,
    logout,
    refresh,
    hasPermission
  }), [state, login, logout, refresh, hasPermission]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
