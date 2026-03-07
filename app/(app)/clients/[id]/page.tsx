"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getClient, deleteClient } from "@/lib/queries/clients";
import { getProjects } from "@/lib/queries/projects";
import { getProposals } from "@/lib/queries/proposals";
import { getTimeLogs } from "@/lib/queries/timeLogs";
import { getInvoices } from "@/lib/queries/invoices";
import type { ClientRow } from "@/lib/queries/clients";
import type { ProjectRow } from "@/lib/queries/projects";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { formatDate, formatHoursShort, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { Trash2, FolderKanban, Clock, Banknote, AlertCircle } from "lucide-react";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [client, setClient] = useState<ClientRow | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [proposals, setProposals] = useState<Awaited<ReturnType<typeof getProposals>>["data"]>([]);
  const [timeLogs, setTimeLogs] = useState<Awaited<ReturnType<typeof getTimeLogs>>["data"]>([]);
  const [invoices, setInvoices] = useState<Awaited<ReturnType<typeof getInvoices>>["data"]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const [cRes, pRes, oRes, tRes, iRes] = await Promise.all([
        getClient(id),
        getProjects(),
        getProposals({ clientId: id }),
        getTimeLogs({ clientId: id }),
        getInvoices({ clientId: id }),
      ]);
      setClient(cRes.data ?? null);
      setProjects((pRes.data ?? []).filter((p) => p.client_id === id));
      setProposals(oRes.data ?? []);
      setTimeLogs(tRes.data ?? []);
      setInvoices(iRes.data ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading || !client) {
    return (
      <main>
        <PageContainer>
          <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
        </PageContainer>
      </main>
    );
  }

  const totalHours = (timeLogs ?? []).reduce((s, l) => s + l.hours, 0);
  const totalBilled = (invoices ?? []).filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const outstanding = (invoices ?? []).filter((i) => i.status !== "paid" && i.status !== "cancelled").reduce((s, i) => s + i.total, 0);

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Projects" value={projects.length} icon={FolderKanban} />
            <StatCard label="Total Hours" value={formatHoursShort(totalHours)} icon={Clock} />
            <StatCard label="Total Billed" value={formatCurrency(totalBilled, client.currency)} icon={Banknote} />
            <StatCard label="Outstanding" value={formatCurrency(outstanding, client.currency)} icon={AlertCircle} />
          </div>
          <h3 className="text-sm font-medium">Recent activity</h3>
          <ul className="space-y-2">
            {(timeLogs ?? []).slice(0, 10).map((log) => (
              <li key={log.id} className="flex justify-between text-sm border-b border-[var(--border)] py-2 hover:bg-neutral-50 transition-colors duration-100 -mx-2 px-2 rounded">
                <span>{formatDate(log.logged_date)} · {(log as unknown as { projects?: { title: string } })?.projects?.title ?? "—"}</span>
                <span>{log.description} · {formatHoursShort(log.hours)}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      id: "proposals",
      label: "Proposals",
      content: (
        <div className="space-y-2">
          {(proposals ?? []).map((pr) => (
            <Link
              key={pr.id}
              href={`/proposals/${pr.id}`}
              className="block border border-[var(--border)] rounded p-3 hover:border-[var(--border-active)]"
            >
              {pr.title} · {pr.status.replace(/\b\w/g, (c) => c.toUpperCase())}
            </Link>
          ))}
          <Link href={`/proposals/new?client=${id}`}>
            <Button variant="secondary">New proposal</Button>
          </Link>
        </div>
      ),
    },
    {
      id: "projects",
      label: "Projects",
      content: (
        <div className="space-y-2">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="block border border-[var(--border)] rounded p-3 hover:border-[var(--border-active)]"
            >
              {p.title} · {p.status.replace(/\b\w/g, (c) => c.toUpperCase())}
            </Link>
          ))}
          <Link href="/projects/new">
            <Button variant="secondary">New project</Button>
          </Link>
        </div>
      ),
    },
    {
      id: "timelogs",
      label: "Time Logs",
      content: (
        <table className="app-table w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Project</th>
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Hours</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(timeLogs ?? []).map((log) => (
              <tr key={log.id} className="border-b border-[var(--border)]">
                <td className="py-2">{log.logged_date}</td>
                <td className="py-2">{(log as unknown as { projects?: { title: string } })?.projects?.title ?? "—"}</td>
                <td className="py-2">{log.description}</td>
                <td className="text-right py-2">{log.hours}</td>
                <td className="text-right py-2">
                  {log.billable && log.hourly_rate != null
                    ? formatCurrency(log.hours * log.hourly_rate, log.currency)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
    {
      id: "invoices",
      label: "Invoices",
      content: (
        <div className="space-y-2">
          {(invoices ?? []).map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between border border-[var(--border)] rounded p-3"
            >
              <span>{inv.invoice_number}</span>
              <span>{formatDate(inv.issue_date)}</span>
              <span>{formatCurrency(inv.total, inv.currency)}</span>
              <Badge variant={inv.status === "paid" ? "success" : inv.status === "overdue" ? "danger" : "default"}>
                {inv.status.replace(/\b\w/g, (c) => c.toUpperCase())}
              </Badge>
              <Link href={`/invoices/${inv.id}`}>
                <Button variant="ghost">View</Button>
              </Link>
            </div>
          ))}
          <Link href={`/invoices/new?client=${id}`}>
            <Button variant="secondary">New invoice</Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <main>
      <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Clients", href: "/clients" },
          { label: client.name },
        ]}
        className="mb-4"
      />
      <header className="flex items-start gap-4 border-b border-[var(--border)] pb-6 mb-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-medium shrink-0"
          style={{ backgroundColor: client.avatar_colour ?? "var(--bg-elevated)" }}
        >
          {client.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          {client.company && <p className="text-[var(--text-secondary)]">{client.company}</p>}
          <Badge variant="default" className="mt-2">{client.status.replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            {client.email ?? "—"} · {client.phone ?? "—"} · {client.website ?? "—"}
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {projects.length} projects · {formatHoursShort(totalHours)} total hours · {formatCurrency(totalBilled, client.currency)} billed · {formatCurrency(outstanding, client.currency)} outstanding
          </p>
          <div className="flex gap-2 mt-4">
            <Link href={`/time-logs?client=${id}`}>
              <Button variant="secondary">Log time</Button>
            </Link>
            <Link href={`/invoices/new?client=${id}`}>
              <Button variant="secondary">New invoice</Button>
            </Link>
            <Link href={`/clients/${id}/edit`}>
              <Button variant="ghost">Edit</Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => setDeleteOpen(true)}
              className="text-[var(--accent-red)] hover:text-[var(--accent-red)]"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              Delete client
            </Button>
          </div>
        </div>
      </header>
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          setDeleteLoading(true);
          const { error } = await deleteClient(id);
          setDeleteLoading(false);
          if (error) {
            toast.error(error.message ?? "Failed to delete client");
            return;
          }
          toast.success("Client deleted");
          router.push("/clients");
          router.refresh();
        }}
        title="Delete client"
        message={`Delete "${client.name}"? This cannot be undone. Projects and time logs may be affected.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
      />
      <Tabs tabs={tabs} defaultTab="overview" />
      </PageContainer>
    </main>
  );
}
