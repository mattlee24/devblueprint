"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Clock,
  FileText,
  FileSignature,
  BarChart3,
  Settings,
  LogOut,
  Search,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const navItems: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; navVar: string }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, navVar: "var(--nav-dashboard)" },
  { href: "/projects", label: "Projects", icon: FolderKanban, navVar: "var(--nav-projects)" },
  { href: "/clients", label: "Clients", icon: Users, navVar: "var(--nav-clients)" },
  { href: "/proposals", label: "Proposals", icon: FileSignature, navVar: "var(--nav-proposals)" },
  { href: "/time-logs", label: "Time Logs", icon: Clock, navVar: "var(--nav-time-logs)" },
  { href: "/invoices", label: "Invoices", icon: FileText, navVar: "var(--nav-invoices)" },
  { href: "/reports", label: "Reports", icon: BarChart3, navVar: "var(--nav-reports)" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "?";

  return (
    <aside className="no-print w-56 min-h-screen border-r border-[var(--border)] flex flex-col shrink-0 relative overflow-hidden bg-transparent">
      <div className="absolute left-0 top-0 w-1 h-full opacity-60" style={{ background: "var(--gradient-accent)" }} aria-hidden />
      <div className="flex-1 flex flex-col relative z-10">
      <div className="p-4 border-b border-[var(--border)]">
        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
          <span className="text-lg font-semibold text-[var(--accent)]">
            DevBlueprint
          </span>
          <span className="w-2 h-4 bg-[var(--accent)] animate-pulse" />
        </Link>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
          className="mt-2 flex items-center gap-2 w-full px-2 py-1 rounded text-sm text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] active:bg-[var(--bg-active)] transition-[var(--transition)] cursor-pointer"
          title="Search (⌘K)"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span>Search</span>
          <kbd className="ml-auto text-[10px] opacity-70">⌘K</kbd>
        </button>
      </div>
      <nav className="flex-1 p-2 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon, navVar }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-badge)] text-sm transition-[var(--transition)] border-l-2 cursor-pointer ${
                isActive
                  ? "bg-[var(--bg-hover)]"
                  : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-active)] hover:text-[var(--text-primary)] active:bg-[var(--bg-active)]"
              }`}
              style={isActive ? { borderLeftColor: navVar, color: navVar } : undefined}
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "" : "bg-[var(--bg-elevated)]"}`}
                style={isActive ? { backgroundColor: `color-mix(in srgb, ${navVar} 18%, transparent)` } : undefined}
              >
                <span style={isActive ? { color: navVar } : undefined}>
                  <Icon className="w-4 h-4" />
                </span>
              </span>
              {label}
            </Link>
          );
        })}
        <div className="text-[10px] text-[var(--text-muted)] px-2 py-1 border-b border-[var(--border)] mt-4 mb-3" />
        <div className="flex flex-col gap-1">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-badge)] text-sm transition-[var(--transition)] border-l-2 cursor-pointer ${
              pathname === "/settings"
                ? "bg-[var(--bg-hover)]"
                : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] active:bg-[var(--bg-active)]"
            }`}
            style={pathname === "/settings" ? { borderLeftColor: "var(--nav-settings)", color: "var(--nav-settings)" } : undefined}
          >
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${pathname === "/settings" ? "" : "bg-[var(--bg-elevated)]"}`}
              style={pathname === "/settings" ? { backgroundColor: "color-mix(in srgb, var(--nav-settings) 18%, transparent)" } : undefined}
            >
              <span style={pathname === "/settings" ? { color: "var(--nav-settings)" } : undefined}>
                <Settings className="w-4 h-4" />
              </span>
            </span>
            Settings
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-badge)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] active:bg-[var(--bg-active)] w-full transition-[var(--transition)] border-l-2 border-transparent text-left cursor-pointer"
          >
            <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[var(--bg-elevated)]">
              <LogOut className="w-4 h-4" />
            </span>
            Sign Out
          </button>
        </div>
      </nav>
      <div className="p-4 border-t border-[var(--border)] flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-medium border border-[var(--border)]"
          style={{ backgroundColor: "var(--bg-elevated)" }}
          title={user?.email ?? ""}
        >
          {initials}
        </div>
        <span className="text-[11px] text-[var(--text-muted)] truncate min-w-0" title={user?.email ?? ""}>
          {user?.email ?? "—"}
        </span>
      </div>
      </div>
    </aside>
  );
}
