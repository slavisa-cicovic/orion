import type { ReactNode } from "react";
import { AuthProvider } from "@/auth/AuthProvider";
import ThemeProvider from "@/theme/theme-provider";

export const metadata = {
  title: "Orion",
  description: "Internal app store admin"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
