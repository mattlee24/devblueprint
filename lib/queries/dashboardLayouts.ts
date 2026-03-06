import { createClient } from "@/lib/supabase/client";

export interface DashboardLayoutItem {
  id: string;
  type: string;
  widgetKey?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  content?: string;
}

export interface DashboardLayout {
  items: DashboardLayoutItem[];
}

export async function getDashboardLayout(
  userId: string
): Promise<{ data: DashboardLayout | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("dashboard_layouts")
    .select("layout")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return { data: null, error: error as Error };
  const layout = data?.layout as { items?: DashboardLayoutItem[] } | null;
  if (!layout || !Array.isArray(layout.items) || layout.items.length === 0) {
    return { data: null, error: null };
  }
  return { data: { items: layout.items }, error: null };
}

export async function upsertDashboardLayout(
  userId: string,
  layout: DashboardLayout
): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("dashboard_layouts").upsert(
    { user_id: userId, layout: layout as unknown as Record<string, unknown> },
    { onConflict: "user_id" }
  );
  return { error: error as Error | null };
}
