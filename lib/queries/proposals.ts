import { createClient } from "@/lib/supabase/client";

/** Block type for slide content (PowerPoint-style deck). */
export type ProposalSlideBlockType =
  | "heading"
  | "paragraph"
  | "bullets"
  | "numbered"
  | "image";

export interface ProposalSlideBlock {
  id: string;
  type: ProposalSlideBlockType;
  content: string;
  /** Heading level 1–3 for type "heading" */
  level?: number;
}

/** Normalized slide for the deck (no canvas fields). */
export interface ProposalSlide {
  id: string;
  order: number;
  title: string;
  blocks: ProposalSlideBlock[];
}

/** Raw slide as stored in DB (may be legacy body/elements or new blocks). */
export interface RawProposalSlide {
  id: string;
  order?: number;
  title?: string;
  body?: string;
  blocks?: ProposalSlideBlock[];
  elements?: unknown[];
}

/** Convert a raw slide from DB into normalized ProposalSlide with blocks. */
export function normalizeSlide(raw: RawProposalSlide, index: number): ProposalSlide {
  if (Array.isArray(raw.blocks) && raw.blocks.length >= 0) {
    return {
      id: raw.id,
      order: raw.order ?? index,
      title: typeof raw.title === "string" ? raw.title : "Slide",
      blocks: raw.blocks.map((b) => ({
        id: typeof b.id === "string" ? b.id : `block-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        type: ["heading", "paragraph", "bullets", "numbered", "image"].includes(b.type) ? b.type : "paragraph",
        content: typeof b.content === "string" ? b.content : "",
        level: typeof b.level === "number" ? b.level : undefined,
      })),
    };
  }
  let fallbackContent = "";
  if (typeof raw.body === "string" && raw.body.trim()) {
    fallbackContent = raw.body.trim();
  } else if (Array.isArray(raw.elements) && raw.elements.length > 0) {
    const first = raw.elements[0] as { type?: string; content?: string };
    if (first && typeof first.content === "string") fallbackContent = first.content;
  }
  return {
    id: raw.id,
    order: raw.order ?? index,
    title: typeof raw.title === "string" ? raw.title : "Slide",
    blocks: fallbackContent
      ? [{ id: `block-${raw.id}-0`, type: "paragraph" as const, content: fallbackContent }]
      : [],
  };
}

/** Normalize full slides array from DB (handles legacy and new shape). */
export function normalizeSlides(rawSlides: RawProposalSlide[] | null | undefined): ProposalSlide[] {
  if (!Array.isArray(rawSlides) || rawSlides.length === 0) return [];
  return rawSlides.map((raw, i) => normalizeSlide(raw, i));
}

export interface ProjectCreationPayload {
  title?: string;
  description?: string;
  type?: string;
  client_id?: string | null;
  goals?: string[];
  constraints?: string;
  targetAudience?: string;
}

export interface GeneratedProposalContent {
  objectives?: string[];
  deliverables?: string[];
  timeline?: { phase: string; duration: string; description: string }[];
  budget_estimates?: { item: string; estimate: string; notes?: string }[];
  team_structure?: { role: string; responsibility: string }[];
  success_metrics?: string[];
  executive_summary?: string;
  projectCreationPayload?: ProjectCreationPayload;
}

export interface ProposalRow {
  id: string;
  user_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  type: string;
  stack: string[];
  target_audience: string | null;
  goals: string[];
  constraints: string | null;
  hourly_rate_override: number | null;
  status: string;
  project_id: string | null;
  generated_content: GeneratedProposalContent | null;
  estimated_price: number | null;
  currency: string | null;
  slides?: ProposalSlide[] | null;
  share_token: string | null;
  share_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProposalInsert {
  user_id?: string;
  client_id?: string | null;
  title: string;
  description?: string | null;
  type?: string;
  stack?: string[];
  target_audience?: string | null;
  goals?: string[];
  constraints?: string | null;
  hourly_rate_override?: number | null;
  status?: string;
  project_id?: string | null;
  generated_content?: GeneratedProposalContent | null;
  estimated_price?: number | null;
  currency?: string | null;
  slides?: ProposalSlide[];
  share_token?: string | null;
  share_enabled?: boolean;
}

export interface ProposalFilters {
  clientId?: string;
  status?: string;
}

export async function getProposals(
  filters?: ProposalFilters
): Promise<{ data: ProposalRow[] | null; error: Error | null }> {
  const supabase = createClient();
  let query = supabase
    .from("proposals")
    .select("*, clients(name)")
    .order("updated_at", { ascending: false });
  if (filters?.clientId) {
    query = query.eq("client_id", filters.clientId);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  const { data, error } = await query;
  const rows = data as ProposalRow[] | null;
  if (Array.isArray(rows)) {
    for (const row of rows) {
      if (Array.isArray((row as { slides?: RawProposalSlide[] }).slides)) {
        row.slides = normalizeSlides((row as { slides: RawProposalSlide[] }).slides);
      }
    }
  }
  return { data: rows, error: error as Error | null };
}

export async function getProposal(
  id: string
): Promise<{ data: ProposalRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("*, clients(id, name, email, avatar_colour, hourly_rate, currency)")
    .eq("id", id)
    .single();
  if (data && Array.isArray((data as { slides?: RawProposalSlide[] }).slides)) {
    (data as ProposalRow).slides = normalizeSlides((data as { slides: RawProposalSlide[] }).slides);
  }
  return { data: data as ProposalRow | null, error: error as Error | null };
}

export async function createProposal(
  insert: ProposalInsert
): Promise<{ data: ProposalRow | null; error: Error | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };
  const { data, error } = await supabase
    .from("proposals")
    .insert({ ...insert, user_id: user.id })
    .select()
    .single();
  return { data: data as ProposalRow | null, error: error as Error | null };
}

export async function updateProposal(
  id: string,
  updates: Partial<ProposalInsert>
): Promise<{ data: ProposalRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("proposals")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data: data as ProposalRow | null, error: error as Error | null };
}

export async function deleteProposal(
  id: string
): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("proposals").delete().eq("id", id);
  return { error: error as Error | null };
}
