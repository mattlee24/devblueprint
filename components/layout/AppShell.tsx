"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const pageKey =
    pathname === "/dashboard"
      ? "dashboard"
      : pathname.startsWith("/projects")
        ? "projects"
        : pathname.startsWith("/clients")
          ? "clients"
          : pathname.startsWith("/proposals")
            ? "proposals"
            : pathname.startsWith("/time-logs")
              ? "time-logs"
              : pathname.startsWith("/invoices")
                ? "invoices"
                : pathname.startsWith("/reports")
                  ? "reports"
                  : pathname.startsWith("/settings")
                    ? "settings"
                    : "default";

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden app-page-bg" data-page={pageKey}>
      {/* Desktop: always visible. Sidebar sits on page background; semi-transparent so tint shows through */}
      <aside
        className={`no-print border-r border-[var(--border)] flex flex-col shrink-0 fixed lg:static inset-y-0 left-0 z-30 w-56 h-screen lg:min-h-0 transition-transform duration-200 ease-out lg:translate-x-0 lg:rounded-r-[var(--radius-page)] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "rgba(255, 255, 255, 0.88)" }}
      >
        <Sidebar />
      </aside>
      {/* Mobile backdrop when sidebar open */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-black/50 lg:hidden cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex-1 min-h-0 overflow-auto flex flex-col min-w-0">
        {/* Mobile header with menu button */}
        <header className="lg:hidden sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] rounded-b-[var(--radius-page)]" style={{ background: "rgba(255, 255, 255, 0.95)" }}>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-[var(--radius-input)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="text-lg font-semibold text-[var(--accent)] truncate cursor-pointer">
            DevBlueprint
          </Link>
        </header>
        <div className="flex-1 p-3 sm:p-4 min-h-0">
          <div className="h-full min-h-[calc(100vh-8rem)] rounded-[var(--radius-page)] overflow-auto max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
