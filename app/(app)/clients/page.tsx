"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getClients } from "@/lib/queries/clients";
import { getProjects } from "@/lib/queries/projects";
import { getTimeLogs } from "@/lib/queries/timeLogs";
import { getInvoices } from "@/lib/queries/invoices";
import type { ClientRow } from "@/lib/queries/clients";
import type { ProjectRow } from "@/lib/queries/projects";
import type { TimeLogRow } from "@/lib/queries/timeLogs";
import type { InvoiceRow } from "@/lib/queries/invoices";
import { Users, UserPlus } from "lucide-react";
import { ClientCard } from "@/components/clients/ClientCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLogRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    async function load() {
      const [cRes, pRes, tRes, iRes] = await Promise.all([
        getClients(),
        getProjects(),
        getTimeLogs(),
        getInvoices(),
      ]);
      setClients(cRes.data ?? []);
      setProjects(pRes.data ?? []);
      setTimeLogs(tRes.data ?? []);
      setInvoices(iRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const statsByClient = useMemo(() => {
    const map: Record<
      string,
      { projectCount: number; hoursLogged: number; amountBilled: number }
    > = {};
    for (const c of clients) {
      map[c.id] = { projectCount: 0, hoursLogged: 0, amountBilled: 0 };
    }
    for (const p of projects) {
      if (p.client_id && map[p.client_id]) map[p.client_id].projectCount += 1;
    }
    for (const t of timeLogs) {
      if (t.client_id && map[t.client_id]) {
        map[t.client_id].hoursLogged += t.hours;
      }
    }
    for (const i of invoices) {
      if (map[i.client_id]) {
        map[i.client_id].amountBilled += i.total;
      }
    }
    return map;
  }, [clients, projects, timeLogs, invoices]);

  const filtered = clients.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !(c.company ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === "active" && c.status !== "active") return false;
    if (statusFilter === "inactive" && c.status === "active") return false;
    return true;
  });

  if (loading) {
    return (
      <main className="p-6">
        <div className="animate-pulse text-[var(--text-muted)]">Loading…</div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Users className="w-7 h-7 shrink-0 text-[var(--accent-green)]" />
          Clients
        </h1>
        <Link href="/clients/new">
          <Button>
            <UserPlus className="w-4 h-4 shrink-0" />
            New client
          </Button>
        </Link>
      </div>
      <div className="flex gap-4 mb-6 flex-wrap">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        {(["all", "active", "inactive"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-sm rounded border transition-[var(--transition)] ${
              statusFilter === s
                ? "border-[var(--accent-green)] text-[var(--accent-green)]"
                : "border-[var(--border)] text-[var(--text-secondary)]"
            }`}
          >
            [{s.toUpperCase()}]
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              title={clients.length === 0 ? "No clients yet" : "No results for this filter"}
              description={
                clients.length === 0
                  ? "Add your first client to start tracking projects and invoices."
                  : "Try clearing search or changing the status filter."
              }
              icon={Users}
              action={
                clients.length === 0 ? (
                  <Link href="/clients/new">
                    <Button>
                      <UserPlus className="w-4 h-4 shrink-0" />
                      New client
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear filters
                  </Button>
                )
              }
            />
          </div>
        ) : (
        filtered.map((c) => {
          const stats = statsByClient[c.id] ?? {
            projectCount: 0,
            hoursLogged: 0,
            amountBilled: 0,
          };
          return (
            <ClientCard
              key={c.id}
              client={c}
              projectCount={stats.projectCount}
              hoursLogged={stats.hoursLogged}
              amountBilled={stats.amountBilled}
              currency={c.currency ?? "GBP"}
            />
          );
        })
        )}
      </div>
    </main>
  );
}
