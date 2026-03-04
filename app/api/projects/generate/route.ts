import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateBlueprint as generateBlueprintFallback } from "@/lib/blueprintEngine";
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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI generation not configured (missing GEMINI_API_KEY)", fallback: true },
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

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelId = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: `You are a senior PM and solutions architect. Given a project brief, you produce a comprehensive project blueprint and task list. Output must be detailed and complete—never a short summary.

CRITICAL MINIMUM COUNTS (your response is invalid if you output fewer):
- coreFeatures: MINIMUM 12 items, target 15–25. Break the product into distinct features (e.g. Auth, Search, Filters, Cart, Checkout, Notifications, Admin dashboard, Profile, Reviews, etc.). One or two features is wrong.
- tasks: MINIMUM 25 items, target 30–55. Every feature and phase must map to concrete tasks.
- milestones: 4–8 phases.
- riskFactors: 5–12 items.
- technicalRequirements: 15–30 items.
- featureDependencies: 3–15 pairs.
- integrations: 3–10 items.

BLUEPRINT REQUIREMENTS:

1. CORE FEATURES: You MUST output at least 12 features (aim for 15–25). Each feature: name, type ("core"|"nice-to-have"|"advanced"), effort (e.g. "~2d"), description (2–4 sentences), userStories (1–4 items). Think through the full product: auth, listing, search, filters, cart, checkout, payments, profile, notifications, admin, content, SEO, analytics, etc.

2. MILESTONES: 4–8 phases (e.g. Discovery, Design, Build, QA, Launch) with name, description, target.

3. RISK FACTORS: 5–12 risks with level, description, mitigation.

4. FEATURE DEPENDENCIES: 3–15 pairs (e.g. "Checkout" depends on "Auth", "Cart").

5. INTEGRATIONS: 3–10 third-party tools with name and purpose.

6. TECHNICAL REQUIREMENTS: 15–30 items.

7. SUMMARY: One short paragraph summarizing the blueprint (no scores).

Respond with a single JSON object only (no markdown, no code fence). Schema:
{
  "blueprint": {
    "technicalRequirements": [{"text": "string"}],
    "coreFeatures": [{"name": "string", "type": "core"|"nice-to-have"|"advanced", "effort": "string", "description": "string", "userStories": ["string"]}],
    "milestones": [{"name": "string", "description": "string", "target": "string or null"}],
    "riskFactors": [{"level": "low"|"medium"|"high", "description": "string", "mitigation": "string"}],
    "featureDependencies": [{"feature": "string", "dependsOn": "string"}],
    "integrations": [{"name": "string", "purpose": "string"}],
    "suggestedImprovements": ["string"],
    "summary": "string"
  },
  "tasks": [{"title": "string", "description": "string or null", "status": "todo", "priority": "p1"|"p2"|"p3", "category": "dev"|"design"|"content"|"seo"|"devops"|"testing"|"other", "effort": "low"|"medium"|"high"}]
}

Again: coreFeatures must have at least 12 entries. tasks must have at least 25 entries. Be thorough and project-specific.`,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
      maxOutputTokens: 16384,
    },
  });

  const userPrompt = `Project:
Title: ${title}
Type: ${type}
Stack: ${stack.join(", ")}
Description: ${description}
${targetAudience ? `Target audience: ${targetAudience}` : ""}
${goals.length ? `Goals: ${goals.join("; ")}` : ""}
${constraints ? `Constraints: ${constraints}` : ""}

Return a single JSON object only. You must include at least 12 items in coreFeatures and at least 25 items in tasks.`;

  try {
    const result = await model.generateContent(userPrompt);
    const response = result.response;
    if (!response) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 500 });
    }
    let content = response.text();
    // Strip markdown code fence if present
    const jsonMatch = content.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
    if (jsonMatch) content = jsonMatch[1].trim();
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
        ? (rawBlueprint.coreFeatures as Array<{ name?: string; type?: string; effort?: string; description?: string; userStories?: string[] }>).map((f) => ({
            name: typeof f?.name === "string" ? f.name : "Feature",
            type: ["core", "nice-to-have", "advanced"].includes(f?.type ?? "") ? f!.type as "core" | "nice-to-have" | "advanced" : "core",
            effort: typeof f?.effort === "string" ? f.effort : "medium",
            description: typeof f?.description === "string" && f.description.trim() ? f.description.trim() : undefined,
            userStories: Array.isArray(f?.userStories) ? (f.userStories as string[]).filter((s) => typeof s === "string") : undefined,
          }))
        : [],
      milestones: Array.isArray(rawBlueprint.milestones)
        ? (rawBlueprint.milestones as Array<{ name?: string; description?: string; target?: string }>).map((m) => ({
            name: typeof m?.name === "string" ? m.name : "Phase",
            description: typeof m?.description === "string" ? m.description : "",
            target: typeof m?.target === "string" && m.target.trim() ? m.target : undefined,
          }))
        : undefined,
      riskFactors: Array.isArray(rawBlueprint.riskFactors)
        ? (rawBlueprint.riskFactors as Array<{ level?: string; description?: string; mitigation?: string }>).map((r) => ({
            level: ["low", "medium", "high"].includes(r?.level ?? "") ? r!.level as "low" | "medium" | "high" : "low",
            description: typeof r?.description === "string" ? r.description : "",
            mitigation: typeof r?.mitigation === "string" && r.mitigation.trim() ? r.mitigation : undefined,
          }))
        : [],
      featureDependencies: Array.isArray(rawBlueprint.featureDependencies)
        ? (rawBlueprint.featureDependencies as Array<{ feature?: string; dependsOn?: string }>)
            .filter((d) => typeof d?.feature === "string" && typeof d?.dependsOn === "string")
            .map((d) => ({ feature: d!.feature!, dependsOn: d!.dependsOn! }))
        : undefined,
      integrations: Array.isArray(rawBlueprint.integrations)
        ? (rawBlueprint.integrations as Array<{ name?: string; purpose?: string }>)
            .filter((i) => typeof i?.name === "string")
            .map((i) => ({ name: i!.name!, purpose: typeof i?.purpose === "string" ? i.purpose : "" }))
        : undefined,
      suggestedImprovements: Array.isArray(rawBlueprint.suggestedImprovements)
        ? (rawBlueprint.suggestedImprovements as unknown[]).map((s) => String(s))
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

    // If AI returned fewer than 12 features, pad with rule-based features so we always have enough
    const minFeatures = 12;
    if (blueprint.coreFeatures.length < minFeatures) {
      const fallback = generateBlueprintFallback(body);
      const seen = new Set(blueprint.coreFeatures.map((f) => f.name.toLowerCase().trim()));
      for (const f of fallback.coreFeatures) {
        if (blueprint.coreFeatures.length >= minFeatures) break;
        const key = f.name.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          blueprint.coreFeatures.push(f);
        }
      }
      // If still short, derive features from task titles (e.g. "Implement: X" -> feature "X")
      for (const t of tasks) {
        if (blueprint.coreFeatures.length >= minFeatures) break;
        const name = (t.title.replace(/^Implement:\s*/i, "").trim() || t.title).slice(0, 80);
        const key = name.toLowerCase().trim();
        if (!seen.has(key) && name.length > 2) {
          seen.add(key);
          blueprint.coreFeatures.push({
            name,
            type: "core",
            effort: t.effort === "high" ? "~3d" : t.effort === "low" ? "~0.5d" : "~1d",
            description: t.description ?? undefined,
          });
        }
      }
    }

    const payload = { blueprint, tasks, rawResponse: content };
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    const is429 = typeof message === "string" && (message.includes("429") || message.includes("Too Many Requests") || message.includes("quota"));
    if (is429) {
      return NextResponse.json(
        {
          error: "Gemini rate limit exceeded. Wait a minute or try again later. Your project will use the built-in blueprint generator instead.",
          fallback: true,
          code: "RATE_LIMIT",
        },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
