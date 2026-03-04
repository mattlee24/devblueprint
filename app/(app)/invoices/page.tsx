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
      <main className="p-6">
        <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <FileText className="w-7 h-7 shrink-0 text-[var(--accent-green)]" />
          Invoices
        </h1>
        <Link href="/invoices/new">
          <Button>
            <Plus className="w-4 h-4 shrink-0" />
            New invoice
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="border border-[var(--border)] rounded-lg p-4 flex items-center gap-3">
          <Receipt className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
          <div>
            <p className="text-xs text-[var(--text-muted)]">Total Invoiced</p>
            <p className="text-xl font-semibold">{formatCurrency(totalInvoiced)}</p>
          </div>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 text-[var(--accent-green)]" />
          <div>
            <p className="text-xs text-[var(--text-muted)]">Paid</p>
            <p className="text-xl font-semibold text-[var(--accent-green)]">{formatCurrency(paid)}</p>
          </div>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
          <div>
            <p className="text-xs text-[var(--text-muted)]">Outstanding</p>
            <p className="text-xl font-semibold">{formatCurrency(outstanding)}</p>
          </div>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-[var(--accent-red)]" />
          <div>
            <p className="text-xs text-[var(--text-muted)]">Overdue</p>
            <p className="text-xl font-semibold text-[var(--accent-red)]">{overdue}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb-4 items-center">
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
            className={`px-3 py-1.5 text-sm rounded border ${
              statusFilter === s ? "border-[var(--accent-green)] text-[var(--accent-green)]" : "border-[var(--border)]"
            }`}
          >
            [{s.toUpperCase()}]
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
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-2">INVOICE #</th>
            <th className="text-left py-2">CLIENT</th>
            <th className="text-left py-2">ISSUED</th>
            <th className="text-left py-2">DUE</th>
            <th className="text-right py-2">AMOUNT</th>
            <th className="text-left py-2">STATUS</th>
            <th className="text-right py-2">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((inv) => (
            <tr
              key={inv.id}
              className="border-b border-[var(--border)]"
              data-context-menu="invoice"
              data-context-id={inv.id}
            >
              <td className="py-2">{inv.invoice_number}</td>
              <td className="py-2">{(inv as unknown as { clients?: { name: string } })?.clients?.name ?? "—"}</td>
              <td className="py-2">{formatDate(inv.issue_date)}</td>
              <td className="py-2">{inv.due_date ? formatDate(inv.due_date) : "—"}</td>
              <td className="text-right py-2">{formatCurrency(inv.total, inv.currency)}</td>
              <td className="py-2">
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
                  [{inv.status.toUpperCase()}]
                </Badge>
              </td>
              <td className="text-right py-2">
                <Link
                  href={`/invoices/${inv.id}`}
                  className="inline-flex items-center gap-2 text-[var(--accent)] hover:underline text-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </main>
  );
}
