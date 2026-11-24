import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduPlatform",
  description: "Personal Learning Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}