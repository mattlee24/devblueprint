"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getInvoice, getInvoiceItems, updateInvoice, createInvoiceItem, updateInvoiceItem, deleteInvoiceItem, deleteInvoice } from "@/lib/queries/invoices";
import type { InvoiceRow, InvoiceItemRow } from "@/lib/queries/invoices";
import { getProfile } from "@/lib/queries/profiles";
import type { ProfileRow } from "@/lib/queries/profiles";
import { getTimeLogs, updateTimeLog } from "@/lib/queries/timeLogs";
import type { TimeLogRow } from "@/lib/queries/timeLogs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<InvoiceRow | null>(null);
  const [items, setItems] = useState<InvoiceItemRow[]>([]);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [timeLogsAvailable, setTimeLogsAvailable] = useState<TimeLogRow[]>([]);
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());
  const [addingLogs, setAddingLogs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const [iRes, itemsRes, profileRes] = await Promise.all([
        getInvoice(id),
        getInvoiceItems(id),
        getProfile(),
      ]);
      setInvoice(iRes.data ?? null);
      setItems(itemsRes.data ?? []);
      setProfile(profileRes.data ?? null);
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!invoice?.client_id) return;
    getTimeLogs({ clientId: invoice.client_id, billableOnly: true }).then((res) => {
      const uninvoiced = (res.data ?? []).filter((log) => !log.invoice_id);
      setTimeLogsAvailable(uninvoiced);
    });
  }, [invoice?.client_id]);

  async function updateStatus(status: string) {
    if (!invoice) return;
    const { error } = await updateInvoice(invoice.id, { status });
    if (error) {
      toast.error(error.message ?? "Failed to update status");
      return;
    }
    toast.success(`Status set to ${status}`);
    setInvoice((prev) => (prev ? { ...prev, status } : null));
  }

  async function addLine() {
    const res = await createInvoiceItem(id, {
      description: "New line item",
      quantity: 1,
      unit_price: 0,
      position: items.length,
    });
    if (res.error) {
      toast.error(res.error.message ?? "Failed to add line item");
      return;
    }
    if (res.data) {
      toast.success("Line item added");
      setItems((prev) => [...prev, res.data!]);
    }
  }

  async function updateItem(itemId: string, updates: Partial<InvoiceItemRow>) {
    await updateInvoiceItem(itemId, updates);
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...updates } : i)));
  }

  async function removeItem(itemId: string) {
    const { error } = await deleteInvoiceItem(itemId);
    if (error) {
      toast.error(error.message ?? "Failed to remove line item");
      return;
    }
    toast.success("Line item removed");
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  function toggleLogSelection(logId: string) {
    setSelectedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(logId)) next.delete(logId);
      else next.add(logId);
      return next;
    });
  }

  async function addSelectedLogsToInvoice() {
    if (!invoice || selectedLogIds.size === 0) return;
    setAddingLogs(true);
    let position = items.length;
    let added = 0;
    for (const logId of selectedLogIds) {
      const log = timeLogsAvailable.find((l) => l.id === logId);
      if (!log) continue;
      const res = await createInvoiceItem(invoice.id, {
        description: log.description,
        quantity: log.hours,
        unit_price: log.hourly_rate ?? 0,
        position,
      });
      if (res.data) {
        setItems((prev) => [...prev, res.data!]);
        await updateTimeLog(log.id, { invoice_id: invoice.id });
        setTimeLogsAvailable((prev) => prev.filter((l) => l.id !== log.id));
        position++;
        added++;
      }
    }
    setSelectedLogIds(new Set());
    setAddingLogs(false);
    if (added > 0) toast.success(`${added} time log(s) added to invoice`);
  }

  async function handleDeleteInvoice() {
    if (!invoice) return;
    setDeleteLoading(true);
    const { error } = await deleteInvoice(invoice.id);
    setDeleteLoading(false);
    if (error) {
      toast.error(error.message ?? "Failed to delete invoice");
      return;
    }
    toast.success("Invoice deleted");
    router.push("/invoices");
    router.refresh();
  }

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const taxRate = invoice?.tax_rate ?? 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  useEffect(() => {
    if (!invoice) return;
    updateInvoice(invoice.id, {
      subtotal,
      tax_amount: taxAmount,
      total,
    }).then(() => {});
  }, [invoice?.id, subtotal, taxAmount, total]);

  if (loading || !invoice) {
    return (
      <main className="p-6">
        <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
      </main>
    );
  }

  const client = (invoice as unknown as { clients?: Record<string, unknown> })?.clients;

  return (
    <main className="p-6 invoice-print-content">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Invoices", href: "/invoices" },
          { label: `Invoice ${invoice.invoice_number}` },
        ]}
        className="mb-4 no-print"
      />
      <div className="flex items-center justify-between mb-6 no-print">
        <h1 className="text-2xl font-semibold">Invoice {invoice.invoice_number}</h1>
        <Badge
          variant={
            invoice.status === "paid" ? "success" : invoice.status === "overdue" ? "danger" : "default"
          }
        >
          {invoice.status.replace(/\b\w/g, (c) => c.toUpperCase())}
        </Badge>
      </div>

      {/* Print layout: From (company) + Bill to (client) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="border border-[var(--border)] rounded-[var(--radius-card)] p-5 bg-[var(--bg-surface)] print:border print:border-gray-300 print:bg-white">
          <p className="text-xs font-medium text-[var(--text-muted)] mb-2 print:text-gray-500">From</p>
          {profile?.logo_path ? (
            <img src={profile.logo_path} alt="" className="h-10 object-contain mb-3 print:h-12" />
          ) : null}
          <p className="font-semibold text-[var(--text-primary)] print:text-black">{profile?.business_name ?? "Your Company"}</p>
          {profile?.business_address ? (
            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line mt-1 print:text-gray-700">{profile.business_address}</p>
          ) : null}
          {profile?.business_email ? <p className="text-sm mt-1 print:text-gray-700">{profile.business_email}</p> : null}
          {profile?.business_phone ? <p className="text-sm print:text-gray-700">{profile.business_phone}</p> : null}
          {profile?.tax_number ? <p className="text-sm mt-1 print:text-gray-600">VAT / Tax: {profile.tax_number}</p> : null}
        </div>
        <div className="border border-[var(--border)] rounded-[var(--radius-card)] p-5 bg-[var(--bg-surface)] print:border print:border-gray-300 print:bg-white">
          <p className="text-xs font-medium text-[var(--text-muted)] mb-2 print:text-gray-500">Bill to</p>
          <p className="font-semibold text-[var(--text-primary)] print:text-black">{client && "name" in client ? String(client.name) : "—"}</p>
          {client && "address" in client && client.address ? (
            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line mt-1 print:text-gray-700">{String(client.address)}</p>
          ) : null}
          {client && "email" in client && client.email ? (
            <p className="text-sm mt-1 print:text-gray-700">{String(client.email)}</p>
          ) : null}
        </div>
      </div>

      {/* Invoice meta */}
      <div className="flex flex-wrap gap-6 mb-6 text-sm">
        <div><span className="text-[var(--text-muted)] print:text-gray-500">Invoice number</span><span className="ml-2 font-medium print:text-black">{invoice.invoice_number}</span></div>
        <div><span className="text-[var(--text-muted)] print:text-gray-500">Issue date</span><span className="ml-2 font-medium print:text-black">{formatDate(invoice.issue_date)}</span></div>
        <div><span className="text-[var(--text-muted)] print:text-gray-500">Due date</span><span className="ml-2 font-medium print:text-black">{invoice.due_date ? formatDate(invoice.due_date) : "—"}</span></div>
        <div><span className="text-[var(--text-muted)] print:text-gray-500">Status</span><span className="ml-2 font-medium print:text-black">{invoice.status.replace(/\b\w/g, (c) => c.toUpperCase())}</span></div>
      </div>

      <div className="flex gap-2 mb-4 no-print">
        <Input
          label="Invoice #"
          value={invoice.invoice_number}
          onChange={async (e) => {
            const res = await updateInvoice(invoice.id, { invoice_number: e.target.value });
            if (res.data) setInvoice(res.data);
          }}
          className="max-w-[140px]"
        />
        <DatePicker
          label="Issue date"
          value={invoice.issue_date}
          onChange={async (value) => {
            const res = await updateInvoice(invoice.id, { issue_date: value });
            if (res.data) setInvoice(res.data);
          }}
          placeholder="Issue date"
        />
        <DatePicker
          label="Due date"
          value={invoice.due_date ?? ""}
          onChange={async (value) => {
            const res = await updateInvoice(invoice.id, { due_date: value || null });
            if (res.data) setInvoice(res.data);
          }}
          placeholder="Due date"
        />
      </div>

      {timeLogsAvailable.length > 0 && (
        <div className="mb-6 p-4 border border-[var(--border)] rounded-[var(--radius-card)] bg-[var(--bg-elevated)] no-print">
          <h2 className="text-sm font-medium mb-2">Add from time logs (billable, not yet on an invoice)</h2>
          <ul className="space-y-2 mb-3 max-h-48 overflow-y-auto">
            {timeLogsAvailable.map((log) => (
              <li key={log.id} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={selectedLogIds.has(log.id)}
                  onChange={() => toggleLogSelection(log.id)}
                  className="rounded border-[var(--border)]"
                />
                <span className="flex-1 truncate">{log.description}</span>
                <span className="text-[var(--text-muted)]">{log.hours}h</span>
                <span>{formatCurrency((log.hourly_rate ?? 0) * log.hours, log.currency)}</span>
              </li>
            ))}
          </ul>
          <Button
            variant="secondary"
            onClick={addSelectedLogsToInvoice}
            disabled={selectedLogIds.size === 0 || addingLogs}
          >
            {addingLogs ? "Adding…" : `Add ${selectedLogIds.size} selected to invoice`}
          </Button>
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2 no-print">
          <h2 className="text-sm font-medium">Line items</h2>
          <Button variant="secondary" onClick={addLine}>+ Add row</Button>
        </div>
        <table className="w-full text-sm invoice-line-items">
          <thead>
            <tr className="border-b-2 border-[var(--border)] print:border-gray-400">
              <th className="text-left py-3 font-semibold print:text-black">Description</th>
              <th className="text-right py-3 w-24 font-semibold print:text-black">Qty</th>
              <th className="text-right py-3 w-28 font-semibold print:text-black">Unit price</th>
              <th className="text-right py-3 w-28 font-semibold print:text-black">Total</th>
              <th className="w-10 no-print" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--border)]">
                <td className="py-2">
                  <input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    className="w-full px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-sm"
                  />
                </td>
                <td className="text-right py-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-sm text-right"
                  />
                </td>
                <td className="text-right py-2">
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-sm text-right"
                  />
                </td>
                <td className="text-right py-2">
                  {formatCurrency(item.quantity * item.unit_price, invoice.currency)}
                </td>
                <td className="py-2 no-print">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-[var(--accent-red)] text-xs hover:underline"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="max-w-xs ml-auto space-y-2 text-sm border border-[var(--border)] rounded-[var(--radius-card)] p-4 print:border-gray-300">
        <div className="flex justify-between">
          <span className="text-[var(--text-muted)] print:text-gray-600">Subtotal</span>
          <span className="print:text-black">{formatCurrency(subtotal, invoice.currency)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--text-muted)] print:text-gray-600">Tax (%)</span>
          <input
            type="number"
            value={invoice.tax_rate}
            onChange={async (e) => {
              const res = await updateInvoice(invoice.id, { tax_rate: parseFloat(e.target.value) || 0 });
              if (res.data) setInvoice(res.data);
            }}
            className="w-16 px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-right no-print"
          />
          <span className="print-only print:text-black">{invoice.tax_rate}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-muted)] print:text-gray-600">Tax amount</span>
          <span className="print:text-black">{formatCurrency(taxAmount, invoice.currency)}</span>
        </div>
        <div className="flex justify-between font-semibold pt-2 border-t border-[var(--border)] print:border-gray-300 print:text-black">
          <span>Total</span>
          <span>{formatCurrency(total, invoice.currency)}</span>
        </div>
      </div>

      <p className="text-sm text-[var(--text-muted)] mt-8 print:text-gray-600 print:mt-12">Thank you for your business.</p>

      <div className="flex gap-2 mt-8 flex-wrap no-print">
        <Button onClick={() => updateStatus("sent")}>Mark as sent</Button>
        <Button variant="secondary" onClick={() => updateStatus("paid")}>Mark as paid</Button>
        <Button variant="secondary" onClick={() => updateStatus("overdue")}>Mark as overdue</Button>
        <Button variant="ghost" onClick={() => window.print()} className="no-print">Download PDF</Button>
        {client && "email" in client && client.email ? (
          <a
            href={`mailto:${client.email}?subject=Invoice ${invoice.invoice_number}&body=Please find your invoice attached.`}
            className="no-print"
          >
            <Button variant="ghost">Send to client</Button>
          </a>
        ) : null}
        <Button variant="danger" onClick={() => setDeleteConfirmOpen(true)} className="no-print ml-auto">
          Delete invoice
        </Button>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteInvoice}
        title="Delete invoice"
        message={`Delete invoice ${invoice.invoice_number}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </main>
  );
}
