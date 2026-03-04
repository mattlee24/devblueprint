"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { ClientRow } from "@/lib/queries/clients";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const CURRENCY_OPTIONS = [
  { value: "GBP", label: "GBP" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "AUD", label: "AUD" },
  { value: "CAD", label: "CAD" },
];

const COLOURS = ["#00ff88", "#0088ff", "#ffaa00", "#aa66ff", "#ff4444", "#00aaff"];

interface ClientFormProps {
  data: Partial<ClientRow>;
  onChange: (data: Partial<ClientRow>) => void;
  submitLabel?: string;
  onSubmit: () => void;
}

export function ClientForm({
  data,
  onChange,
  submitLabel = "Save",
  onSubmit,
}: ClientFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4 max-w-xl"
    >
      <Input
        label="Name"
        value={data.name ?? ""}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        required
      />
      <Input
        label="Company"
        value={data.company ?? ""}
        onChange={(e) => onChange({ ...data, company: e.target.value })}
      />
      <Input
        label="Email"
        type="email"
        value={data.email ?? ""}
        onChange={(e) => onChange({ ...data, email: e.target.value })}
      />
      <Input
        label="Phone"
        value={data.phone ?? ""}
        onChange={(e) => onChange({ ...data, phone: e.target.value })}
      />
      <Input
        label="Website"
        value={data.website ?? ""}
        onChange={(e) => onChange({ ...data, website: e.target.value })}
      />
      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">Address</label>
        <textarea
          value={data.address ?? ""}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)] focus:border-[var(--border-active)] focus:outline-none"
        />
      </div>
      <div className="flex gap-4">
        <Input
          label="Default hourly rate"
          type="number"
          value={data.hourly_rate ?? ""}
          onChange={(e) => onChange({ ...data, hourly_rate: e.target.value ? Number(e.target.value) : null })}
          className="flex-1"
        />
        <Select
          label="Currency"
          options={CURRENCY_OPTIONS}
          value={data.currency ?? "GBP"}
          onChange={(e) => onChange({ ...data, currency: e.target.value })}
          className="w-32"
        />
      </div>
      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-2">Avatar colour</label>
        <div className="flex gap-2">
          {COLOURS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ ...data, avatar_colour: c })}
              className={`w-8 h-8 rounded border-2 ${
                data.avatar_colour === c ? "border-[var(--accent-green)]" : "border-[var(--border)]"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <Select
        label="Status"
        options={STATUS_OPTIONS}
        value={data.status ?? "active"}
        onChange={(e) => onChange({ ...data, status: e.target.value })}
        className="w-40"
      />
      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">Notes</label>
        <textarea
          value={data.notes ?? ""}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)] focus:border-[var(--border-active)] focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-[var(--accent-green)] text-[var(--bg-base)] font-medium rounded-[var(--radius-card)] hover:opacity-90"
      >
        {submitLabel}
      </button>
    </form>
  );
}
