import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ProposalSlide, ProposalSlideBlock } from "@/lib/queries/proposals";

const SLIDE_TITLES = [
  "[Project] Proposal",
  "Project overview",
  "Your investment",
  "Optional add-ons",
  "Terms & conditions 1",
  "Terms & conditions 2",
  "Terms & conditions 3",
  "Acceptance",
  "Thank you",
];

const MIN_SLIDES = 9;

function toBlocks(raw: { type?: string; content?: string }[] | string | undefined): ProposalSlideBlock[] {
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((b, i) => ({
      id: `block-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 9)}`,
      type: ["heading", "paragraph", "bullets", "numbered", "image"].includes(b.type as string) ? (b.type as ProposalSlideBlock["type"]) : "paragraph",
      content: typeof b.content === "string" ? b.content : "",
    }));
  }
  if (typeof raw === "string" && raw.trim()) {
    return [{ id: `block-${Date.now()}-0`, type: "paragraph", content: raw.trim() }];
  }
  return [];
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

  let body: { title: string; description: string; clientId?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { title, description, clientId } = body;
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
    systemInstruction: `You are an expert project consultant. Given a project title and description, you produce a proposal with at least 9 slides. Each slide has a title and a "blocks" array. Each block has "type" (one of: "heading", "paragraph", "bullets") and "content" (string). For "bullets", content is newline-separated bullet points. Slide titles in order:
1. "[Project] Proposal" — one short paragraph block (e.g. "Proposal for [Project Name]")
2. "Project overview" — 2-3 paragraph blocks summarizing scope, goals, and approach
3. "Your investment" — paragraph and/or bullets: pricing summary, payment structure, total estimate in GBP
4. "Optional add-ons" — bullets: 3-6 optional extras with brief descriptions and ballpark costs
5. "Terms & conditions 1" — paragraph/bullets: payment terms (invoices, due dates, deposit, late payment)
6. "Terms & conditions 2" — paragraph/bullets: IP and confidentiality
7. "Terms & conditions 3" — paragraph/bullets: change orders and scope
8. "Acceptance" — paragraph: how to accept (sign, email, next steps)
9. "Thank you" — one short paragraph: closing (thank you, contact)

Also output projectCreationPayload: { title, description, type (website|web_application|mobile_app|api|cli|other), goals (array), constraints, targetAudience }. Use clientId only if provided.

Respond with a single JSON object (no markdown, no code fence):
{
  "slides": [
    { "title": "[Project] Proposal", "blocks": [{"type": "paragraph", "content": "string"}] },
    ... (at least 9 items, titles as above; each slide has "blocks" array of {"type": "heading"|\"paragraph\"|\"bullets\", "content": "string"})
  ],
  "projectCreationPayload": { "title": "string", "description": "string", "type": "string", "goals": ["string"], "constraints": "string", "targetAudience": "string" },
  "estimated_total": number
}
estimated_total is the total project cost in GBP (number only). You may also use "body" as a string per slide instead of "blocks"; we will convert it to one paragraph block.`,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
      maxOutputTokens: 8192,
    },
  });

  const userPrompt = `Project title: ${title}

Project description:
${description}
${clientId ? `\nClient ID (include in projectCreationPayload if relevant): ${clientId}` : ""}

Output the single JSON object with slides (at least 9 items, each with title and blocks array), projectCreationPayload, and estimated_total.`;

  try {
    const result = await model.generateContent(userPrompt);
    const response = result.response;
    if (!response) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 500 });
    }
    let content = response.text();
    const jsonMatch = content.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
    if (jsonMatch) content = jsonMatch[1].trim();
    const parsed = JSON.parse(content) as {
      slides?: { title?: string; body?: string; blocks?: { type?: string; content?: string }[] }[];
      projectCreationPayload?: Record<string, unknown>;
      estimated_total?: number;
    };

    const rawSlides = Array.isArray(parsed.slides) ? parsed.slides : [];
    const ts = Date.now();
    const slides: ProposalSlide[] = [];
    for (let i = 0; i < Math.max(MIN_SLIDES, rawSlides.length); i++) {
      const raw = rawSlides[i];
      const defaultTitle = SLIDE_TITLES[i] ?? `Slide ${i + 1}`;
      const blocks = toBlocks(raw?.blocks ?? raw?.body);
      slides.push({
        id: `slide-${i}-${ts}`,
        order: i,
        title: typeof raw?.title === "string" ? raw.title : defaultTitle,
        blocks,
      });
    }

    const payload = parsed.projectCreationPayload;
    const projectCreationPayload =
      payload && typeof payload === "object"
        ? {
            title: typeof payload.title === "string" ? payload.title : title,
            description: typeof payload.description === "string" ? payload.description : description,
            type: typeof payload.type === "string" ? payload.type : "website",
            client_id: clientId ?? payload.client_id ?? null,
            goals: Array.isArray(payload.goals) ? payload.goals.map(String) : [],
            constraints: typeof payload.constraints === "string" ? payload.constraints : "",
            targetAudience: typeof payload.targetAudience === "string" ? payload.targetAudience : "",
          }
        : {
            title,
            description,
            type: "website" as const,
            client_id: clientId ?? null,
            goals: [] as string[],
            constraints: "",
            targetAudience: "",
          };

    const estimated_total =
      typeof parsed.estimated_total === "number" && Number.isFinite(parsed.estimated_total)
        ? parsed.estimated_total
        : undefined;

    return NextResponse.json({
      slides,
      projectCreationPayload,
      estimated_total,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
