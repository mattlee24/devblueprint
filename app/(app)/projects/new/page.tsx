"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { WizardShell } from "@/components/wizard/WizardShell";
import { StepIdentity } from "@/components/wizard/StepIdentity";
import { StepStack } from "@/components/wizard/StepStack";
import { StepGoals } from "@/components/wizard/StepGoals";
import { TerminalLoader, type GenerationStep } from "@/components/wizard/TerminalLoader";
import { Button } from "@/components/ui/Button";
import { getClients } from "@/lib/queries/clients";
import { getProposal, updateProposal } from "@/lib/queries/proposals";
import { createProject } from "@/lib/queries/projects";
import { createTask } from "@/lib/queries/tasks";
import type { ClientRow } from "@/lib/queries/clients";
import type { ProjectType } from "@/lib/types";
import { generateBlueprint, generateTasks } from "@/lib/blueprintEngine";

function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromProposalId = searchParams.get("fromProposal") ?? "";

  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<GenerationStep>("analyzing");
  const [taskProgress, setTaskProgress] = useState<{ current: number; total: number } | undefined>();
  const [clients, setClients] = useState<ClientRow[]>([]);

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

  useEffect(() => {
    getClients().then((r) => setClients(r.data ?? []));
  }, []);

  useEffect(() => {
    if (!fromProposalId) return;
    getProposal(fromProposalId).then((res) => {
      const p = res.data;
      if (!p) return;
      setTitle(p.title);
      setDescription(p.description ?? "");
      setType((p.type as ProjectType) ?? "website");
      setClientId(p.client_id ?? "");
      setStack(Array.isArray(p.stack) ? p.stack : []);
      setTargetAudience(p.target_audience ?? "");
      setGoals(Array.isArray(p.goals) ? p.goals : []);
      setConstraints(p.constraints ?? "");
      setHourlyRateOverride(p.hourly_rate_override != null ? String(p.hourly_rate_override) : "");
    });
  }, [fromProposalId]);

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

  async function handleGenerate() {
    setGenerating(true);
    setGenerationStep("analyzing");
    setTaskProgress(undefined);

    const input = {
      title: title.trim(),
      description: description.trim(),
      type,
      stack,
      goals,
      constraints,
      targetAudience,
    };

    let blueprint: ReturnType<typeof generateBlueprint>;
    let tasks: ReturnType<typeof generateTasks>;

    setGenerationStep("blueprint");
    try {
      const res = await fetch("/api/projects/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();

      if (res.ok && data.blueprint && Array.isArray(data.tasks)) {
        blueprint = data.blueprint;
        tasks = data.tasks;
      } else {
        blueprint = generateBlueprint(input);
        tasks = generateTasks(input, blueprint);
      }
    } catch {
      blueprint = generateBlueprint(input);
      tasks = generateTasks(input, blueprint);
    }

    setGenerationStep("creating_project");
    const { data: project, error } = await createProject({
      title: input.title,
      description: input.description,
      type,
      client_id: clientId || null,
      status: "active",
      stack,
      blueprint: blueprint as unknown as Record<string, unknown>,
      overall_score: blueprint.overallScore,
      user_flow: null,
      board_config: { columnOrder: ["todo", "in_progress", "in_review", "done"] },
    });

    if (error || !project) {
      toast.error(error?.message ?? "Failed to create project");
      setGenerating(false);
      return;
    }

    if (fromProposalId) {
      await updateProposal(fromProposalId, { project_id: project.id, status: "agreed" });
    }

    const taskInserts = tasks.map((t) => ({
      project_id: project.id,
      title: t.title,
      description: t.description ?? null,
      status: t.status,
      priority: t.priority,
      category: t.category,
      effort: t.effort,
      position: t.position,
    }));

    setGenerationStep("tasks");
    const total = taskInserts.length;
    for (let i = 0; i < taskInserts.length; i++) {
      setTaskProgress({ current: i + 1, total });
      await createTask(taskInserts[i]);
    }

    setGenerationStep("redirecting");
    setTaskProgress(undefined);
    await new Promise((r) => setTimeout(r, 500));
    setGenerating(false);
    toast.success("Project created");
    router.push(`/projects/${project.id}`);
    router.refresh();
  }

  if (generating) {
    return (
      <main className="p-6 min-h-[60vh] flex flex-col justify-center">
        <TerminalLoader
          currentStep={generationStep}
          taskProgress={taskProgress}
          projectTitle={title.trim() || undefined}
        />
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/projects" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)]">
          ← Back to projects
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
              Ready to generate detailed blueprint and task board for:
            </p>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-[var(--text-muted)]">
              {type} · {stack.length} stack items · AI-enhanced when configured
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
            <Button onClick={handleGenerate}>[GENERATE]</Button>
          )}
        </div>
      </WizardShell>
    </main>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={
      <main className="p-6">
        <div className="animate-pulse text-[var(--text-muted)]">Loading...</div>
      </main>
    }>
      <NewProjectForm />
    </Suspense>
  );
}
