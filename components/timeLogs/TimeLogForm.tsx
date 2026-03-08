"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Button } from "@/components/ui/Button";
import type { ClientRow } from "@/lib/queries/clients";
import type { ProjectRow } from "@/lib/queries/projects";
import type { TimeLogRow } from "@/lib/queries/timeLogs";
import { formatCurrency } from "@/lib/utils";

export type TimeLogFormData = {
  id?: string;
  client_id: string | null;
  project_id: string | null;
  description: string;
  hours: number;
  billable: boolean;
  hourly_rate: number | null;
  currency: string;
  logged_date: string;
};

interface TimeLogFormProps {
  clients: ClientRow[];
  projects: ProjectRow[];
  defaultClientId?: string;
  defaultProjectId?: string;
  defaultDate?: string;
  /** When set, form is in edit mode (prefilled, submit updates) */
  initialValues?: TimeLogRow | null;
  onSubmit: (data: TimeLogFormData) => Promise<void>;
  onCancel: () => void;
}

const CURRENCY_SYMBOL: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
};

export function TimeLogForm({
  clients,
  projects,
  defaultClientId,
  defaultProjectId,
  defaultDate = new Date().toISOString().slice(0, 10),
  initialValues,
  onSubmit,
  onCancel,
}: TimeLogFormProps) {
  const [clientId, setClientId] = useState(initialValues?.client_id ?? defaultClientId ?? "");
  const [projectId, setProjectId] = useState(initialValues?.project_id ?? defaultProjectId ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [hours, setHours] = useState(initialValues != null ? String(initialValues.hours) : "1");
  const [billable, setBillable] = useState(initialValues?.billable ?? true);
  const [hourlyRate, setHourlyRate] = useState(initialValues?.hourly_rate != null ? String(initialValues.hourly_rate) : "");
  const [currency, setCurrency] = useState(initialValues?.currency ?? "GBP");
  const [loggedDate, setLoggedDate] = useState(initialValues?.logged_date ?? defaultDate);

  const clientProjects = projects.filter((p) => p.client_id === clientId);
  const selectedClient = clients.find((c) => c.id === clientId);
  const isEdit = Boolean(initialValues?.id);

  useEffect(() => {
    if (initialValues) {
      setClientId(initialValues.client_id ?? "");
      setProjectId(initialValues.project_id ?? "");
      setDescription(initialValues.description ?? "");
      setHours(String(initialValues.hours));
      setBillable(initialValues.billable);
      setHourlyRate(initialValues.hourly_rate != null ? String(initialValues.hourly_rate) : "");
      setCurrency(initialValues.currency ?? "GBP");
      setLoggedDate(initialValues.logged_date ?? defaultDate);
    }
  }, [initialValues?.id, defaultDate]);

  useEffect(() => {
    if (selectedClient?.hourly_rate != null && !initialValues?.hourly_rate) {
      setHourlyRate(String(selectedClient.hourly_rate));
      setCurrency(selectedClient.currency ?? "GBP");
    }
  }, [selectedClient, initialValues?.hourly_rate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      ...(initialValues?.id && { id: initialValues.id }),
      client_id: clientId || null,
      project_id: projectId || null,
      description: description.trim(),
      hours: Math.max(0, parseFloat(hours) || 0),
      billable,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
      currency,
      logged_date: loggedDate,
    });
  }

  const hoursNum = Math.max(0, parseFloat(hours) || 0);
  const rateNum = hourlyRate ? parseFloat(hourlyRate) : null;
  const estimatedTotal =
    billable && rateNum != null && hoursNum > 0 ? hoursNum * rateNum : null;
  const symbol = CURRENCY_SYMBOL[currency] ?? "£";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
          Date
        </label>
        <DatePicker
          value={loggedDate}
          onChange={setLoggedDate}
          placeholder="Pick date"
          className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
            Client
          </label>
          <Select
            options={[{ value: "", label: "Select client" }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              setProjectId("");
            }}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
            Project
          </label>
          <Select
            options={[{ value: "", label: "Select project" }, ...clientProjects.map((p) => ({ value: p.id, label: p.title }))]}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="What did you work on?"
          className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white outline-none transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
            Hours
          </label>
          <input
            type="number"
            step="0.25"
            min="0"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white outline-none transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
            Hourly rate
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none">
              {symbol}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-7 pr-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white outline-none transition"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
          Billable
        </label>
        <div className="flex rounded-lg border border-neutral-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setBillable(true)}
            className={`flex-1 px-3 py-2 text-sm text-center cursor-pointer transition ${
              billable ? "bg-teal-500 text-white font-medium" : "bg-white text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            Billable
          </button>
          <button
            type="button"
            onClick={() => setBillable(false)}
            className={`flex-1 px-3 py-2 text-sm text-center cursor-pointer transition ${
              !billable ? "bg-teal-500 text-white font-medium" : "bg-white text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            Non-billable
          </button>
        </div>
      </div>

      {estimatedTotal != null && (
        <div className="border-t border-neutral-100 pt-3 mt-3 flex items-center justify-between">
          <span className="text-xs text-neutral-400 uppercase tracking-wider">Estimated total</span>
          <span className="text-base font-semibold font-mono text-teal-600">
            {formatCurrency(estimatedTotal, currency)}
          </span>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white">
          {isEdit ? "Save changes" : "Save entry"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
