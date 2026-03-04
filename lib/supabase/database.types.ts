export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      clients: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      projects: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      tasks: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      time_logs: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      invoices: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      profiles: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      invoice_items: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
    };
  };
}
