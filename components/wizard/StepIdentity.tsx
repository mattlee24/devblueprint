"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { ProjectType } from "@/lib/types";
import type { ClientRow } from "@/lib/queries/clients";

interface StepIdentityProps {
  title: string;
  description: string;
  type: ProjectType;
  clientId: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onTypeChange: (v: ProjectType) => void;
  onClientChange: (v: string) => void;
  clients: ClientRow[];
  onAddClient?: () => void;
}

const TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "web_application", label: "Web Application" },
  { value: "mobile_app", label: "Mobile App" },
  { value: "api", label: "API or Backend" },
  { value: "cli", label: "CLI Tool" },
  { value: "other", label: "Other" },
];

export function StepIdentity({
  title,
  description,
  type,
  clientId,
  onTitleChange,
  onDescriptionChange,
  onTypeChange,
  onClientChange,
  clients,
}: StepIdentityProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Project Title"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="My Project"
        required
      />
      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe the project: goals, audience, key features, and any constraints..."
          rows={6}
          className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:outline-none transition-[var(--transition)]"
        />
        <p className="text-xs text-[var(--text-muted)] mt-1">
          The more detail you provide, the better the AI-generated project setup will be.
        </p>
      </div>
      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-2">
          Project Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-[var(--transition)] ${
                type === opt.value
                  ? "border-[var(--accent-green)] bg-[var(--bg-hover)]"
                  : "border-[var(--border)] hover:border-[var(--border-active)]"
              }`}
            >
              <input
                type="radio"
                name="type"
                value={opt.value}
                checked={type === opt.value}
                onChange={() => onTypeChange(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
      <Select
        label="Client (optional)"
        options={[
          { value: "", label: "No client" },
          ...clients.map((c) => ({ value: c.id, label: c.name })),
        ]}
        value={clientId}
        onChange={(e) => onClientChange(e.target.value)}
        placeholder="Select client"
      />
    </div>
  );
}
