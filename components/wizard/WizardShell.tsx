"use client";

import { type ReactNode } from "react";

const DEFAULT_STEPS = ["IDENTITY", "STACK", "GENERATE"];
const STEP_LABELS: Record<string, string> = {
  IDENTITY: "Identity",
  STACK: "Configure",
  GENERATE: "Review",
};

interface WizardShellProps {
  step: number;
  steps?: string[];
  children: ReactNode;
}

export function WizardShell({ step, steps = DEFAULT_STEPS, children }: WizardShellProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-0">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    i < step
                      ? "bg-teal-500 text-white"
                      : i === step
                        ? "bg-white border-2 border-teal-500 text-teal-500"
                        : "bg-neutral-100 border-2 border-neutral-200 text-neutral-400"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span className="text-xs text-neutral-500 mt-1">{STEP_LABELS[s] ?? s}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-0.5 min-w-[24px] ${
                    i < step ? "bg-teal-500" : "bg-neutral-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
