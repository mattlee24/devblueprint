import { createClient } from "@/lib/supabase/client";

export interface InvoiceRow {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  status: string;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceInsert {
  user_id?: string;
  client_id: string;
  invoice_number: string;
  status?: string;
  issue_date?: string;
  due_date?: string | null;
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  total?: number;
  currency?: string;
  notes?: string | null;
}

export interface InvoiceItemRow {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  position: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export async function getInvoices(filters?: {
  clientId?: string;
  status?: string;
}): Promise<{ data: InvoiceRow[] | null; error: Error | null }> {
  const supabase = createClient();
  let q = supabase.from("invoices").select("*, clients(name)").order("created_at", { ascending: false });
  if (filters?.clientId) q = q.eq("client_id", filters.clientId);
  if (filters?.status) q = q.eq("status", filters.status);
  const { data, error } = await q;
  return { data: data as InvoiceRow[] | null, error: error as Error | null };
}

export async function getInvoice(
  id: string
): Promise<{ data: InvoiceRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*, clients(*)")
    .eq("id", id)
    .single();
  return { data: data as InvoiceRow | null, error: error as Error | null };
}

export async function getInvoiceItems(
  invoiceId: string
): Promise<{ data: InvoiceItemRow[] | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("position");
  return { data: data as InvoiceItemRow[] | null, error: error as Error | null };
}

export async function createInvoice(
  insert: InvoiceInsert
): Promise<{ data: InvoiceRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not authenticated") };
  const { data, error } = await supabase
    .from("invoices")
    .insert({ ...insert, user_id: user.id })
    .select()
    .single();
  return { data: data as InvoiceRow | null, error: error as Error | null };
}

export async function updateInvoice(
  id: string,
  updates: Partial<InvoiceInsert>
): Promise<{ data: InvoiceRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("invoices")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data: data as InvoiceRow | null, error: error as Error | null };
}

export async function createInvoiceItem(
  invoiceId: string,
  item: { description: string; quantity: number; unit_price: number; position?: number }
): Promise<{ data: InvoiceItemRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("invoice_items")
    .insert({ invoice_id: invoiceId, ...item })
    .select()
    .single();
  return { data: data as InvoiceItemRow | null, error: error as Error | null };
}

export async function updateInvoiceItem(
  id: string,
  updates: Partial<{ description: string; quantity: number; unit_price: number; position: number }>
): Promise<{ data: InvoiceItemRow | null; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("invoice_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data: data as InvoiceItemRow | null, error: error as Error | null };
}

export async function deleteInvoiceItem(id: string): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("invoice_items").delete().eq("id", id);
  return { error: error as Error | null };
}

export async function deleteInvoice(id: string): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  return { error: error as Error | null };
}
