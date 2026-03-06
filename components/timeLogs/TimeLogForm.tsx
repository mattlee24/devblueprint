"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { ClientRow } from "@/lib/queries/clients";
import type { ProjectRow } from "@/lib/queries/projects";
import type { TimeLogRow } from "@/lib/queries/timeLogs";

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Date"
        type="date"
        value={loggedDate}
        onChange={(e) => setLoggedDate(e.target.value)}
      />
      <Select
        label="Client"
        options={[{ value: "", label: "—" }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
        value={clientId}
        onChange={(e) => {
          setClientId(e.target.value);
          setProjectId("");
        }}
      />
      <Select
        label="Project"
        options={[{ value: "", label: "—" }, ...clientProjects.map((p) => ({ value: p.id, label: p.title }))]}
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
      />
      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <Input
        label="Hours"
        type="number"
        step="0.25"
        min="0"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        required
      />
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={billable}
          onChange={(e) => setBillable(e.target.checked)}
        />
        <span className="text-sm">Billable</span>
      </label>
      <Input
        label="Hourly rate (optional)"
        type="number"
        step="0.01"
        value={hourlyRate}
        onChange={(e) => setHourlyRate(e.target.value)}
      />
      <div className="flex gap-2">
        <Button type="submit">{isEdit ? "Save changes" : "Save entry"}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
