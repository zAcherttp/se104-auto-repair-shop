import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { ReactNode } from "react";
import { ReactScan } from "@/components/react-scan";
import { getLocale, getMessages } from "next-intl/server";

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
