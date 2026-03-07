"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Users,
  FolderKanban,
  FileText,
  FileSignature,
  UserPlus,
  Clock,
  Link2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { getClients } from "@/lib/queries/clients";
import { getProjects } from "@/lib/queries/projects";
import { getInvoices } from "@/lib/queries/invoices";
import { getProposals } from "@/lib/queries/proposals";
import type { ClientRow } from "@/lib/queries/clients";
import type { ProjectRow } from "@/lib/queries/projects";
import type { InvoiceRow } from "@/lib/queries/invoices";
import type { ProposalRow } from "@/lib/queries/proposals";
import { Modal } from "@/components/ui/Modal";

type SearchResult =
  | { type: "client"; id: string; title: string; subtitle?: string }
  | { type: "project"; id: string; title: string; subtitle?: string }
  | { type: "invoice"; id: string; title: string; subtitle?: string }
  | { type: "proposal"; id: string; title: string; subtitle?: string };

type PaletteItem =
  | { kind: "action"; label: string; href?: string; onSelect?: () => void; icon: React.ComponentType<{ className?: string }> }
  | { kind: "result"; result: SearchResult }
  | { kind: "nav"; label: string; href: string; keys: string };

const QUICK_ACTIONS: {
  label: string;
  href?: string;
  onSelect?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
}[] = [
  { label: "New project", href: "/projects/new", icon: FolderKanban, keywords: ["new", "project", "create", "add"] },
  { label: "New client", href: "/clients/new", icon: UserPlus, keywords: ["new", "client", "create", "add", "customer"] },
  { label: "New proposal", href: "/proposals/new", icon: FileSignature, keywords: ["new", "proposal", "create", "add", "onboarding"] },
  { label: "New invoice", href: "/invoices/new", icon: FileText, keywords: ["new", "invoice", "create", "add", "bill"] },
  { label: "Log time", href: "/time-logs", icon: Clock, keywords: ["log", "time", "hours", "track", "timer"] },
  // Toggle theme is added in component via useTheme
];

const NAV_ITEMS: { keys: string; label: string; href: string; keywords: string[] }[] = [
  { keys: "G D", label: "Go to Dashboard", href: "/dashboard", keywords: ["dashboard", "home"] },
  { keys: "G P", label: "Go to Projects", href: "/projects", keywords: ["projects", "list"] },
  { keys: "G C", label: "Go to Clients", href: "/clients", keywords: ["clients", "customers"] },
  { keys: "G O", label: "Go to Proposals", href: "/proposals", keywords: ["proposals", "onboarding"] },
  { keys: "G T", label: "Go to Time Logs", href: "/time-logs", keywords: ["time", "logs", "hours"] },
  { keys: "G I", label: "Go to Invoices", href: "/invoices", keywords: ["invoices", "billing"] },
  { keys: "G R", label: "Go to Reports", href: "/reports", keywords: ["reports", "analytics"] },
  { keys: "G S", label: "Go to Settings", href: "/settings", keywords: ["settings", "preferences"] },
];

