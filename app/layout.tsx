import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import { JetBrains_Mono, IBM_Plex_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono-secondary",
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
    <html lang="en" className={`${jetbrainsMono.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('devblueprint-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);})();`,
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
