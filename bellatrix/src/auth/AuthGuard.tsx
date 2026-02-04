"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/useAuth";

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isInitializing, roles, logout } = useAuth();
  const isSuperAdmin = roles.includes("SUPER_ADMIN");

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isInitializing, router]);

  useEffect(() => {
    if (!isInitializing && isAuthenticated && !isSuperAdmin) {
      void logout();
      router.replace("/login");
    }
  }, [isInitializing, isAuthenticated, isSuperAdmin, logout, router]);

  if (isInitializing || !isAuthenticated || !isSuperAdmin) {
    return null;
  }

  return <>{children}</>;
}
