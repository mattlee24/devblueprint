"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  UserPlus,
  FileSignature,
  FileText,
  Clock,
  Sun,
  Moon,
  Search,
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

interface GlobalContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

const MENU_WIDTH = 220;

export function GlobalContextMenu({ x, y, onClose }: GlobalContextMenuProps) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let px = x;
    let py = y;
    if (typeof window !== "undefined") {
      if (px < 8) px = 8;
      if (py < 8) py = 8;
    }
    setPosition({ x: px, y: py });
  }, [x, y]);

  // After the menu is rendered, adjust so it stays fully within the viewport.
  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return;
    const rect = ref.current.getBoundingClientRect();
    let px = position.x;
    let py = position.y;
    let changed = false;

    if (rect.right > window.innerWidth - 4) {
      px = Math.max(4, window.innerWidth - rect.width - 4);
      changed = true;
    }
    if (rect.bottom > window.innerHeight - 4) {
      py = Math.max(4, window.innerHeight - rect.height - 4);
      changed = true;
    }

    if (changed) {
      setPosition({ x: px, y: py });
    }
  }, [position]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleScroll() {
      onClose();
    }
    document.addEventListener("click", handleClick, true);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

  function navigate(href: string) {
    router.push(href);
    onClose();
  }

  function openSearch() {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
    onClose();
  }

  return (
    <div
      ref={ref}
      className="fixed z-[100] min-w-[220px] py-1 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-surface)] shadow-lg"
      style={{ left: position.x, top: position.y }}
    >
      <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)]">
        Quick actions
      </p>
      <button
        type="button"
        onClick={() => navigate("/projects/new")}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <FolderKanban className="w-3.5 h-3.5 shrink-0 text-[var(--accent-green)]" />
        New project
      </button>
      <button
        type="button"
        onClick={() => navigate("/clients/new")}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <UserPlus className="w-3.5 h-3.5 shrink-0 text-[var(--accent-green)]" />
        New client
      </button>
      <button
        type="button"
        onClick={() => navigate("/proposals/new")}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <FileSignature className="w-3.5 h-3.5 shrink-0 text-[var(--accent-green)]" />
        New proposal
      </button>
      <button
        type="button"
        onClick={() => navigate("/invoices/new")}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <FileText className="w-3.5 h-3.5 shrink-0 text-[var(--accent-green)]" />
        New invoice
      </button>
      <button
        type="button"
        onClick={() => navigate("/time-logs")}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <Clock className="w-3.5 h-3.5 shrink-0 text-[var(--accent-green)]" />
        Log time
      </button>

      <div className="border-t border-[var(--border)] my-1" />
      <button
        type="button"
        onClick={() => {
          toggleTheme();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        {theme === "dark" ? (
          <Sun className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
        ) : (
          <Moon className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
        )}
        {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      </button>

      <div className="border-t border-[var(--border)] my-1" />
      <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
        Go to
      </p>
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <LayoutDashboard className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
        Dashboard
      </button>
      <button
        type="button"
        onClick={() => navigate("/projects")}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <FolderKanban className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
        Projects
      </button>
      <button
        type="button"
        onClick={() => navigate("/clients")}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <Users className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
        Clients
      </button>
      <button
        type="button"
        onClick={() => navigate("/proposals")}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <FileSignature className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
        Proposals
      </button>
      <button
        type="button"
        onClick={() => navigate("/time-logs")}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <Clock className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
        Time logs
      </button>
      <button
        type="button"
        onClick={() => navigate("/invoices")}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <FileText className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
        Invoices
      </button>
      <button
        type="button"
        onClick={() => navigate("/reports")}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <BarChart3 className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
        Reports
      </button>
      <button
        type="button"
        onClick={() => navigate("/settings")}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <Settings className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
        Settings
      </button>

      <div className="border-t border-[var(--border)] my-1" />
      <button
        type="button"
        onClick={openSearch}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--accent)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        Search...
        <kbd className="ml-auto text-[10px] text-[var(--text-muted)]">⌘K</kbd>
      </button>
    </div>
  );
}
