import { createClient } from "@/lib/supabase/client";

export interface GeneratedProposalContent {
  objectives?: string[];
  deliverables?: string[];
  timeline?: { phase: string; duration: string; description: string }[];
  budget_estimates?: { item: string; estimate: string; notes?: string }[];
  team_structure?: { role: string; responsibility: string }[];
  success_metrics?: string[];
  executive_summary?: string;
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
  return { data: data as ProposalRow[] | null, error: error as Error | null };
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
