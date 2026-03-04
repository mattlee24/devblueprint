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
import { GenerationPreview } from "@/components/wizard/GenerationPreview";
import { Button } from "@/components/ui/Button";
import type { Blueprint } from "@/lib/types";
import type { TaskTemplate } from "@/lib/types";
import type { ProjectInput } from "@/lib/types";
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
  const [generationStep, setGenerationStep] = useState<GenerationStep>("preparing");
  const [taskProgress, setTaskProgress] = useState<{ current: number; total: number } | undefined>();
  const [blueprintPhase, setBlueprintPhase] = useState<string>("");
  const [generatedCounts, setGeneratedCounts] = useState<{ features?: number; tasks?: number } | undefined>();
  const [previewReady, setPreviewReady] = useState<{
    blueprint: Blueprint;
    tasks: TaskTemplate[];
    input: ProjectInput;
    rawResponse?: string | null;
    /** Full JSON body from API when rawResponse is missing (for debugging) */
    fullApiResponse?: string | null;
  } | null>(null);
  const [creating, setCreating] = useState(false);
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
      setClientId(p.client_id ?? "");
      // Type, stack, goals, etc. are only set when formally creating a project — not from proposal
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

  const BLUEPRINT_PHASES = [
    "Contacting AI…",
    "Analyzing project scope…",
    "Drafting features & milestones…",
    "Generating risk analysis…",
    "Building feature dependencies…",
    "Building task list (25–55 tasks)…",
    "Validating structure…",
    "Finalizing blueprint…",
  ];

  async function handleGenerate() {
    setPreviewReady(null);
    setGenerating(true);
    setGenerationStep("preparing");
    setTaskProgress(undefined);
    setGeneratedCounts(undefined);

    const input: ProjectInput = {
      title: title.trim(),
      description: description.trim(),
      type,
      stack,
      goals,
      constraints,
      targetAudience,
    };

    await new Promise((r) => setTimeout(r, 400));
    setGenerationStep("analyzing");
    await new Promise((r) => setTimeout(r, 500));

    let blueprint: Blueprint;
    let tasks: TaskTemplate[];
    let rawResponse: string | undefined;
    let fullApiResponse: string | undefined;

    setGenerationStep("blueprint");
    setBlueprintPhase(BLUEPRINT_PHASES[0] ?? "");
    let phaseIndex = 0;
    const phaseInterval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % BLUEPRINT_PHASES.length;
      setBlueprintPhase(BLUEPRINT_PHASES[phaseIndex] ?? "");
    }, 2600);

    try {
      const res = await fetch("/api/projects/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      clearInterval(phaseInterval);
      setBlueprintPhase("");
      rawResponse = typeof data.rawResponse === "string" ? data.rawResponse : undefined;
      fullApiResponse = JSON.stringify(data, null, 2);

      if (res.status === 429 || data.code === "RATE_LIMIT") {
        toast.warning(data.error ?? "Rate limit exceeded. Using built-in generator.");
      }

      const aiFeatures = data.blueprint?.coreFeatures?.length ?? 0;
      const aiTasks = Array.isArray(data.tasks) ? data.tasks.length : 0;
      const useAi = res.ok && data.blueprint && Array.isArray(data.tasks) && aiFeatures >= 12 && aiTasks >= 25;

      if (useAi) {
        blueprint = data.blueprint as Blueprint;
        tasks = data.tasks as TaskTemplate[];
        setGeneratedCounts({
          features: blueprint.coreFeatures?.length ?? 0,
          tasks: tasks.length,
        });
      } else {
        blueprint = generateBlueprint(input) as Blueprint;
        tasks = generateTasks(input, blueprint) as TaskTemplate[];
        setGeneratedCounts({
          features: blueprint.coreFeatures?.length ?? 0,
          tasks: tasks.length,
        });
      }
    } catch {
      clearInterval(phaseInterval);
      setBlueprintPhase("");
      blueprint = generateBlueprint(input) as Blueprint;
      tasks = generateTasks(input, blueprint) as TaskTemplate[];
      setGeneratedCounts({
        features: blueprint.coreFeatures?.length ?? 0,
        tasks: tasks.length,
      });
      fullApiResponse = undefined;
    }

    setGenerationStep("validating");
    await new Promise((r) => setTimeout(r, 800));

    setPreviewReady({ blueprint, tasks, input, rawResponse, fullApiResponse });
    setGenerating(false);
  }

  async function handleCreateProject() {
    const data = previewReady;
    if (!data) return;
    setPreviewReady(null);
    setCreating(true);
    setGenerating(true);
    setGenerationStep("creating_project");
    setTaskProgress(undefined);

    const { blueprint, tasks, input } = data;

    const { data: project, error } = await createProject({
      title: input.title,
      description: input.description,
      type: input.type,
      client_id: clientId || null,
      status: "active",
      stack: input.stack,
      blueprint: blueprint as unknown as Record<string, unknown>,
      overall_score: blueprint.overallScore,
      user_flow: null,
      board_config: { columnOrder: ["todo", "in_progress", "in_review", "done"] },
    });

    if (error || !project) {
      toast.error(error?.message ?? "Failed to create project");
      setGenerating(false);
      setCreating(false);
      setPreviewReady(data);
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
    setCreating(false);
    toast.success("Project created");
    router.push(`/projects/${project.id}`);
    router.refresh();
  }

  function handleGenerateAgain() {
    setPreviewReady(null);
    handleGenerate();
  }

  if (previewReady) {
    return (
      <main className="p-6 min-h-[60vh] flex flex-col justify-center">
        <div className="mb-6">
          <Link href="/projects" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]">
            ← Back to projects
          </Link>
        </div>
        <GenerationPreview
          projectTitle={previewReady.input.title}
          blueprint={previewReady.blueprint}
          tasks={previewReady.tasks}
          input={previewReady.input}
          rawResponse={previewReady.rawResponse}
          fullApiResponse={previewReady.fullApiResponse}
          onConfirm={handleCreateProject}
          onGenerateAgain={handleGenerateAgain}
          isCreating={creating}
        />
      </main>
    );
  }

  if (generating) {
    return (
      <main className="p-6 min-h-[60vh] flex flex-col justify-center">
        <TerminalLoader
          currentStep={generationStep}
          taskProgress={taskProgress}
          projectTitle={title.trim() || undefined}
          blueprintPhase={blueprintPhase || undefined}
          generatedCounts={generatedCounts}
        />
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/projects" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]">
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
            <Button onClick={handleGenerate}>Generate</Button>
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
