import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import type { Blueprint, TaskTemplate, ProjectInput } from "@/lib/types";

const TASK_STATUSES = ["backlog", "todo", "in_progress", "in_review", "done"] as const;
const TASK_PRIORITIES = ["p1", "p2", "p3"] as const;
const TASK_CATEGORIES = ["dev", "design", "content", "seo", "devops", "testing", "other"] as const;
const TASK_EFFORTS = ["low", "medium", "high"] as const;

function coerceTask(raw: Record<string, unknown>, position: number): TaskTemplate {
  const rawStatus = raw.status as TaskTemplate["status"] | undefined;
  const status = rawStatus === "backlog" ? "todo" : (TASK_STATUSES.includes(rawStatus ?? "todo") ? (rawStatus as TaskTemplate["status"]) : "todo");
  return {
    title: typeof raw.title === "string" ? raw.title : "Task",
    description: typeof raw.description === "string" ? raw.description : undefined,
    status,
    priority: TASK_PRIORITIES.includes((raw.priority as TaskTemplate["priority"]) ?? "p2") ? (raw.priority as TaskTemplate["priority"]) : "p2",
    category: TASK_CATEGORIES.includes((raw.category as TaskTemplate["category"]) ?? "dev") ? (raw.category as TaskTemplate["category"]) : "dev",
    effort: TASK_EFFORTS.includes((raw.effort as TaskTemplate["effort"]) ?? "medium") ? (raw.effort as TaskTemplate["effort"]) : "medium",
    position,
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI generation not configured (missing OPENAI_API_KEY)", fallback: true },
      { status: 503 }
    );
  }

  let body: ProjectInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { title, description, type, stack, goals = [], constraints = "", targetAudience = "" } = body;
  if (!title?.trim() || !description?.trim() || !type || !Array.isArray(stack) || stack.length === 0) {
    return NextResponse.json({ error: "Missing required fields: title, description, type, stack" }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `You are an expert technical project planner. Given a project brief (title, description, type, stack, goals, audience, constraints), you produce:
1. A detailed blueprint with special attention to core features: each feature must be specific to this project, well-rounded, and include a clear description.
2. A detailed, ordered list of tasks (title, optional description, status must be "todo" for every task, priority p1/p2/p3, category, effort low/medium/high).

CORE FEATURES: Produce a large, well-rounded list (18-35 items) that directly reflects the project brief. For each feature include:
- name: short title (e.g. "User authentication and role-based access")
- type: "core" (must-have), "nice-to-have", or "advanced"
- effort: realistic estimate (e.g. "~2d", "~1w", "~4h")
- description: 2-4 sentences explaining what the feature is, why it matters for this specific project, and how it supports the stated goals/audience. Be concrete and project-specific—no generic filler.

Derive features from: the project description, stated goals, target audience, constraints, and the chosen tech stack. Cover functional areas (auth, content, UX, integrations, performance, SEO, etc.) as relevant. Every feature should be justified by the brief.

Respond with a single JSON object of this exact shape (no markdown, no code fence):
{
  "blueprint": {
    "technicalRequirements": [{"text": "string"}],
    "feasibility": {
      "technicalComplexity": number 1-10,
      "resourceRequirements": number 1-10,
      "timeToMarket": number 1-10,
      "scalabilityPotential": number 1-10,
      "overallVerdict": "low" | "medium" | "high",
      "summary": "string"
    },
    "coreFeatures": [
      {
        "name": "string",
        "type": "core" | "nice-to-have" | "advanced",
        "effort": "string e.g. ~2d",
        "description": "string (2-4 sentences, project-specific)"
      }
    ],
    "suggestedImprovements": ["string"],
    "riskFactors": [{"level": "low"|"medium"|"high", "description": "string"}],
    "scores": {
      "clarityOfScope": number 1-10,
      "technicalFeasibility": number 1-10,
      "featureCompleteness": number 1-10,
      "riskProfile": number 1-10
    },
    "overallScore": number 0-10,
    "summary": "string"
  },
  "tasks": [
    {"title": "string", "description": "string or null", "status": "todo", "priority": "p1"|"p2"|"p3", "category": "dev"|"design"|"content"|"seo"|"devops"|"testing"|"other", "effort": "low"|"medium"|"high"}
  ]
}

Be very thorough: 15-30 technical requirements, 18-35 detailed core features (each with a substantive description), 8-15 suggested improvements, 5-12 risk factors. Tasks: 25-55 items, granular and specific to the project and stack, in logical order. Every task must have "status": "todo" (no backlog).`;

  const userPrompt = `Project:
Title: ${title}
Type: ${type}
Stack: ${stack.join(", ")}
Description: ${description}
${targetAudience ? `Target audience: ${targetAudience}` : ""}
${goals.length ? `Goals: ${goals.join("; ")}` : ""}
${constraints ? `Constraints: ${constraints}` : ""}

Output the single JSON object only.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 500 });
    }

    const parsed = JSON.parse(content) as { blueprint?: unknown; tasks?: unknown[] };
    const rawBlueprint = parsed.blueprint as Record<string, unknown> | undefined;
    const rawTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];

    if (!rawBlueprint || typeof rawBlueprint !== "object") {
      return NextResponse.json({ error: "Invalid blueprint in AI response" }, { status: 500 });
    }

    const blueprint: Blueprint = {
      technicalRequirements: Array.isArray(rawBlueprint.technicalRequirements)
        ? (rawBlueprint.technicalRequirements as { text: string }[]).map((r) => ({ text: typeof r?.text === "string" ? r.text : String(r) }))
        : [],
      feasibility: {
        technicalComplexity: typeof rawBlueprint.feasibility === "object" && rawBlueprint.feasibility !== null
          ? Math.min(10, Math.max(0, Number((rawBlueprint.feasibility as Record<string, unknown>).technicalComplexity) || 5))
          : 5,
        resourceRequirements: typeof rawBlueprint.feasibility === "object" && rawBlueprint.feasibility !== null
          ? Math.min(10, Math.max(0, Number((rawBlueprint.feasibility as Record<string, unknown>).resourceRequirements) || 5))
          : 5,
        timeToMarket: typeof rawBlueprint.feasibility === "object" && rawBlueprint.feasibility !== null
          ? Math.min(10, Math.max(0, Number((rawBlueprint.feasibility as Record<string, unknown>).timeToMarket) || 5))
          : 5,
        scalabilityPotential: typeof rawBlueprint.feasibility === "object" && rawBlueprint.feasibility !== null
          ? Math.min(10, Math.max(0, Number((rawBlueprint.feasibility as Record<string, unknown>).scalabilityPotential) || 5))
          : 5,
        overallVerdict: ["low", "medium", "high"].includes((rawBlueprint.feasibility as Record<string, unknown>)?.overallVerdict as string)
          ? (rawBlueprint.feasibility as Record<string, unknown>).overallVerdict as "low" | "medium" | "high"
          : "medium",
        summary: typeof (rawBlueprint.feasibility as Record<string, unknown>)?.summary === "string"
          ? (rawBlueprint.feasibility as Record<string, unknown>).summary as string
          : "Project feasibility assessed.",
      },
      coreFeatures: Array.isArray(rawBlueprint.coreFeatures)
        ? (rawBlueprint.coreFeatures as Array<{ name?: string; type?: string; effort?: string; description?: string }>).map((f) => ({
            name: typeof f?.name === "string" ? f.name : "Feature",
            type: ["core", "nice-to-have", "advanced"].includes(f?.type ?? "") ? f!.type as "core" | "nice-to-have" | "advanced" : "core",
            effort: typeof f?.effort === "string" ? f.effort : "medium",
            description: typeof f?.description === "string" && f.description.trim() ? f.description.trim() : undefined,
          }))
        : [],
      suggestedImprovements: Array.isArray(rawBlueprint.suggestedImprovements)
        ? (rawBlueprint.suggestedImprovements as unknown[]).map((s) => String(s))
        : [],
      riskFactors: Array.isArray(rawBlueprint.riskFactors)
        ? (rawBlueprint.riskFactors as Array<{ level?: string; description?: string }>).map((r) => ({
            level: ["low", "medium", "high"].includes(r?.level ?? "") ? r!.level as "low" | "medium" | "high" : "low",
            description: typeof r?.description === "string" ? r.description : "",
          }))
        : [],
      scores: {
        clarityOfScope: Math.min(10, Math.max(0, Number((rawBlueprint.scores as Record<string, unknown>)?.clarityOfScope) || 6)),
        technicalFeasibility: Math.min(10, Math.max(0, Number((rawBlueprint.scores as Record<string, unknown>)?.technicalFeasibility) || 6)),
        featureCompleteness: Math.min(10, Math.max(0, Number((rawBlueprint.scores as Record<string, unknown>)?.featureCompleteness) || 6)),
        riskProfile: Math.min(10, Math.max(0, Number((rawBlueprint.scores as Record<string, unknown>)?.riskProfile) || 6)),
      },
      overallScore: Math.min(10, Math.max(0, Number(rawBlueprint.overallScore) || 6)),
      summary: typeof rawBlueprint.summary === "string" ? rawBlueprint.summary : "Blueprint generated.",
    };

    const tasks: TaskTemplate[] = rawTasks.map((t, i) => coerceTask(t as Record<string, unknown>, i));

    return NextResponse.json({ blueprint, tasks });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
