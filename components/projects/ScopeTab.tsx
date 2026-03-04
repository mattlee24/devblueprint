"use client";

import Link from "next/link";
import type { ProjectRow } from "@/lib/queries/projects";
import type { Blueprint } from "@/lib/types";

const cardClass =
  "rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-elevated)] p-5";

interface ScopeTabProps {
  project: ProjectRow;
  blueprint: Blueprint | null;
}

export function ScopeTab({ project, blueprint }: ScopeTabProps) {
  const client = (project as unknown as { clients?: { name: string; id: string } })?.clients;
  const stack = (project.stack as string[]) ?? [];

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Project brief</p>
        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line">
          {project.description || "No description set."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={cardClass}>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Type & status</p>
          <p className="text-sm text-[var(--text-primary)] capitalize">
            {project.type.replace("_", " ")} · {project.status.replace("_", " ")}
          </p>
        </div>
        {client && (
          <div className={cardClass}>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Client</p>
            <Link
              href={`/clients/${client.id}`}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              {client.name} →
            </Link>
          </div>
        )}
      </div>

      {stack.length > 0 && (
        <div className={cardClass}>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Technology stack</p>
          <div className="flex flex-wrap gap-2">
            {stack.map((s) => (
              <span
                key={s}
                className="px-2 py-1 rounded border border-[var(--border)] text-sm text-[var(--text-secondary)]"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {blueprint && (
        <>
          <div className={cardClass}>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Summary</p>
            <p className="text-sm text-[var(--text-secondary)]">{blueprint.summary}</p>
          </div>
          {blueprint.technicalRequirements?.length > 0 && (
            <div className={cardClass}>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Key technical requirements</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-secondary)]">
                {blueprint.technicalRequirements.slice(0, 8).map((r, i) => (
                  <li key={i}>{r.text}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
