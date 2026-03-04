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
  Sun,
  Moon,
  Search,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Button } from "@/components/ui/Button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/proposals", label: "Proposals", icon: FileSignature },
  { href: "/time-logs", label: "Time Logs", icon: Clock },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "?";

  return (
    <aside className="no-print w-56 min-h-screen border-r border-[var(--border)] bg-[var(--bg-surface)] flex flex-col shrink-0">
      <div className="p-4 border-b border-[var(--border)]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-semibold text-[var(--accent)]">
            DevBlueprint
          </span>
          <span className="w-2 h-4 bg-[var(--accent)] animate-pulse" />
        </Link>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
          className="mt-2 flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition-[var(--transition)]"
          title="Search (⌘K)"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span>Search</span>
          <kbd className="ml-auto text-[10px] opacity-70">⌘K</kbd>
        </button>
      </div>
      <nav className="flex-1 p-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-card)] text-sm transition-[var(--transition)] border-l-2 ${
                isActive
                  ? "bg-[var(--bg-hover)] border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-active)]"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
        <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider px-2 py-1 border-b border-[var(--border)] mt-4 mb-2"/>
        <Link
          href="/settings"
          className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-card)] text-sm transition-[var(--transition)] border-l-2 ${
            pathname === "/settings"
              ? "bg-[var(--bg-hover)] border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Settings
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-card)] text-sm transition-[var(--transition)] border-l-2 border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-active)] w-full"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-card)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] w-full transition-[var(--transition)] border-l-2 border-transparent"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </nav>
      <div className="p-3 border-t border-[var(--border)] flex items-center gap-2 min-w-0">
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
    </aside>
  );
}