function matchTerm(text: string, term: string): boolean {
  if (!term) return true;
  return text.toLowerCase().includes(term);
}
function matchKeywords(keywords: string[], term: string): boolean {
  if (!term) return true;
  const t = term.toLowerCase();
  return keywords.some((k) => k.includes(t) || t.includes(k));
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [invoices, setInvoices] = useState<(InvoiceRow & { clients?: { name: string } })[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [cRes, pRes, oRes, iRes] = await Promise.all([
      getClients(),
      getProjects(),
      getProposals(),
      getInvoices(),
    ]);
    setClients(cRes.data ?? []);
    setProjects(pRes.data ?? []);
    setProposals(oRes.data ?? []);
    setInvoices((iRes.data ?? []) as (InvoiceRow & { clients?: { name: string } })[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      fetchData();
    }
  }, [open, fetchData]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, [open]);

  const term = query.trim().toLowerCase();

  const items = useMemo((): PaletteItem[] => {
    const searchResults: SearchResult[] = [];
    if (term) {
      clients.forEach((c) => {
        if (c.name.toLowerCase().includes(term) || (c.company ?? "").toLowerCase().includes(term)) {
          searchResults.push({ type: "client", id: c.id, title: c.name, subtitle: c.company ?? undefined });
        }
      });
      projects.forEach((p) => {
        if (p.title.toLowerCase().includes(term)) {
          searchResults.push({ type: "project", id: p.id, title: p.title, subtitle: p.status });
        }
      });
      invoices.forEach((inv) => {
        const num = inv.invoice_number?.toLowerCase() ?? "";
        const clientName = (inv as InvoiceRow & { clients?: { name: string } }).clients?.name?.toLowerCase() ?? "";
        if (num.includes(term) || clientName.includes(term)) {
          searchResults.push({
            type: "invoice",
            id: inv.id,
            title: `Invoice ${inv.invoice_number}`,
            subtitle: (inv as InvoiceRow & { clients?: { name: string } }).clients?.name,
          });
        }
      });
      proposals.forEach((pr) => {
        if (pr.title.toLowerCase().includes(term)) {
          searchResults.push({
            type: "proposal",
            id: pr.id,
            title: pr.title,
            subtitle: pr.status,
          });
        }
      });
    }

    const copyDashboardAction: PaletteItem = {
      kind: "action",
      label: "Copy dashboard link",
      icon: Link2,
      onSelect: () => {
        const url = typeof window !== "undefined" ? `${window.location.origin}/dashboard` : "/dashboard";
        void navigator.clipboard.writeText(url).then(() => {
          toast.success("Dashboard link copied");
          setOpen(false);
        });
      },
    };
    const copyPageAction: PaletteItem = {
      kind: "action",
      label: "Copy link to this page",
      icon: Link2,
      onSelect: () => {
        const url = typeof window !== "undefined" ? window.location.href : "";
        void navigator.clipboard.writeText(url).then(() => {
          toast.success("Link copied to clipboard");
          setOpen(false);
        });
      },
    };
    const refreshAction: PaletteItem = {
      kind: "action",
      label: "Refresh data",
      icon: RefreshCw,
      onSelect: () => {
        fetchData();
        toast.success("Data refreshed");
        setOpen(false);
      },
    };
    const copyDashboardMatches = !term || matchTerm("Copy dashboard link", term) || (term.includes("copy") && term.includes("dashboard"));
    const copyPageMatches = !term || matchTerm("Copy link to this page", term) || (term.includes("copy") && term.includes("link"));
    const refreshMatches = !term || matchTerm("Refresh data", term) || term.includes("refresh");

    const baseActions: PaletteItem[] = QUICK_ACTIONS.filter((a) => matchTerm(a.label, term) || matchKeywords(a.keywords, term)).map(
      (a) => ({ kind: "action" as const, label: a.label, href: a.href, onSelect: a.onSelect, icon: a.icon })
    );
    const extraActions: PaletteItem[] = [
      ...(copyDashboardMatches ? [copyDashboardAction] : []),
      ...(copyPageMatches ? [copyPageAction] : []),
      ...(refreshMatches ? [refreshAction] : []),
    ];
    const actions: PaletteItem[] = [...baseActions, ...extraActions];
    const results: PaletteItem[] = searchResults.map((r) => ({ kind: "result" as const, result: r }));
    const nav: PaletteItem[] = NAV_ITEMS.filter((n) => matchTerm(n.label, term) || matchKeywords(n.keywords, term)).map(
      (n) => ({ kind: "nav" as const, label: n.label, href: n.href, keys: n.keys })
    );
    return [...actions, ...results, ...nav];
  }, [term, clients, projects, proposals, invoices]);

  const totalSelectable = items.length;
  const normalizedIndex = totalSelectable > 0 ? ((selectedIndex % totalSelectable) + totalSelectable) % totalSelectable : 0;
  const selectedItem = totalSelectable > 0 ? items[normalizedIndex] : null;

  useEffect(() => {
    if (items.length > 0 && selectedIndex >= items.length) {
      setSelectedIndex(items.length - 1);
    }
  }, [items.length, selectedIndex]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${normalizedIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [normalizedIndex]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => i + 1);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => i - 1);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedItem) {
        if (selectedItem.kind === "action" && selectedItem.onSelect) {
          selectedItem.onSelect();
          return;
        }
        const href =
          selectedItem.kind === "result"
            ? selectedItem.result.type === "client"
              ? `/clients/${selectedItem.result.id}`
              : selectedItem.result.type === "project"
                ? `/projects/${selectedItem.result.id}`
                : selectedItem.result.type === "proposal"
                  ? `/proposals/${selectedItem.result.id}`
                  : `/invoices/${selectedItem.result.id}`
            : selectedItem.kind === "action"
              ? selectedItem.href
              : selectedItem.href;
        if (href) {
          router.push(href);
          setOpen(false);
        }
      }
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "l") {
      e.preventDefault();
      if (selectedItem?.kind === "result") {
        const href =
          selectedItem.result.type === "client"
            ? `/clients/${selectedItem.result.id}`
            : selectedItem.result.type === "project"
              ? `/projects/${selectedItem.result.id}`
              : selectedItem.result.type === "proposal"
                ? `/proposals/${selectedItem.result.id}`
                : `/invoices/${selectedItem.result.id}`;
        const url = typeof window !== "undefined" ? `${window.location.origin}${href}` : href;
        void navigator.clipboard.writeText(url).then(() => {
          toast.success("Link copied to clipboard");
        });
      }
    }
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="" contentClassName="max-w-2xl w-full p-0 overflow-hidden">
      <div className="w-full">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-elevated)] rounded-t-[var(--radius-card)]">
          <Search className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search or run a command..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            autoFocus
          />
          <kbd className="hidden sm:inline text-[10px] text-[var(--text-muted)] px-1.5 py-0.5 rounded border border-[var(--border)]">Esc</kbd>
        </div>
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="py-4 text-center text-sm text-[var(--text-muted)]">Loading...</p>
          ) : (
            <>
              {items.length === 0 ? (
                <p className="py-4 px-3 text-sm text-[var(--text-muted)]">
                  {term ? `No results for "${query}"` : "Type to search or run a command."}
                </p>
              ) : (
                <div className="py-2">
                  {items.map((item, i) => {
                    const isSelected = i === normalizedIndex;
                    const actionCount = items.filter((x) => x.kind === "action").length;
                    const resultCount = items.filter((x) => x.kind === "result").length;
                    const firstResultIdx = actionCount;
                    const firstNavIdx = actionCount + resultCount;

                    return (
                      <div key={i}>
                        {i === 0 && item.kind === "action" && (
                          <p className="px-3 pt-2 pb-1 text-[10px] text-[var(--text-muted)]">
                            Quick actions
                          </p>
                        )}
                        {i === firstResultIdx && resultCount > 0 && (
                          <p className="px-3 pt-3 pb-1 text-[10px] text-[var(--text-muted)] border-t border-[var(--border)] mt-1">
                            Search results
                          </p>
                        )}
                        {i === firstNavIdx && (
                          <p className="px-3 pt-3 pb-1 text-[10px] text-[var(--text-muted)] border-t border-[var(--border)] mt-1">
                            Go to
                          </p>
                        )}
                        {item.kind === "action" &&
                          (item.href ? (
                            <Link
                              href={item.href}
                              data-index={i}
                              onClick={() => setOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 text-left transition-[var(--transition)] cursor-pointer ${
                                isSelected ? "bg-[var(--bg-hover)]" : "hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)]"
                              }`}
                            >
                              <item.icon className="w-4 h-4 shrink-0 text-[var(--accent)]" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                          ) : (
                            <button
                              type="button"
                              data-index={i}
                              onClick={() => item.onSelect?.()}
                              className={`flex items-center gap-3 px-3 py-2 w-full text-left transition-[var(--transition)] cursor-pointer ${
                                isSelected ? "bg-[var(--bg-hover)]" : "hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)]"
                              }`}
                            >
                              <item.icon className="w-4 h-4 shrink-0 text-[var(--accent)]" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </button>
                          ))}
                        {item.kind === "result" && (() => {
                          const ResultIcon =
                            item.result.type === "client"
                              ? Users
                              : item.result.type === "project"
                                ? FolderKanban
                                : item.result.type === "proposal"
                                  ? FileSignature
                                  : FileText;
                          return (
                          <Link
                            href={
                              item.result.type === "client"
                                ? `/clients/${item.result.id}`
                                : item.result.type === "project"
                                  ? `/projects/${item.result.id}`
                                  : item.result.type === "proposal"
                                    ? `/proposals/${item.result.id}`
                                    : `/invoices/${item.result.id}`
                            }
                            data-index={i}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 text-left transition-[var(--transition)] cursor-pointer ${
                              isSelected ? "bg-[var(--bg-hover)]" : "hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)]"
                            }`}
                          >
                            <ResultIcon className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.result.title}</p>
                              {item.result.subtitle && (
                                <p className="text-xs text-[var(--text-muted)] truncate">{item.result.subtitle}</p>
                              )}
                            </div>
                          </Link>
                          );
                        })()}
                        {item.kind === "nav" && (
                          <Link
                            href={item.href}
                            data-index={i}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 text-left transition-[var(--transition)] cursor-pointer ${
                              isSelected ? "bg-[var(--bg-hover)]" : "hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)]"
                            }`}
                          >
                            <kbd className="w-12 text-[10px] text-[var(--text-muted)] font-mono">{item.keys}</kbd>
                            <span className="text-sm">{item.label}</span>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="border-t border-[var(--border)] px-3 py-2 mt-1">
                <p className="text-[10px] text-[var(--text-muted)]">
                  ↑↓ Navigate · Enter Select · Esc Close
                  {selectedItem?.kind === "result" && " · ⌘L Copy link"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
