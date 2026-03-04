import { createClient } from "@/lib/supabase/client";

export interface BoardConfigOption {
  value: string;
  label: string;
}

export interface BoardConfig {
  columnOrder?: string[];
  columnLabels?: Record<string, string>;
  categories?: BoardConfigOption[];
  priorities?: BoardConfigOption[];
}

export interface ProjectRow {
  id: string;
  user_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  type: string;
  status: string;
  stack: string[];
  blueprint: Record<string, unknown> | null;
  overall_score: number | null;
  notes: string | null;
  user_flow: Record<string, unknown> | null;
  banner_url: string | null;
  board_config?: BoardConfig | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectInsert {
  user_id?: string;
  client_id?: string | null;
  title: string;
  description?: string | null;
  type: string;
  status?: string;
  stack?: string[];
  blueprint?: Record<string, unknown> | null;
  overall_score?: number | null;
  notes?: string | null;
  user_flow?: Record<string, unknown> | null;
  banner_url?: string | null;
  board_config?: BoardConfig | null;
}

export async function getProjects(): Promise<{ data: ProjectRow[] | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, clients(name)")
    .order("created_at", { ascending: false });
  return { data: data as ProjectRow[] | null, error: error as Error | null };
}

export async function getProject(
  id: string
): Promise<{ data: ProjectRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, clients(id, name, email, avatar_colour, hourly_rate, currency)")
    .eq("id", id)
    .single();
  return { data: data as ProjectRow | null, error: error as Error | null };
}

export async function createProject(
  insert: ProjectInsert
): Promise<{ data: ProjectRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...insert, user_id: user.id })
    .select()
    .single();
  return { data: data as ProjectRow | null, error: error as Error | null };
}

export async function updateProject(
  id: string,
  updates: Partial<ProjectInsert>
): Promise<{ data: ProjectRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data: data as ProjectRow | null, error: error as Error | null };
}

export async function deleteProject(id: string): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  return { error: error as Error | null };
}
