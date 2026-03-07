"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getInvoices } from "@/lib/queries/invoices";
import type { InvoiceRow } from "@/lib/queries/invoices";
import { FileText, Plus, Receipt, CheckCircle, AlertCircle, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableCard } from "@/components/ui/TableCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getInvoices().then((res) => {
      setInvoices(res.data ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = invoices.filter((i) => {
    if (statusFilter !== "all" && i.status !== statusFilter) return false;
    if (search.trim()) {
      const term = search.toLowerCase().trim();
      const num = (i as InvoiceRow & { clients?: { name: string } }).invoice_number?.toLowerCase() ?? "";
      const clientName = (i as InvoiceRow & { clients?: { name: string } }).clients?.name?.toLowerCase() ?? "";
      if (!num.includes(term) && !clientName.includes(term)) return false;
    }
    return true;
  });

  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const outstanding = invoices
    .filter((i) => i.status !== "paid" && i.status !== "cancelled")
    .reduce((s, i) => s + i.total, 0);
  const overdue = invoices.filter((i) => i.status === "overdue").length;

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
        title="Invoices"
        description="Create and track invoices for your clients."
        icon={FileText}
        action={
          <Link href="/invoices/new">
            <Button className="cursor-pointer">
              <Plus className="w-4 h-4 shrink-0" />
              New invoice
            </Button>
          </Link>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Invoiced" value={formatCurrency(totalInvoiced)} icon={Receipt} />
        <StatCard label="Paid" value={formatCurrency(paid)} icon={CheckCircle} valueClassName="text-[var(--accent-green)]" />
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} icon={Clock} />
        <StatCard label="Overdue" value={overdue} icon={AlertCircle} valueClassName={overdue > 0 ? "text-red-500" : ""} />
      </div>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Input
          placeholder="Search by invoice # or client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        {["all", "draft", "sent", "paid", "overdue", "cancelled"].map((s) => (
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
        <EmptyState
          title={invoices.length === 0 ? "No invoices yet" : "No results for this filter"}
          description={
            invoices.length === 0
              ? "Create a draft invoice for a client to get started."
              : "Try clearing search or changing the status filter."
          }
          icon={FileText}
          action={
            invoices.length === 0 ? (
              <Link href="/invoices/new">
                <Button>
                  <Plus className="w-4 h-4 shrink-0" />
                  New invoice
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
      ) : (
        <TableCard>
          <table className="app-table w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Invoice #</th>
                <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Client</th>
                <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Issued</th>
                <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Due</th>
                <th className="text-right py-3 px-4 font-medium text-[var(--text-secondary)]">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Status</th>
                <th className="text-right py-3 px-4 font-medium text-[var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-[var(--transition)]"
                  data-context-menu="invoice"
                  data-context-id={inv.id}
                >
                  <td className="py-3 px-4">{inv.invoice_number}</td>
                  <td className="py-3 px-4">{(inv as unknown as { clients?: { name: string } })?.clients?.name ?? "—"}</td>
                  <td className="py-3 px-4">{formatDate(inv.issue_date)}</td>
                  <td className="py-3 px-4">{inv.due_date ? formatDate(inv.due_date) : "—"}</td>
                  <td className="text-right py-3 px-4">{formatCurrency(inv.total, inv.currency)}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        inv.status === "paid"
                          ? "success"
                          : inv.status === "overdue"
                            ? "danger"
                            : inv.status === "sent"
                              ? "default"
                              : "muted"
                      }
                    >
                      {inv.status.replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                  </td>
                  <td className="text-right py-3 px-4">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="inline-flex items-center gap-2 text-[var(--accent)] hover:underline text-sm cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      )}
    </PageContainer>
  );
}
