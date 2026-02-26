import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OrganizationProvider } from "@/components/providers/organization-provider";
import { AuthProvider } from "@/features/auth/auth-provider";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vulpi - Fakturační systém",
  description: "SaaS fakturační systém",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        <AuthProvider>
          <OrganizationProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </OrganizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
