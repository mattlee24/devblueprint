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
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
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
      <PageContainer>
        <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Proposals"
        description="Create and manage proposals for your clients."
        icon={FileSignature}
        action={
          <Link href="/proposals/new">
            <Button className="cursor-pointer">
              <Plus className="w-4 h-4 shrink-0" />
              New proposal
            </Button>
          </Link>
        }
      />
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Input
          placeholder="Search by title or client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          options={[
            { value: "all", label: "All clients" },
            ...clients.map((c) => ({ value: c.id, label: c.name })),
          ]}
          className="min-w-[180px]"
        />
        {["all", "draft", "sent", "agreed", "declined"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-2 text-sm rounded-[var(--radius-md)] border transition-[var(--transition)] ${
              statusFilter === s
                ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-active)]"
            }`}
          >
            {s === "all" ? "All" : s.replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="mt-6">
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/proposals/${p.id}`}
              className="block group"
              data-context-menu="proposal"
              data-context-id={p.id}
            >
              <Card hover className="h-full">
                <div className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <span className="w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center bg-[var(--accent-purple)]/15 text-[var(--accent-purple)] shrink-0">
                  <FileSignature className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {p.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                    {(p.clients as { name?: string } | null)?.name ?? "No client"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Badge variant={p.status === "agreed" ? "success" : p.status === "declined" ? "danger" : "default"}>
                  {p.status.replace(/\b\w/g, (c) => c.toUpperCase())}
                </Badge>
                <span className="text-xs text-[var(--text-muted)]">{formatDate(p.updated_at)}</span>
              </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
