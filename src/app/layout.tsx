import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AFARI — The Operating System for Business Travel in Africa",
    template: "%s · AFARI",
  },
  description:
    "AFARI replaces fragmented WhatsApp requests, email approvals, multi-site bookings, and manual reconciliation with one calm, intelligent platform.",
  metadataBase: new URL("https://afari.travel"),
  openGraph: {
    title: "AFARI — The Operating System for Business Travel in Africa",
    description:
      "Turn a 2-hour travel process into 2 minutes. Built for corporations moving across the continent.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
