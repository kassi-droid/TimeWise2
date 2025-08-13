import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const ptSans = PT_Sans({ 
  subsets: ["latin"],
  weight: ["400", "700"] 
});

export const metadata: Metadata = {
  title: "TimeWise",
  description: "Track your work hours and earnings with ease.",
  manifest: "/manifest.json",
  themeColor: "#D0BFFF",
  appleWebAppCapable: "yes",
  appleWebAppStatusBarStyle: "default",
  appleWebAppTitle: "TimeWise",
  icons: {
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans antialiased", ptSans.className)}>
        {children}
      </body>
    </html>
  );
}
