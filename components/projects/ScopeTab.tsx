"use client";

import Link from "next/link";
import type { ProjectRow } from "@/lib/queries/projects";
import type { Blueprint } from "@/lib/types";

const cardClass =
  "rounded-xl border border-neutral-200 bg-neutral-50 p-5";

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
        <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Project brief</p>
        <p className="text-sm text-neutral-700 whitespace-pre-line">
          {project.description || "No description set."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={cardClass}>
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Type & status</p>
          <p className="text-sm text-neutral-900 capitalize">
            {project.type.replace("_", " ")} · {project.status.replace("_", " ")}
          </p>
        </div>
        {client && (
          <div className={cardClass}>
            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Client</p>
            <Link
              href={`/clients/${client.id}`}
              className="text-sm text-teal-500 hover:underline"
            >
              {client.name} →
            </Link>
          </div>
        )}
      </div>

      {stack.length > 0 && (
        <div className={cardClass}>
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Technology stack</p>
          <div className="flex flex-wrap gap-2">
            {stack.map((s) => (
              <span
                key={s}
                className="px-2 py-1 rounded border border-neutral-200 text-sm text-neutral-700"
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
            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Summary</p>
            <p className="text-sm text-neutral-700">{blueprint.summary}</p>
          </div>
          {blueprint.technicalRequirements?.length > 0 && (
            <div className={cardClass}>
              <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Key technical requirements</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700">
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
