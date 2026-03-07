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

const navItems: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
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

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="w-full flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 p-4">
        <div className="border-b border-[var(--border-subtle)] pb-4">
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <span className="text-lg font-semibold text-[var(--text-primary)]">
              DevBlueprint
            </span>
          </Link>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
            className="mt-3 flex items-center gap-2 w-full px-3 py-2 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-[var(--transition)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            title="Search (⌘K)"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>Search</span>
            <kbd className="ml-auto text-[10px] text-[var(--text-muted)]">⌘K</kbd>
          </button>
        </div>
        <nav className="flex-1 py-3 flex flex-col gap-0.5 min-h-0 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors duration-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 border-l-2 ${
                  isActive
                    ? "bg-[var(--bg-hover)] text-[var(--accent)] border-[var(--accent)]"
                    : "border-transparent text-[var(--text-secondary)] hover:bg-neutral-100 hover:text-[var(--text-primary)]"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] ${
                    isActive ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </Link>
            );
          })}
          <div className="my-2 border-t border-[var(--border-subtle)]" />
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors duration-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 border-l-2 ${
              pathname === "/settings"
                ? "bg-[var(--bg-hover)] text-[var(--accent)] border-[var(--accent)]"
                : "border-transparent text-[var(--text-secondary)] hover:bg-neutral-100 hover:text-[var(--text-primary)]"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] ${
                pathname === "/settings" ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
              }`}
            >
              <Settings className="h-4 w-4" />
            </span>
            Settings
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium text-[var(--text-secondary)] hover:bg-neutral-100 hover:text-[var(--text-primary)] w-full transition-colors duration-100 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 border-l-2 border-transparent"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] text-[var(--text-muted)]">
              <LogOut className="h-4 w-4" />
            </span>
            Sign Out
          </button>
        </nav>
        <div className="pt-4 mt-auto border-t-2 border-[var(--border)] flex items-center gap-3 min-w-0">
          <div
            className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
            title={user?.email ?? ""}
          >
            {initials}
          </div>
          <span className="text-xs text-[var(--text-muted)] truncate min-w-0" title={user?.email ?? ""}>
            {user?.email ?? "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
