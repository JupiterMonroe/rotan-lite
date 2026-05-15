import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ROTAN Lite | Runtime Verification for AI Coding Assistants",
  description: "Runtime verification and intervention layer for AI coding assistants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0F1117]`}>{children}</body>
    </html>
  );
}

// Made with Bob
