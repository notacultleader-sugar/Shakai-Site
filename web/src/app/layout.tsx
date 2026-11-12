import type { Metadata, Viewport } from "next";
import { DemoBar } from "@/components/DemoBar";
import { Footer, Header } from "@/components/Header";
import { env, isDemo } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: "Shakai Barber Academy · Barbering lessons, step by step", template: "%s · Shakai Barber Academy" },
  description: "Learn barbering from the chairs at Society Barbers. Short, single-skill video lessons from your first clipper to advanced fades. Start free.",
  icons: { icon: "/favicon.png", apple: "/apple-touch-icon.png" },
  openGraph: { type: "website", siteName: "Shakai Barber Academy", images: [{ url: "/brand/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#100D18", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@1,800&family=Montserrat:wght@400;500;600;700&display=swap" />
      </head>
      <body className={isDemo() ? "has-demo" : undefined}>
        <div className="bg" aria-hidden="true" />
        <Header />
        <main>{children}</main>
        <Footer />
        <DemoBar />
      </body>
    </html>
  );
}
