"use client";

import { type ReactNode } from "react";

const DEFAULT_STEPS = ["IDENTITY", "STACK", "GENERATE"];

interface WizardShellProps {
  step: number;
  steps?: string[];
  children: ReactNode;
}

export function WizardShell({ step, steps = DEFAULT_STEPS, children }: WizardShellProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          {steps.map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span
                className={
                  i === step
                    ? "text-[var(--accent)] font-medium"
                    : i < step
                      ? "text-[var(--text-secondary)]"
                      : "text-[var(--text-muted)]"
                }
              >
                [{String(i + 1).padStart(2, "0")}]
              </span>
              {i < steps.length - 1 && <span>──</span>}
            </span>
          ))}
        </div>
        <p className="text-lg font-medium mt-2 text-[var(--accent)]">
          {steps[step]}
        </p>
      </div>
      {children}
    </div>
  );
}
