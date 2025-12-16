import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { getLocale, getMessages } from "next-intl/server";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers/providers";
import { ReactScan } from "@/components/react-scan";

const defaultUrl = "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Garage Management",
  description:
    "A comprehensive garage management system for automotive repair shops.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <ReactScan />
      <body className={`${geistSans.className} antialiased`}>
        <Providers locale={locale} messages={messages}>
          <Toaster richColors={true} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
