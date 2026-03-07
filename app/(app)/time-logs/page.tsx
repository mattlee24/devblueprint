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
import { DatePicker } from "@/components/ui/DatePicker";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableCard } from "@/components/ui/TableCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
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
      <PageContainer>
        <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Time Logs"
        description="Track and manage billable and non-billable time."
        icon={Clock}
        action={
          <Button onClick={() => setDrawerOpen(true)} className="cursor-pointer">
            <Plus className="w-4 h-4 shrink-0" />
            Log time
          </Button>
        }
      />
      <div className="flex gap-4 mb-6 flex-wrap items-center">
        <Input
          placeholder="Search description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <DatePicker
          value={dateFrom}
          onChange={setDateFrom}
          placeholder="From date"
          className="max-w-[160px]"
          aria-label="From date"
        />
        <DatePicker
          value={dateTo}
          onChange={setDateTo}
          placeholder="To date"
          className="max-w-[160px]"
          aria-label="To date"
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
            className={`px-3 py-2 text-sm rounded-[var(--radius-md)] border transition-[var(--transition)] ${
              billableFilter === x
                ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-active)]"
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
        <>
          <TableCard>
            <table className="app-table w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Project</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Description</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-secondary)]">Hours</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Billable</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-secondary)]">Amount</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-secondary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]">
                    <td className="py-3 px-4">{formatDate(log.logged_date)}</td>
                    <td className="py-3 px-4">{(log as unknown as { clients?: { name: string } })?.clients?.name ?? "—"}</td>
                    <td className="py-3 px-4">{(log as unknown as { projects?: { title: string } })?.projects?.title ?? "—"}</td>
                    <td className="py-3 px-4">{log.description}</td>
                    <td className="text-right py-3 px-4">{formatHoursShort(log.hours)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={log.billable ? "teal" : "muted"}>
                        {log.billable ? "Billable" : "Non-billable"}
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-4">
                      {log.billable && log.hourly_rate != null
                        ? formatCurrency(log.hours * log.hourly_rate, log.currency)
                        : "—"}
                    </td>
                    <td className="text-right py-3 px-4">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Edit time log"
                          onClick={() => {
                            setEditingLog(log);
                            setDrawerOpen(true);
                          }}
                          className="p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-neutral-100 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4 shrink-0" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete time log"
                          onClick={() => handleDelete(log.id)}
                          className="p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--accent-red)] hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
          <div className="mt-4 border-t border-[var(--border)] py-3 px-4 bg-neutral-50 rounded-b-xl text-sm font-semibold text-[var(--text-primary)]">
            Total: {formatHoursShort(totalHours)} · Billable: {formatHoursShort(billableHours)} · Non-billable: {formatHoursShort(totalHours - billableHours)} · Total value: {formatCurrency(totalValue, "GBP")}
          </div>
        </>
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
    </PageContainer>
  );
}

export default function TimeLogsPage() {
  return (
    <Suspense fallback={<PageContainer><div className="animate-pulse text-[var(--text-muted)]">Loading...</div></PageContainer>}>
      <TimeLogsContent />
    </Suspense>
  );
}
