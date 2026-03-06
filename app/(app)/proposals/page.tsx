"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProposals } from "@/lib/queries/proposals";
import { getClients } from "@/lib/queries/clients";
import type { ProposalRow } from "@/lib/queries/proposals";
import { FileSignature, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

type ProposalWithClient = ProposalRow & { clients?: { name: string } | null };

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<ProposalWithClient[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const [pRes, cRes] = await Promise.all([
        getProposals(),
        getClients(),
      ]);
      setProposals((pRes.data ?? []) as ProposalWithClient[]);
      setClients(cRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = proposals.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (clientFilter !== "all" && p.client_id !== clientFilter) return false;
    if (search.trim()) {
      const term = search.toLowerCase().trim();
      const title = p.title?.toLowerCase() ?? "";
      const clientName = (p.clients as { name?: string } | null)?.name?.toLowerCase() ?? "";
      if (!title.includes(term) && !clientName.includes(term)) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <main className="p-6">
        <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <FileSignature className="w-7 h-7 shrink-0 text-[var(--accent-green)]" />
          Proposals
        </h1>
        <Link href="/proposals/new">
          <Button>
            <Plus className="w-4 h-4 shrink-0" />
            New proposal
          </Button>
        </Link>
      </div>
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <Input
          placeholder="Search by title or client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="bg-[var(--bg-base)] border border-[var(--border)] rounded px-3 py-1.5 text-sm"
        >
          <option value="all">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {["all", "draft", "sent", "agreed", "declined"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-sm rounded border ${
              statusFilter === s ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)]"
            }`}
          >
            {s === "all" ? "All" : s.replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title={proposals.length === 0 ? "No proposals yet" : "No results for this filter"}
          description={
            proposals.length === 0
              ? "Create a proposal to send to a client before starting a project."
              : "Try changing filters or search."
          }
          icon={FileSignature}
          action={
            proposals.length === 0 ? (
              <Link href="/proposals/new">
                <Button>New proposal</Button>
              </Link>
            ) : (
              <Button variant="secondary" onClick={() => { setStatusFilter("all"); setClientFilter("all"); setSearch(""); }}>
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((p) => (
            <li key={p.id}>
              <Link
                href={`/proposals/${p.id}`}
                className="block border border-[var(--border)] rounded-lg p-4 hover:border-[var(--border-active)] transition-[var(--transition)]"
                data-context-menu="proposal"
                data-context-id={p.id}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.title}</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {(p.clients as { name?: string } | null)?.name ?? "No client"} · {formatDate(p.updated_at)}
                    </p>
                  </div>
                  <Badge variant={p.status === "agreed" ? "success" : p.status === "declined" ? "danger" : "default"}>
                    {p.status.replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
