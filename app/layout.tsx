import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import { PT_Mono, Source_Sans_3 } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const ptMono = PT_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DevBlueprint",
  description: "Developer productivity and client management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ptMono.variable} ${sourceSans.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.setAttribute('data-theme','light');`,
          }}
        />
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" theme="system" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
