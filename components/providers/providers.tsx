import { ThemeProvider } from "next-themes";
import { QueryProvider } from "./query-provider";
import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
