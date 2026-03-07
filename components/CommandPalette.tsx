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
  LayoutDashboard,
  BarChart3,
  Settings,
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
  | { kind: "nav"; label: string; href: string; keys: string; icon: React.ComponentType<{ className?: string }> };

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

const NAV_ITEMS: { keys: string; label: string; href: string; keywords: string[]; icon: React.ComponentType<{ className?: string }> }[] = [
  { keys: "G D", label: "Dashboard", href: "/dashboard", keywords: ["dashboard", "home"], icon: LayoutDashboard },
  { keys: "G P", label: "Projects", href: "/projects", keywords: ["projects", "list"], icon: FolderKanban },
  { keys: "G C", label: "Clients", href: "/clients", keywords: ["clients", "customers"], icon: Users },
  { keys: "G O", label: "Proposals", href: "/proposals", keywords: ["proposals", "onboarding"], icon: FileSignature },
  { keys: "G T", label: "Time Logs", href: "/time-logs", keywords: ["time", "logs", "hours"], icon: Clock },
  { keys: "G I", label: "Invoices", href: "/invoices", keywords: ["invoices", "billing"], icon: FileText },
  { keys: "G R", label: "Reports", href: "/reports", keywords: ["reports", "analytics"], icon: BarChart3 },
  { keys: "G S", label: "Settings", href: "/settings", keywords: ["settings", "preferences"], icon: Settings },
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
      (n) => ({ kind: "nav" as const, label: n.label, href: n.href, keys: n.keys, icon: n.icon })
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
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title=""
      overlayClassName="bg-black/40 backdrop-blur-sm"
      contentClassName="max-w-lg w-full p-0 overflow-hidden rounded-2xl shadow-2xl border border-neutral-200 bg-white"
    >
      <div className="w-full flex flex-col">
        {/* Search bar: borderless on white */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-100">
          <Search className="w-5 h-5 shrink-0 text-neutral-400" aria-hidden />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search or run a command..."
            className="flex-1 bg-transparent border-none outline-none text-base text-neutral-900 placeholder:text-neutral-400 min-w-0"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex font-mono text-xs bg-neutral-100 border border-neutral-200 rounded px-1.5 py-0.5 text-neutral-500">
            Esc
          </kbd>
        </div>
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto flex-1 min-h-0">
          {loading ? (
            <p className="py-6 text-center text-sm text-neutral-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="py-6 px-4 text-sm text-neutral-500">
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
                const rowClass = `flex items-center gap-3 py-2.5 rounded-lg mx-1 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-teal-50 border-l-2 border-teal-500 pl-[calc(1rem-2px)] pr-4"
                    : "px-4 hover:bg-neutral-50"
                }`;
                const iconTileClass = "w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center shrink-0";

                return (
                  <div key={i}>
                    {i === 0 && item.kind === "action" && (
                      <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                        Quick actions
                      </p>
                    )}
                    {i === firstResultIdx && resultCount > 0 && (
                      <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400 border-t border-neutral-100 mt-1">
                        Search results
                      </p>
                    )}
                    {i === firstNavIdx && (
                      <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400 border-t border-neutral-100 mt-1">
                        Go to
                      </p>
                    )}
                    {item.kind === "action" &&
                      (item.href ? (
                        <Link
                          href={item.href}
                          data-index={i}
                          onClick={() => setOpen(false)}
                          className={rowClass}
                        >
                          <span className={iconTileClass}>
                            <item.icon className="w-4 h-4 text-neutral-600" />
                          </span>
                          <span className="text-sm font-medium text-neutral-900">{item.label}</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          data-index={i}
                          onClick={() => item.onSelect?.()}
                          className={`${rowClass} w-full text-left`}
                        >
                          <span className={iconTileClass}>
                            <item.icon className="w-4 h-4 text-neutral-600" />
                          </span>
                          <span className="text-sm font-medium text-neutral-900">{item.label}</span>
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
                          className={rowClass}
                        >
                          <span className={iconTileClass}>
                            <ResultIcon className="w-4 h-4 text-neutral-500" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">{item.result.title}</p>
                            {item.result.subtitle && (
                              <p className="text-xs text-neutral-500 truncate">{item.result.subtitle}</p>
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
                        className={rowClass}
                      >
                        <span className={iconTileClass}>
                          <item.icon className="w-4 h-4 text-neutral-500" />
                        </span>
                        <span className="text-sm font-medium text-neutral-900 flex-1">{item.label}</span>
                        <span className="flex items-center gap-1 ml-auto">
                          {item.keys.split(" ").map((k) => (
                            <kbd
                              key={k}
                              className="font-mono text-xs bg-neutral-100 border border-neutral-200 rounded px-1.5 py-0.5 text-neutral-600"
                            >
                              {k}
                            </kbd>
                          ))}
                        </span>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="border-t border-neutral-100 px-4 py-2 flex-shrink-0">
          <p className="text-xs text-neutral-400">
            ↑↓ navigate · ↵ select · Esc close
            {selectedItem?.kind === "result" && " · ⌘L Copy link"}
          </p>
        </div>
      </div>
    </Modal>
  );
}
