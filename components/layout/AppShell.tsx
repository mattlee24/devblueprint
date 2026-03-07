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
    <div
      className="flex h-screen w-full overflow-hidden bg-[var(--bg-base)]"
    >
      {/* Sidebar: almost full height with margin, does not scroll; shadow on wrapper so it isn't clipped */}
      <div className="hidden lg:flex flex-col flex-shrink-0 h-screen py-5 pl-5 pr-2">
        <div className="flex flex-col w-[248px] rounded-[var(--radius-lg)] shadow-[var(--shadow-sidebar)] flex-1 min-h-0 shrink-0">
          <aside
            className="no-print flex flex-col flex-1 min-h-0 rounded-[var(--radius-lg)] bg-[var(--surface)] overflow-hidden"
            style={{ border: "1px solid var(--card-border)" }}
          >
            <Sidebar />
          </aside>
        </div>
      </div>
      {/* Mobile: fixed sidebar overlay */}
      <aside
        className={`no-print flex flex-col fixed inset-y-0 left-0 z-30 w-[248px] h-screen transition-transform duration-200 ease-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } rounded-r-[var(--radius-lg)] shadow-[var(--shadow-sidebar)] bg-[var(--surface)]`}
        style={{ borderLeft: "none", borderWidth: "1px", borderColor: "var(--card-border)" }}
      >
        <Sidebar />
      </aside>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-black/50 lg:hidden cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Main: full width; page content is constrained and centered by PageContainer */}
      <div
        className="flex-1 min-h-0 overflow-auto flex flex-col min-w-0 bg-[var(--bg-base)]"
        data-page={pageKey}
      >
        <header className="lg:hidden sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-[var(--accent)] truncate cursor-pointer"
          >
            DevBlueprint
          </Link>
        </header>
        <div className="flex-1 min-h-0 w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
