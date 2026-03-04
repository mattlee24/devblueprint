"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getProposal, updateProposal } from "@/lib/queries/proposals";
import type { ProposalRow } from "@/lib/queries/proposals";
import type { ProjectType } from "@/lib/types";
import { WizardShell } from "@/components/wizard/WizardShell";
import { StepIdentity } from "@/components/wizard/StepIdentity";
import { StepStack } from "@/components/wizard/StepStack";
import { StepGoals } from "@/components/wizard/StepGoals";
import { Button } from "@/components/ui/Button";
import { getClients } from "@/lib/queries/clients";
import type { ClientRow } from "@/lib/queries/clients";

export default function EditProposalPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [step, setStep] = useState(0);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProjectType>("website");
  const [clientId, setClientId] = useState("");
  const [stack, setStack] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [constraints, setConstraints] = useState("");
  const [isClientProject, setIsClientProject] = useState(false);
  const [hourlyRateOverride, setHourlyRateOverride] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const [pRes, cRes] = await Promise.all([getProposal(id), getClients()]);
      setClients(cRes.data ?? []);
      const p = pRes.data as ProposalRow | null;
      if (p) {
        setTitle(p.title);
        setDescription(p.description ?? "");
        setType(p.type as ProjectType);
        setClientId(p.client_id ?? "");
        setStack(Array.isArray(p.stack) ? p.stack : []);
        setTargetAudience(p.target_audience ?? "");
        setGoals(Array.isArray(p.goals) ? p.goals : []);
        setConstraints(p.constraints ?? "");
        setHourlyRateOverride(p.hourly_rate_override != null ? String(p.hourly_rate_override) : "");
      }
      setLoading(false);
    }
    load();
  }, [id]);

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

  async function handleSubmit(status?: "draft" | "sent") {
    setSubmitting(true);
    const updates = {
      title: title.trim(),
      description: description.trim() || null,
      type,
      client_id: clientId || null,
      stack,
      target_audience: targetAudience.trim() || null,
      goals,
      constraints: constraints.trim() || null,
      hourly_rate_override: hourlyRateOverride ? parseFloat(hourlyRateOverride) : null,
      ...(status && { status }),
    };
    const { error } = await updateProposal(id, updates);
    setSubmitting(false);
    if (error) {
      toast.error(error.message ?? "Failed to save proposal");
      return;
    }
    toast.success(status ? (status === "sent" ? "Proposal sent" : "Draft saved") : "Proposal updated");
    router.push(`/proposals/${id}`);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="p-6">
        <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/proposals/${id}`} className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)]">
          ← Back to proposal
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
            <p className="text-[var(--text-secondary)]">Save your changes:</p>
            <p className="font-medium">{title}</p>
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
              <Button variant="secondary" onClick={() => handleSubmit()} disabled={submitting}>
                Save changes
              </Button>
              <Button onClick={() => handleSubmit("draft")} disabled={submitting}>
                Save as draft
              </Button>
              <Button onClick={() => handleSubmit("sent")} disabled={submitting}>
                Send proposal
              </Button>
            </div>
          )}
        </div>
      </WizardShell>
    </main>
  );
}
