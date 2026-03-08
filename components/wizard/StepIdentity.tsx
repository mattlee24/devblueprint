"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { ProjectType } from "@/lib/types";
import type { ClientRow } from "@/lib/queries/clients";
import { Globe, Zap, Smartphone, Code, Terminal, HelpCircle } from "lucide-react";

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
  /** When true, client selector is not rendered (e.g. edit page renders Client + Status in one row) */
  hideClient?: boolean;
}

const TYPE_OPTIONS: { value: ProjectType; label: string; icon: React.ReactNode }[] = [
  { value: "website", label: "Website", icon: <Globe className="w-4 h-4" /> },
  { value: "web_application", label: "Web Application", icon: <Zap className="w-4 h-4" /> },
  { value: "mobile_app", label: "Mobile App", icon: <Smartphone className="w-4 h-4" /> },
  { value: "api", label: "API or Backend", icon: <Code className="w-4 h-4" /> },
  { value: "cli", label: "CLI Tool", icon: <Terminal className="w-4 h-4" /> },
  { value: "other", label: "Other", icon: <HelpCircle className="w-4 h-4" /> },
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
  hideClient,
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
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
          Project Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition ${
                type === opt.value
                  ? "border-teal-500 bg-teal-500 text-white"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50"
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
              {opt.icon}
              <span className="text-sm font-medium">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      {!hideClient && (
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
      )}
    </div>
  );
}
