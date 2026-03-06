"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getTimeLogs } from "@/lib/queries/timeLogs";
import { getClients } from "@/lib/queries/clients";
import { getProjects } from "@/lib/queries/projects";
import { createTimeLog, deleteTimeLog, updateTimeLog } from "@/lib/queries/timeLogs";
import type { TimeLogRow } from "@/lib/queries/timeLogs";
import type { ClientRow } from "@/lib/queries/clients";
import type { ProjectRow } from "@/lib/queries/projects";
import { Clock, Plus, Trash2, Pencil } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { TimeLogForm, type TimeLogFormData } from "@/components/timeLogs/TimeLogForm";
import { formatDate, formatHoursShort, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

function TimeLogsContent() {
  const searchParams = useSearchParams();
  const projectIdFromUrl = searchParams.get("projectId") ?? "";
  const [logs, setLogs] = useState<TimeLogRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<TimeLogRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientFilter, setClientFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState(projectIdFromUrl);
  const [billableFilter, setBillableFilter] = useState<"all" | "billable" | "non">("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (projectIdFromUrl) setProjectFilter(projectIdFromUrl);
  }, [projectIdFromUrl]);

  useEffect(() => {
    async function load() {
      const [lRes, cRes, pRes] = await Promise.all([
        getTimeLogs({
          from: dateFrom || undefined,
          to: dateTo || undefined,
        }),
        getClients(),
        getProjects(),
      ]);
      setLogs(lRes.data ?? []);
      setClients(cRes.data ?? []);
      setProjects(pRes.data ?? []);
      setLoading(false);
    }
    load();
  }, [dateFrom, dateTo]);

  const filtered = logs.filter((l) => {
    if (clientFilter && l.client_id !== clientFilter) return false;
    if (projectFilter && l.project_id !== projectFilter) return false;
    if (billableFilter === "billable" && !l.billable) return false;
    if (billableFilter === "non" && l.billable) return false;
    if (search.trim() && !l.description.toLowerCase().includes(search.toLowerCase().trim())) return false;
    return true;
  });

  const totalHours = filtered.reduce((s, l) => s + l.hours, 0);
  const billableHours = filtered.filter((l) => l.billable).reduce((s, l) => s + l.hours, 0);
  const totalValue = filtered
    .filter((l) => l.billable && l.hourly_rate != null)
    .reduce((s, l) => s + l.hours * (l.hourly_rate ?? 0), 0);

  async function handleSubmit(data: TimeLogFormData) {
    if (data.id) {
      const res = await updateTimeLog(data.id, {
        client_id: data.client_id,
        project_id: data.project_id,
        description: data.description,
        hours: data.hours,
        billable: data.billable,
        hourly_rate: data.hourly_rate,
        currency: data.currency,
        logged_date: data.logged_date,
      });
      if (res.error) {
        toast.error(res.error.message ?? "Failed to update time log");
        return;
      }
      toast.success("Time log updated");
      const lRes = await getTimeLogs({ from: dateFrom || undefined, to: dateTo || undefined });
      setLogs(lRes.data ?? []);
      setDrawerOpen(false);
      setEditingLog(null);
      return;
    }
    const res = await createTimeLog({
      client_id: data.client_id,
      project_id: data.project_id,
      description: data.description,
      hours: data.hours,
      billable: data.billable,
      hourly_rate: data.hourly_rate,
      currency: data.currency,
      logged_date: data.logged_date,
    });
    if (res.error) {
      toast.error(res.error.message ?? "Failed to log time");
      return;
    }
    if (res.data) {
      toast.success("Time logged");
      const lRes = await getTimeLogs({ from: dateFrom || undefined, to: dateTo || undefined });
      setLogs(lRes.data ?? []);
      setDrawerOpen(false);
    }
  }

  async function handleDelete(id: string) {
    const { error } = await deleteTimeLog(id);
    if (error) {
      toast.error(error.message ?? "Failed to delete time log");
      return;
    }
    toast.success("Time log deleted");
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }

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
          <Clock className="w-7 h-7 shrink-0 text-[var(--accent-green)]" />
          Time Logs
        </h1>
        <Button onClick={() => setDrawerOpen(true)}>
          <Plus className="w-4 h-4 shrink-0" />
          Log time
        </Button>
      </div>
      <div className="flex gap-4 mb-6 flex-wrap items-center">
        <Input
          placeholder="Search description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="max-w-[140px]"
          title="From date"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="max-w-[140px]"
          title="To date"
        />
        <Select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          options={[
            { value: "", label: "All clients" },
            ...clients.map((c) => ({ value: c.id, label: c.name })),
          ]}
          className="min-w-[180px]"
        />
        <Select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          options={[
            { value: "", label: "All projects" },
            ...projects.map((p) => ({ value: p.id, label: p.title })),
          ]}
          className="min-w-[180px]"
        />
        {(["all", "billable", "non"] as const).map((x) => (
          <button
            key={x}
            type="button"
            onClick={() => setBillableFilter(x)}
            className={`px-3 py-1.5 text-sm rounded border ${
              billableFilter === x ? "border-[var(--accent-green)] text-[var(--accent-green)]" : "border-[var(--border)]"
            }`}
          >
            {x === "all" ? "All" : x === "billable" ? "Billable" : "Non-billable"}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title={logs.length === 0 ? "No time logs yet" : "No results for this filter"}
          description={
            logs.length === 0
              ? "Log time against a client and project to track billable hours."
              : "Try clearing search or changing filters."
          }
          icon={Clock}
          action={
            logs.length === 0 ? (
              <Button onClick={() => setDrawerOpen(true)}>
                <Plus className="w-4 h-4 shrink-0" />
                Log time
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setClientFilter("");
                  setProjectFilter("");
                  setBillableFilter("all");
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Clear filters
              </Button>
            )
          }
        />
      ) : (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-2">Date</th>
            <th className="text-left py-2">Client</th>
            <th className="text-left py-2">Project</th>
            <th className="text-left py-2">Description</th>
            <th className="text-right py-2">Hours</th>
            <th className="text-left py-2">Billable</th>
            <th className="text-right py-2">Amount</th>
            <th className="text-right py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((log) => (
            <tr key={log.id} className="border-b border-[var(--border)]">
              <td className="py-2">{formatDate(log.logged_date)}</td>
              <td className="py-2">{(log as unknown as { clients?: { name: string } })?.clients?.name ?? "—"}</td>
              <td className="py-2">{(log as unknown as { projects?: { title: string } })?.projects?.title ?? "—"}</td>
              <td className="py-2">{log.description}</td>
              <td className="text-right py-2">{formatHoursShort(log.hours)}</td>
              <td className="py-2">
                <Badge variant={log.billable ? "success" : "muted"}>
                  {log.billable ? "Billable" : "Non-billable"}
                </Badge>
              </td>
              <td className="text-right py-2">
                {log.billable && log.hourly_rate != null
                  ? formatCurrency(log.hours * log.hourly_rate, log.currency)
                  : "—"}
              </td>
              <td className="text-right py-2">
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLog(log);
                      setDrawerOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] text-xs"
                  >
                    <Pencil className="w-3.5 h-3.5 shrink-0" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(log.id)}
                    className="inline-flex items-center gap-1.5 text-[var(--accent-red)] hover:underline text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
      {filtered.length > 0 && (
      <div className="sticky bottom-0 mt-4 py-3 px-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded text-sm">
        Total: {formatHoursShort(totalHours)} · Billable: {formatHoursShort(billableHours)} · Non-billable: {formatHoursShort(totalHours - billableHours)} · Total value: {formatCurrency(totalValue, "GBP")}
      </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingLog(null);
        }}
        title={editingLog ? "Edit time log" : "Log Time"}
        width="lg"
      >
        <TimeLogForm
          clients={clients}
          projects={projects}
          initialValues={editingLog}
          onSubmit={handleSubmit}
          onCancel={() => {
            setDrawerOpen(false);
            setEditingLog(null);
          }}
        />
      </Drawer>
    </main>
  );
}

export default function TimeLogsPage() {
  return (
    <Suspense fallback={<main className="p-6"><div className="animate-pulse text-[var(--text-muted)]">Loading...</div></main>}>
      <TimeLogsContent />
    </Suspense>
  );
}
