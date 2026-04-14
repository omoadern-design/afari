import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Afari — Corporate Travel & Expense Management",
  description:
    "AI-powered corporate travel booking and expense management platform with policy enforcement and finance analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
