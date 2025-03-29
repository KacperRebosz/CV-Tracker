import type React from "react";
import { Inter } from "next/font/google";

import "./globals.css";

import { Toaster } from "sonner";

import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CV Tracker",
  description: "Track your job applications",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="bg-background text-foreground min-h-screen">
            <Navbar />
            <main className="pt-16">
              {children}
              <Toaster position="top-right" richColors />
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
