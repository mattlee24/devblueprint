"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { WizardShell } from "@/components/wizard/WizardShell";
import { StepIdentity } from "@/components/wizard/StepIdentity";
import { StepStack } from "@/components/wizard/StepStack";
import { TerminalLoader, type GenerationStep } from "@/components/wizard/TerminalLoader";
import { GenerationPreview } from "@/components/wizard/GenerationPreview";
import { Button } from "@/components/ui/Button";
import type { Blueprint } from "@/lib/types";
import type { TaskTemplate } from "@/lib/types";
import type { ProjectInput } from "@/lib/types";
import { getClients } from "@/lib/queries/clients";
import { getProposal, updateProposal } from "@/lib/queries/proposals";
import { createProject, type BoardConfig } from "@/lib/queries/projects";
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
  const defaultBoardConfig: BoardConfig = {
    columnOrder: ["todo", "in_progress", "in_review", "done"],
    columnLabels: { todo: "To do", in_progress: "In progress", in_review: "In review", done: "Done" },
  };
  const [previewReady, setPreviewReady] = useState<{
    blueprint: Blueprint;
    tasks: TaskTemplate[];
    input: ProjectInput;
    board_config?: BoardConfig | null;
    rawResponse?: string | null;
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
      const payload = (p.generated_content as { projectCreationPayload?: Record<string, unknown> } | null)?.projectCreationPayload;
      if (payload && typeof payload === "object") {
        if (typeof payload.title === "string") setTitle(payload.title);
        if (typeof payload.description === "string") setDescription(payload.description);
        if (typeof payload.type === "string" && ["website", "web_application", "mobile_app", "api", "cli", "other"].includes(payload.type)) setType(payload.type as ProjectType);
        if (payload.client_id != null) setClientId(String(payload.client_id));
        if (Array.isArray(payload.goals)) setGoals(payload.goals.map(String));
        if (typeof payload.constraints === "string") setConstraints(payload.constraints);
        if (typeof payload.targetAudience === "string") setTargetAudience(payload.targetAudience);
      }
    });
  }, [fromProposalId]);

  function toggleStack(value: string) {
    setStack((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  const fromProposal = !!fromProposalId;
  const steps = fromProposal ? ["STACK", "GENERATE"] : ["IDENTITY", "STACK", "GENERATE"];
  const canNext = fromProposal
    ? step === 0
      ? stack.length > 0
      : true
    : step === 0
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

      let board_config: BoardConfig | undefined = data?.board_config && typeof data.board_config === "object" && Array.isArray((data.board_config as BoardConfig).columnOrder)
        ? (data.board_config as BoardConfig)
        : undefined;

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
        if (!board_config) board_config = defaultBoardConfig;
        setGeneratedCounts({
          features: blueprint.coreFeatures?.length ?? 0,
          tasks: tasks.length,
        });
      }
      if (!board_config) board_config = defaultBoardConfig;
      setGenerationStep("validating");
      await new Promise((r) => setTimeout(r, 800));
      setPreviewReady({ blueprint, tasks, input, board_config, rawResponse, fullApiResponse });
      setGenerating(false);
      return;
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

    setPreviewReady({ blueprint, tasks, input, board_config: defaultBoardConfig, rawResponse, fullApiResponse });
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

    const { blueprint, tasks, input, board_config } = data;

    const { data: project, error } = await createProject({
      title: input.title,
      description: input.description,
      type: input.type,
      client_id: clientId || null,
      status: "active",
      stack: input.stack,
      blueprint: blueprint as unknown as Record<string, unknown>,
      user_flow: null,
      board_config: board_config ?? defaultBoardConfig,
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

  const generateStepIndex = steps.length - 1;
  return (
    <main className="p-6">
      <div className="mb-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition"
        >
          ← Back to projects
        </Link>
      </div>
      <div className="max-w-2xl mx-auto rounded-2xl border border-neutral-200 bg-white shadow-sm px-8 py-8">
        <WizardShell step={step} steps={steps}>
          {!fromProposal && step === 0 && (
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
          {(fromProposal && step === 0) || (!fromProposal && step === 1) ? (
            <StepStack type={type} selected={stack} onToggle={toggleStack} />
          ) : null}
          {step === generateStepIndex && (
            <div className="space-y-4">
              <p className="text-neutral-600">
                Ready to generate detailed blueprint and task board for:
              </p>
              <p className="font-medium text-neutral-900">{title}</p>
              <p className="text-sm text-neutral-500">
                {type} · {stack.length} stack items · AI-enhanced when configured
              </p>
            </div>
          )}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-100 mt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className={
                step === 0
                  ? "px-4 py-2 text-neutral-300 cursor-not-allowed text-sm"
                  : "px-4 py-2 text-neutral-600 hover:text-neutral-900 text-sm flex items-center gap-1.5 transition"
              }
            >
              Back
            </button>
            {step < generateStepIndex ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext}
                className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg text-sm transition disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg text-sm transition"
              >
                Generate
              </button>
            )}
          </div>
        </WizardShell>
      </div>
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
