"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Blueprint } from "@/lib/types";
import type { TaskTemplate } from "@/lib/types";
import type { ProjectInput } from "@/lib/types";

const cardClass =
  "rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-elevated)] p-5";

interface GenerationPreviewProps {
  projectTitle: string;
  blueprint: Blueprint;
  tasks: TaskTemplate[];
  input: ProjectInput;
  rawResponse?: string | null;
  /** Full API response JSON when rawResponse is missing (e.g. for debugging) */
  fullApiResponse?: string | null;
  onConfirm: () => void;
  onGenerateAgain: () => void;
  isCreating?: boolean;
}

export function GenerationPreview({
  blueprint,
  tasks,
  rawResponse,
  fullApiResponse,
  onConfirm,
  onGenerateAgain,
  isCreating = false,
}: GenerationPreviewProps) {
  const [showRawResponse, setShowRawResponse] = useState(false);
  const responseToShow = rawResponse ?? fullApiResponse ?? null;
  const responseLabel = rawResponse
    ? "Raw AI response (before parsing)"
    : fullApiResponse
      ? "Full API response (rawResponse not returned by server)"
      : null;
  const featureCount = blueprint.coreFeatures?.length ?? 0;
  const taskCount = tasks.length;
  const milestoneCount = blueprint.milestones?.length ?? 0;
  const riskCount = blueprint.riskFactors?.length ?? 0;

  const featuresToShow = (blueprint.coreFeatures ?? []).slice(0, 10);
  const tasksToShow = tasks.slice(0, 12);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className={`${cardClass} text-center`}>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
          Blueprint ready for review
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Review the generated plan below. Create the project or generate again for a different result.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={cardClass}>
          <p className="text-2xl font-bold text-[var(--accent)]">{featureCount}</p>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Features</p>
        </div>
        <div className={cardClass}>
          <p className="text-2xl font-bold text-[var(--accent)]">{taskCount}</p>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Tasks</p>
        </div>
        <div className={cardClass}>
          <p className="text-2xl font-bold text-[var(--accent)]">{milestoneCount}</p>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Milestones</p>
        </div>
        <div className={cardClass}>
          <p className="text-2xl font-bold text-[var(--accent)]">{riskCount}</p>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Risks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={cardClass}>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Core features
          </h3>
          <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
            {featuresToShow.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-[var(--text-muted)]">·</span>
                <span>{f.name}</span>
                <span className="text-xs text-[var(--text-muted)]">({f.effort})</span>
              </li>
            ))}
            {featureCount > featuresToShow.length && (
              <li className="text-xs text-[var(--text-muted)] pt-1">
                +{featureCount - featuresToShow.length} more
              </li>
            )}
          </ul>
        </div>
        <div className={cardClass}>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Sample tasks
          </h3>
          <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
            {tasksToShow.map((t, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-[var(--text-muted)]">·</span>
                <span className="truncate">{t.title}</span>
              </li>
            ))}
            {taskCount > tasksToShow.length && (
              <li className="text-xs text-[var(--text-muted)] pt-1">
                +{taskCount - tasksToShow.length} more
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Button
          onClick={onConfirm}
          disabled={isCreating}
        >
          {isCreating ? "Creating…" : "Create project"}
        </Button>
        <Button
          variant="secondary"
          onClick={onGenerateAgain}
          disabled={isCreating}
        >
          Generate again
        </Button>
        <Button
          variant="secondary"
          onClick={() => setShowRawResponse((v) => !v)}
          disabled={isCreating}
        >
          {showRawResponse ? "Hide raw response" : "Preview raw response"}
        </Button>
      </div>

      {showRawResponse && (
        <div className={cardClass}>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            {responseLabel ?? "Response preview"}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-2">
            {rawResponse
              ? "Exact text from the AI before parsing. Use it to debug missing or mis-mapped fields (e.g. features vs tasks)."
              : fullApiResponse
                ? "Full response body from the API. If rawResponse is missing here, the server may not be sending it."
                : "Request failed or fallback was used, so no API response is available."}
          </p>
          <pre className="text-xs bg-[var(--bg-base)] border border-[var(--border)] rounded p-4 overflow-auto max-h-[60vh] whitespace-pre-wrap break-words font-mono text-[var(--text-secondary)]">
            {responseToShow ?? "No response available."}
          </pre>
        </div>
      )}
    </div>
  );
}
