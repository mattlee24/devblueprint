"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { WizardShell } from "@/components/wizard/WizardShell";
import { StepIdentity } from "@/components/wizard/StepIdentity";
import { StepStack } from "@/components/wizard/StepStack";
import { StepGoals } from "@/components/wizard/StepGoals";
import { Button } from "@/components/ui/Button";
import { getClients } from "@/lib/queries/clients";
import { createProposal } from "@/lib/queries/proposals";
import type { ClientRow } from "@/lib/queries/clients";
import type { ProjectType } from "@/lib/types";

function NewProposalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClient = searchParams.get("client") ?? "";

  const [step, setStep] = useState(0);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProjectType>("website");
  const [clientId, setClientId] = useState(preselectedClient);
  const [stack, setStack] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [constraints, setConstraints] = useState("");
  const [isClientProject, setIsClientProject] = useState(false);
  const [hourlyRateOverride, setHourlyRateOverride] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getClients().then((r) => {
      setClients(r.data ?? []);
      if (preselectedClient) setClientId(preselectedClient);
    });
  }, [preselectedClient]);

  function toggleStack(value: string) {
    setStack((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  const canNext =
    step === 0
      ? title.trim().length > 0
      : step === 1
        ? stack.length > 0
        : true;

  async function handleSubmit(status: "draft" | "sent") {
    setSubmitting(true);
    const { data, error } = await createProposal({
      title: title.trim(),
      description: description.trim() || null,
      type,
      client_id: clientId || null,
      stack,
      target_audience: targetAudience.trim() || null,
      goals,
      constraints: constraints.trim() || null,
      hourly_rate_override: hourlyRateOverride ? parseFloat(hourlyRateOverride) : null,
      status,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message ?? "Failed to save proposal");
      return;
    }
    toast.success(status === "sent" ? "Proposal sent" : "Proposal saved as draft");
    if (data) router.push(`/proposals/${data.id}`);
    router.refresh();
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/proposals" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)]">
          ← Back to proposals
        </Link>
      </div>
      <WizardShell step={step}>
        {step === 0 && (
          <StepIdentity
            title={title}
            description={description}
            type={type}
            clientId={clientId}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onTypeChange={setType}
            onClientChange={setClientId}
            clients={clients}
          />
        )}
        {step === 1 && (
          <StepStack type={type} selected={stack} onToggle={toggleStack} />
        )}
        {step === 2 && (
          <StepGoals
            targetAudience={targetAudience}
            goals={goals}
            constraints={constraints}
            isClientProject={isClientProject}
            hourlyRateOverride={hourlyRateOverride}
            onTargetAudienceChange={setTargetAudience}
            onGoalsChange={setGoals}
            onConstraintsChange={setConstraints}
            onIsClientProjectChange={setIsClientProject}
            onHourlyRateOverrideChange={setHourlyRateOverride}
          />
        )}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-[var(--text-secondary)]">
              Review and save your proposal:
            </p>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-[var(--text-muted)]">
              {type} · {stack.length} stack items · {(clients.find((c) => c.id === clientId))?.name ?? "No client"}
            </p>
          </div>
        )}
        <div className="flex justify-between mt-8">
          <Button
            variant="secondary"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              Next
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => handleSubmit("draft")}
                disabled={submitting}
              >
                Save draft
              </Button>
              <Button
                onClick={() => handleSubmit("sent")}
                disabled={submitting}
              >
                Send proposal
              </Button>
            </div>
          )}
        </div>
      </WizardShell>
    </main>
  );
}

export default function NewProposalPage() {
  return (
    <Suspense fallback={
      <main className="p-6">
        <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
      </main>
    }>
      <NewProposalForm />
    </Suspense>
  );
}
