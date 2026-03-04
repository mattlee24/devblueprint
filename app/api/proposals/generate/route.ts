import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeneratedProposalContent {
  objectives: string[];
  deliverables: string[];
  timeline: { phase: string; duration: string; description: string }[];
  budget_estimates: { item: string; estimate: string; notes?: string }[];
  team_structure: { role: string; responsibility: string }[];
  success_metrics: string[];
  executive_summary?: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI generation not configured (missing GEMINI_API_KEY)" },
      { status: 503 }
    );
  }

  let body: { title: string; description: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { title, description } = body;
  if (!title?.trim() || !description?.trim()) {
    return NextResponse.json(
      { error: "Missing required fields: title, description" },
      { status: 400 }
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelId = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: `You are an expert project consultant. Given only a project title and description, you produce a fully detailed, professional project proposal document that could serve as a project kickoff document. The proposal must be polished and client-ready.

Generate a comprehensive proposal including:
1. **Objectives** (4-8 clear, measurable project objectives)
2. **Deliverables** (6-12 concrete deliverables with brief descriptions)
3. **Timeline** (4-8 phases with duration and description, e.g. Discovery, Design, Development, QA, Launch)
4. **Budget estimates** (4-8 line items: e.g. Discovery & planning, Design, Development, QA, Project management, Contingency — with estimates in days or ranges and optional notes)
5. **Team structure** (3-6 roles with responsibilities, e.g. Project Lead, Designer, Developer, QA)
6. **Success metrics** (4-8 measurable outcomes)
7. **Executive summary** (2-4 sentences summarizing the proposal)
8. **estimated_total** (a single number: the total project cost in GBP based on your budget_estimates; e.g. 12500 or 25000. No currency symbol, just the number)

Be specific to the project described. Use professional language. Do not mention tech stack, tools, or implementation details—those are out of scope for this proposal.

Respond with a single JSON object of this exact shape (no markdown, no code fence):
{
  "objectives": ["string"],
  "deliverables": ["string"],
  "timeline": [{"phase": "string", "duration": "string", "description": "string"}],
  "budget_estimates": [{"item": "string", "estimate": "string", "notes": "string or null"}],
  "team_structure": [{"role": "string", "responsibility": "string"}],
  "success_metrics": ["string"],
  "executive_summary": "string",
  "estimated_total": number
}`,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  });

  const userPrompt = `Project title: ${title}

Project description:
${description}

Output the single JSON object only.`;

  try {
    const result = await model.generateContent(userPrompt);
    const response = result.response;
    if (!response) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 500 });
    }
    let content = response.text();
    const jsonMatch = content.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
    if (jsonMatch) content = jsonMatch[1].trim();
    const parsed = JSON.parse(content) as Record<string, unknown>;
    const generated: GeneratedProposalContent = {
      objectives: Array.isArray(parsed.objectives) ? (parsed.objectives as string[]) : [],
      deliverables: Array.isArray(parsed.deliverables) ? (parsed.deliverables as string[]) : [],
      timeline: Array.isArray(parsed.timeline)
        ? (parsed.timeline as { phase: string; duration: string; description: string }[])
        : [],
      budget_estimates: Array.isArray(parsed.budget_estimates)
        ? (parsed.budget_estimates as { item: string; estimate: string; notes?: string }[])
        : [],
      team_structure: Array.isArray(parsed.team_structure)
        ? (parsed.team_structure as { role: string; responsibility: string }[])
        : [],
      success_metrics: Array.isArray(parsed.success_metrics) ? (parsed.success_metrics as string[]) : [],
      executive_summary: typeof parsed.executive_summary === "string" ? parsed.executive_summary : undefined,
    };

    const estimated_total =
      typeof parsed.estimated_total === "number" && Number.isFinite(parsed.estimated_total)
        ? parsed.estimated_total
        : undefined;

    return NextResponse.json({ generated, estimated_total });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
