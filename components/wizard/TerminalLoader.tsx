"use client";

import { useEffect, useState } from "react";

export type GenerationStep =
  | "preparing"
  | "analyzing"
  | "blueprint"
  | "validating"
  | "creating_project"
  | "tasks"
  | "redirecting";

const STEP_CONFIG: Record<
  GenerationStep,
  { label: string; description: string; expectedOutput?: string }
> = {
  preparing: {
    label: "Preparing request",
    description: "Validating your project details and preparing the brief",
  },
  analyzing: {
    label: "Analyzing project brief",
    description: "Reading your goals, audience, and constraints",
  },
  blueprint: {
    label: "Generating blueprint & tasks",
    description: "AI is building the full project plan",
    expectedOutput:
      "12–25 features · 4–8 milestones · 5–12 risks · 25–55 tasks",
  },
  validating: {
    label: "Validating output",
    description: "Checking blueprint structure and task list",
  },
  creating_project: {
    label: "Creating project",
    description: "Saving project and blueprint to your workspace",
  },
  tasks: {
    label: "Populating task board",
    description: "Adding tasks to your Kanban board",
  },
  redirecting: {
    label: "Done",
    description: "Redirecting to your project",
  },
};

const STEPS: GenerationStep[] = [
  "preparing",
  "analyzing",
  "blueprint",
  "validating",
  "creating_project",
  "tasks",
  "redirecting",
];

interface TerminalLoaderProps {
  /** Current step (driven by parent). If not provided, runs auto demo. */
  currentStep?: GenerationStep;
  /** When step is "tasks", show "Adding task 7 of 24" etc. */
  taskProgress?: { current: number; total: number };
  /** Optional project title to show in header */
  projectTitle?: string;
  /** During "blueprint" step: rotating status (e.g. "Contacting AI…", "Generating features…") */
  blueprintPhase?: string;
  /** After blueprint returns: counts to show (e.g. "24 features, 42 tasks generated") */
  generatedCounts?: { features?: number; tasks?: number };
}

export function TerminalLoader({
  currentStep: controlledStep,
  taskProgress,
  projectTitle,
  blueprintPhase,
  generatedCounts,
}: TerminalLoaderProps) {
  const [autoStep, setAutoStep] = useState(0);
  const isControlled = controlledStep != null;
  const stepIndex = isControlled
    ? STEPS.indexOf(controlledStep)
    : Math.min(autoStep, STEPS.length - 1);
  const currentKey = STEPS[Math.min(stepIndex, STEPS.length - 1)];

  useEffect(() => {
    if (isControlled) return;
    if (autoStep >= STEPS.length) return;
    const delay = 400;
    const t = setTimeout(() => setAutoStep((s) => s + 1), delay);
    return () => clearTimeout(t);
  }, [autoStep, isControlled]);

  return (
    <div className="max-w-lg mx-auto">
      <div
        className="rounded-lg border border-[var(--border)] overflow-hidden shadow-[0_0_40px_rgba(0,255,136,0.08)]"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
          <span className="w-3 h-3 rounded-full bg-[var(--accent-red)]" />
          <span className="w-3 h-3 rounded-full bg-[var(--accent-amber)]" />
          <span className="w-3 h-3 rounded-full bg-[var(--accent-green)]" />
          <span className="text-xs text-[var(--text-muted)] ml-3 font-medium truncate">
            {projectTitle
              ? `devblueprint — generating: ${projectTitle}`
              : "devblueprint — generating blueprint"}
          </span>
        </div>
        <div className="p-6 font-mono text-sm min-h-[320px] flex flex-col justify-center">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-4">
            What&apos;s happening
          </p>
          <div className="space-y-3">
            {STEPS.map((key, i) => {
              const config = STEP_CONFIG[key];
              const isDone = i < stepIndex;
              const isCurrent = i === stepIndex;
              const isTasks = key === "tasks";

              return (
                <div
                  key={key}
                  className={`transition-all duration-200 ${
                    isDone ? "opacity-100" : isCurrent ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`select-none shrink-0 ${
                        isDone ? "text-[var(--accent-green)]" : isCurrent ? "text-[var(--accent-green)]" : "text-[var(--text-muted)]"
                      }`}
                    >
                      {isDone ? "[OK]" : isCurrent ? ">" : "·"}
                    </span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {config.label}
                    </span>
                    {isDone && (
                      <span className="text-[var(--accent-green)] ml-auto text-xs">
                        done
                      </span>
                    )}
                  </div>
                  {(isCurrent || isDone) && (
                    <div className="mt-0.5 ml-6 space-y-0.5">
                      <p className="text-xs text-[var(--text-secondary)]">
                        {isTasks && taskProgress && isCurrent
                          ? `Adding task ${taskProgress.current} of ${taskProgress.total}…`
                          : isCurrent && key === "blueprint" && blueprintPhase
                            ? blueprintPhase
                            : config.description}
                      </p>
                      {key === "blueprint" && (
                        <p className="text-xs text-[var(--text-muted)]">
                          {isDone && generatedCounts
                            ? `Generated ${generatedCounts.features ?? "—"} features, ${generatedCounts.tasks ?? "—"} tasks`
                            : config.expectedOutput
                              ? `Target: ${config.expectedOutput}`
                              : null}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-1 mt-6 pt-4 border-t border-[var(--border)]">
            <span
              className="w-2 h-4 bg-[var(--accent-green)] animate-pulse rounded-sm"
              style={{ animationDuration: "0.7s" }}
            />
            <span className="text-xs text-[var(--text-muted)]">
              {currentKey === "redirecting" ? "Taking you to the project…" : "Working…"}
            </span>
          </div>
        </div>
      </div>
      <p className="text-center text-sm text-[var(--text-muted)] mt-4">
        {STEP_CONFIG[currentKey].description}
      </p>
    </div>
  );
}
