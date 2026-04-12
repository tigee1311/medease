import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedEase",
  description: "Senior-friendly medication tracking with caregiver visibility and guided verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
