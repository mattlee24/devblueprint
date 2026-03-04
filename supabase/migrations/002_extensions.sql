-- ─────────────────────────────────────────
-- PROFILES (user settings + business info for invoices)
-- ─────────────────────────────────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  business_name text,
  business_address text,
  business_email text,
  business_phone text,
  tax_number text,
  logo_path text,
  default_currency text default 'GBP',
  default_hourly_rate numeric(10,2),
  default_tax_rate numeric(5,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can manage their own profile"
  on profiles for all using (auth.uid() = id);

create trigger profiles_updated_at before update on profiles for each row execute function handle_updated_at();

-- ─────────────────────────────────────────
-- INVOICE ITEMS (line items per invoice)
-- ─────────────────────────────────────────
create table invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(10,2) not null default 0,
  position integer default 0,
  total numeric(12,2) generated always as (quantity * unit_price) stored,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table invoice_items enable row level security;

create policy "Users can manage invoice items of their invoices"
  on invoice_items for all
  using (
    exists (
      select 1 from invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

create trigger invoice_items_updated_at before update on invoice_items for each row execute function handle_updated_at();

-- ─────────────────────────────────────────
-- PROJECT EXTENSIONS (notes + user flow persistence)
-- ─────────────────────────────────────────
alter table projects add column if not exists notes text;
alter table projects add column if not exists user_flow jsonb;
