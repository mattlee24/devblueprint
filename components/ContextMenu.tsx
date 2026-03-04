"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, Pencil, Link2, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteProposal } from "@/lib/queries/proposals";
import { deleteClient } from "@/lib/queries/clients";
import { deleteProject } from "@/lib/queries/projects";
import { deleteInvoice } from "@/lib/queries/invoices";

type ContextType = "client" | "project" | "invoice" | "proposal";

const ROUTES: Record<ContextType, { open: (id: string) => string; edit: (id: string) => string }> = {
  client: { open: (id) => `/clients/${id}`, edit: (id) => `/clients/${id}/edit` },
  project: { open: (id) => `/projects/${id}`, edit: (id) => `/projects/${id}/edit` },
  invoice: { open: (id) => `/invoices/${id}`, edit: (id) => `/invoices/${id}` },
  proposal: { open: (id) => `/proposals/${id}`, edit: (id) => `/proposals/${id}/edit` },
};

interface ContextMenuState {
  x: number;
  y: number;
  type: ContextType;
  id: string;
}

interface ContextMenuProps {
  state: ContextMenuState | null;
  onClose: () => void;
}

const MENU_WIDTH = 180;

export function ContextMenu({ state, onClose }: ContextMenuProps) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!state) return;
    // Start from the raw click position; we'll refine once we know the menu size.
    let x = state.x;
    let y = state.y;
    if (typeof window !== "undefined") {
      if (x + MENU_WIDTH > window.innerWidth) x = window.innerWidth - MENU_WIDTH - 8;
      if (x < 8) x = 8;
      if (y < 8) y = 8;
    }
    setPosition({ x, y });
  }, [state]);

  // After render, ensure the full menu is in view using its real height/width.
  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return;
    const rect = ref.current.getBoundingClientRect();
    let x = position.x;
    let y = position.y;
    let changed = false;

    if (rect.right > window.innerWidth - 4) {
      x = Math.max(4, window.innerWidth - rect.width - 4);
      changed = true;
    }
    if (rect.bottom > window.innerHeight - 4) {
      y = Math.max(4, window.innerHeight - rect.height - 4);
      changed = true;
    }
    if (changed) {
      setPosition({ x, y });
    }
  }, [position]);

  useEffect(() => {
    if (!state) return;
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
  }, [state, onClose]);

  if (!state) return null;

  const routes = ROUTES[state.type];
  const openHref = routes.open(state.id);
  const editHref = routes.edit(state.id);
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${openHref}` : openHref;

  const listHref: Record<ContextType, string> = {
    client: "/clients",
    project: "/projects",
    invoice: "/invoices",
    proposal: "/proposals",
  };

  async function handleDeleteConfirm() {
    if (!state) return;
    setDeleteLoading(true);
    const deleteFns = {
      client: deleteClient,
      project: deleteProject,
      invoice: deleteInvoice,
      proposal: deleteProposal,
    };
    const { error } = await deleteFns[state.type](state.id);
    setDeleteLoading(false);
    setDeleteOpen(false);
    onClose();
    if (error) {
      toast.error(error.message ?? "Failed to delete");
      return;
    }
    toast.success("Deleted");
    router.push(listHref[state.type]);
  }

  return (
    <>
    <div
      ref={ref}
      className="fixed z-[100] min-w-[180px] py-1 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-surface)] shadow-lg"
      style={{ left: position.x, top: position.y }}
    >
      <button
        type="button"
        onClick={() => {
          router.push(openHref);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        Open
      </button>
      <button
        type="button"
        onClick={() => {
          router.push(editHref);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <Pencil className="w-3.5 h-3.5 shrink-0" />
        Edit
      </button>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(fullUrl).then(() => {
            toast.success("Link copied to clipboard");
            onClose();
          });
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <Link2 className="w-3.5 h-3.5 shrink-0" />
        Copy link
      </button>
      <div className="border-t border-[var(--border)] my-1" />
      <button
        type="button"
        onClick={() => setDeleteOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-[var(--accent-red)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
      >
        <Trash2 className="w-3.5 h-3.5 shrink-0" />
        Delete
      </button>
    </div>
    <ConfirmDialog
      open={deleteOpen}
      onClose={() => setDeleteOpen(false)}
      onConfirm={handleDeleteConfirm}
      title="Delete?"
      message="This cannot be undone."
      confirmLabel="Delete"
      variant="danger"
      loading={deleteLoading}
    />
    </>
  );
}

export type { ContextMenuState, ContextType };
