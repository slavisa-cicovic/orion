import type { ReactNode } from "react";
import AuthGuard from "@/auth/AuthGuard";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <AuthGuard>{children}</AuthGuard>;
}
