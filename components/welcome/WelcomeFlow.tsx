"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Users, FileSignature, FolderKanban, CheckCircle, Sparkles } from "lucide-react";

const STEPS = [
  {
    title: "Welcome to DevBlueprint",
    body: "Plan projects, track time, and get paid. Everything you need to run client work in one place.",
    icon: Sparkles,
  },
  {
    title: "Clients",
    body: "Add clients to keep projects and invoices organised. You can create your first client from the sidebar or dashboard.",
    icon: Users,
  },
  {
    title: "Proposals",
    body: "Create proposals from a title and description—we'll generate a full professional proposal including objectives, timeline, and budget.",
    icon: FileSignature,
  },
  {
    title: "Projects",
    body: "Turn agreed proposals into full project plans with tasks and blueprints. Generate detailed plans with AI or build them yourself.",
    icon: FolderKanban,
  },
  {
    title: "You're all set",
    body: "Head to the dashboard to get started. Use the command palette (⌘K) anytime for quick navigation.",
    icon: CheckCircle,
  },
];

interface WelcomeFlowProps {
  onComplete: () => Promise<void>;
}

export function WelcomeFlow({ onComplete }: WelcomeFlowProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const totalSteps = STEPS.length;
  const progressPercent = ((step + 1) / totalSteps) * 100;

  async function handleNext() {
    if (isLast) {
      setLoading(true);
      await onComplete();
      setLoading(false);
      router.push("/dashboard");
      return;
    }
    setStep((s) => s + 1);
  }

  async function handleSkip() {
    setLoading(true);
    await onComplete();
    setLoading(false);
    router.push("/dashboard");
  }

  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-base)]/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-surface)] shadow-lg overflow-hidden">
        {/* Step progress: "Step 2 of 5" + progress bar */}
        <div className="px-8 pt-6 pb-4 border-b border-[var(--border)]">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Step {step + 1} of {totalSteps}
          </p>
          <div className="h-1.5 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={step + 1}
              aria-valuemin={1}
              aria-valuemax={totalSteps}
            />
          </div>
        </div>

        <div className="p-8">
          <div className="text-center">
            <div className="inline-flex p-3 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] mb-5">
              <Icon className="w-8 h-8 text-[var(--accent)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">{current.title}</h2>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-md mx-auto">
              {current.body}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 mt-8">
            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
            >
              Skip tour
            </button>
            <Button onClick={handleNext} disabled={loading}>
              {isLast ? "Go to dashboard" : "Next"}
            </Button>
          </div>

          {/* Stepper dots (optional visual) */}
          <div className="flex justify-center gap-1.5 mt-6" aria-hidden>
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all duration-200 ${
                  i === step ? "w-6 bg-[var(--accent)]" : "w-2 bg-[var(--border)]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
