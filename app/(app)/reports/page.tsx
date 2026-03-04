"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTimeLogs } from "@/lib/queries/timeLogs";
import { getInvoices } from "@/lib/queries/invoices";
import { getClients } from "@/lib/queries/clients";
import type { TimeLogRow } from "@/lib/queries/timeLogs";
import type { InvoiceRow } from "@/lib/queries/invoices";
import type { ClientRow } from "@/lib/queries/clients";
import { BarChart3, Clock, Banknote } from "lucide-react";
import { TerminalSectionHeader } from "@/components/ui/Terminal";
import { formatDate, formatHoursShort, formatCurrency } from "@/lib/utils";
import { Select } from "@/components/ui/Select";

type DateRangeKey = "this_month" | "last_month" | "custom";
const NOW = new Date();
const THIS_MONTH_START = new Date(NOW.getFullYear(), NOW.getMonth(), 1).toISOString().slice(0, 10);
const THIS_MONTH_END = new Date(NOW.getFullYear(), NOW.getMonth() + 1, 0).toISOString().slice(0, 10);
const LAST_MONTH_START = new Date(NOW.getFullYear(), NOW.getMonth() - 1, 1).toISOString().slice(0, 10);
const LAST_MONTH_END = new Date(NOW.getFullYear(), NOW.getMonth(), 0).toISOString().slice(0, 10);

export default function ReportsPage() {
  const [timeLogs, setTimeLogs] = useState<TimeLogRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRangeKey>("this_month");
  const [customFrom, setCustomFrom] = useState(THIS_MONTH_START);
  const [customTo, setCustomTo] = useState(THIS_MONTH_END);

  const from = dateRange === "this_month" ? THIS_MONTH_START : dateRange === "last_month" ? LAST_MONTH_START : customFrom;
  const to = dateRange === "this_month" ? THIS_MONTH_END : dateRange === "last_month" ? LAST_MONTH_END : customTo;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [tRes, iRes, cRes] = await Promise.all([
        getTimeLogs({ from, to }),
        getInvoices(),
        getClients(),
      ]);
      setTimeLogs(tRes.data ?? []);
      setInvoices(iRes.data ?? []);
      setClients(cRes.data ?? []);
      setLoading(false);
    }
    load();
  }, [from, to]);

  const timeByClient = timeLogs.reduce<Record<string, { hours: number; value: number }>>((acc, log) => {
    const key = log.client_id ?? "_none_";
    if (!acc[key]) acc[key] = { hours: 0, value: 0 };
    acc[key].hours += log.hours;
    if (log.billable && log.hourly_rate != null) acc[key].value += log.hours * log.hourly_rate;
    return acc;
  }, {});

  const clientNames: Record<string, string> = {};
  clients.forEach((c) => { clientNames[c.id] = c.name; });
  clientNames["_none_"] = "— No client";

  const invoicesInRange = invoices.filter((inv) => {
    const d = inv.issue_date?.slice(0, 10) ?? inv.created_at?.slice(0, 10);
    return d >= from && d <= to;
  });
  const paidInRange = invoicesInRange.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const outstandingInRange = invoicesInRange.filter((i) => i.status !== "paid" && i.status !== "cancelled").reduce((s, i) => s + i.total, 0);
  const totalHoursInRange = timeLogs.reduce((s, l) => s + l.hours, 0);
  const billableValueInRange = timeLogs.filter((l) => l.billable && l.hourly_rate != null).reduce((s, l) => s + l.hours * (l.hourly_rate ?? 0), 0);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <BarChart3 className="w-7 h-7 shrink-0 text-[var(--accent-green)]" />
        Reports
      </h1>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as DateRangeKey)}
          options={[
            { value: "this_month", label: "This month" },
            { value: "last_month", label: "Last month" },
            { value: "custom", label: "Custom range" },
          ]}
          className="min-w-[160px]"
        />
        {dateRange === "custom" && (
          <>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-base)] text-sm"
            />
            <span className="text-[var(--text-muted)]">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-base)] text-sm"
            />
          </>
        )}
      </div>

      {loading ? (
        <p className="text-[var(--text-muted)] animate-pulse">Loading...</p>
      ) : (
        <div className="space-y-8">
          <section className="border border-[var(--border)] rounded-[var(--radius-card)] p-4 bg-[var(--bg-surface)]">
            <TerminalSectionHeader>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                TIME REPORT — {formatDate(from)} to {formatDate(to)}
              </span>
            </TerminalSectionHeader>
            <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
              <div className="border border-[var(--border)] rounded p-3">
                <p className="text-xs text-[var(--text-muted)]">Total hours</p>
                <p className="text-xl font-semibold">{formatHoursShort(totalHoursInRange)}</p>
              </div>
              <div className="border border-[var(--border)] rounded p-3">
                <p className="text-xs text-[var(--text-muted)]">Billable value</p>
                <p className="text-xl font-semibold">{formatCurrency(billableValueInRange, "GBP")}</p>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2">CLIENT</th>
                  <th className="text-right py-2">HOURS</th>
                  <th className="text-right py-2">VALUE</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(timeByClient)
                  .sort(([, a], [, b]) => b.hours - a.hours)
                  .map(([clientId, { hours, value }]) => (
                    <tr key={clientId} className="border-b border-[var(--border)]">
                      <td className="py-2">
                        {clientId === "_none_" ? (
                          "—"
                        ) : (
                          <Link href={`/clients/${clientId}`} className="text-[var(--accent-blue)] hover:underline">
                            {clientNames[clientId] ?? clientId}
                          </Link>
                        )}
                      </td>
                      <td className="text-right py-2">{formatHoursShort(hours)}</td>
                      <td className="text-right py-2">{formatCurrency(value, "GBP")}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {Object.keys(timeByClient).length === 0 && (
              <p className="py-4 text-sm text-[var(--text-muted)]">No time logged in this period.</p>
            )}
          </section>

          <section className="border border-[var(--border)] rounded-[var(--radius-card)] p-4 bg-[var(--bg-surface)]">
            <TerminalSectionHeader>
              <span className="flex items-center gap-2">
                <Banknote className="w-4 h-4 shrink-0" />
                REVENUE SUMMARY — Invoices issued {formatDate(from)} to {formatDate(to)}
              </span>
            </TerminalSectionHeader>
            <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
              <div className="border border-[var(--border)] rounded p-3">
                <p className="text-xs text-[var(--text-muted)]">Paid (this period)</p>
                <p className="text-xl font-semibold text-[var(--accent-green)]">{formatCurrency(paidInRange, "GBP")}</p>
              </div>
              <div className="border border-[var(--border)] rounded p-3">
                <p className="text-xs text-[var(--text-muted)]">Outstanding</p>
                <p className="text-xl font-semibold">{formatCurrency(outstandingInRange, "GBP")}</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Invoices with issue date in the selected range. Paid = status paid; Outstanding = sent but not paid.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
