"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  UserPlus,
  FileSignature,
  FileText,
  Clock,
  Search,
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

interface GlobalContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export function GlobalContextMenu({ x, y, onClose }: GlobalContextMenuProps) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
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
      className="fixed z-[100] w-56 rounded-xl shadow-lg border border-neutral-200 bg-white p-1"
      style={{ left: position.x, top: position.y }}
    >
      <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">
        Quick actions
      </p>
      <button
        type="button"
        onClick={openSearch}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <span className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
          <Search className="w-4 h-4 text-neutral-500" />
        </span>
        Search…
        <kbd className="ml-auto font-mono text-[10px] text-neutral-400">⌘K</kbd>
      </button>
      <button
        type="button"
        onClick={() => navigate("/projects/new")}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <span className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
          <FolderKanban className="w-4 h-4 text-neutral-600" />
        </span>
        New project
      </button>
      <button
        type="button"
        onClick={() => navigate("/clients/new")}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <span className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
          <UserPlus className="w-4 h-4 text-neutral-600" />
        </span>
        New client
      </button>
      <button
        type="button"
        onClick={() => navigate("/proposals/new")}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <span className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
          <FileSignature className="w-4 h-4 text-neutral-600" />
        </span>
        New proposal
      </button>
      <button
        type="button"
        onClick={() => navigate("/invoices/new")}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <span className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-neutral-600" />
        </span>
        New invoice
      </button>
      <button
        type="button"
        onClick={() => navigate("/time-logs")}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <span className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4 text-neutral-600" />
        </span>
        Log time
      </button>

      <div className="border-t border-neutral-100 my-1" />
      <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">
        Go to
      </p>
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <span className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
          <LayoutDashboard className="w-4 h-4 text-neutral-500" />
        </span>
        Dashboard
      </button>
      <button
        type="button"
        onClick={() => navigate("/projects")}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <span className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
          <FolderKanban className="w-4 h-4 text-neutral-500" />
        </span>
        Projects
      </button>
      <button
        type="button"
        onClick={() => navigate("/clients")}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <span className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
          <Users className="w-4 h-4 text-neutral-500" />
        </span>
        Clients
      </button>
      <button
        type="button"
        onClick={() => navigate("/proposals")}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <span className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
          <FileSignature className="w-4 h-4 text-neutral-500" />
        </span>
        Proposals
      </button>
      <button
        type="button"
        onClick={() => navigate("/time-logs")}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <span className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4 text-neutral-500" />
        </span>
        Time logs
      </button>
      <button
        type="button"
        onClick={() => navigate("/invoices")}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <span className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-neutral-500" />
        </span>
        Invoices
      </button>
      <button
        type="button"
        onClick={() => navigate("/reports")}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <span className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
          <BarChart3 className="w-4 h-4 text-neutral-500" />
        </span>
        Reports
      </button>
      <button
        type="button"
        onClick={() => navigate("/settings")}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <span className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
          <Settings className="w-4 h-4 text-neutral-500" />
        </span>
        Settings
      </button>
    </div>
  );
}
