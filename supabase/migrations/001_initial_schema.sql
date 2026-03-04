-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- CLIENTS
-- ─────────────────────────────────────────
create table clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  company text,
  email text,
  phone text,
  website text,
  address text,
  notes text,
  status text default 'active' check (status in ('active', 'inactive', 'archived')),
  hourly_rate numeric(10,2),
  currency text default 'GBP',
  avatar_colour text default '#00ff88',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- PROJECTS
-- ─────────────────────────────────────────
create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references clients(id) on delete set null,
  title text not null,
  description text,
  type text not null check (type in ('website', 'web_application', 'mobile_app', 'api', 'cli', 'other')),
  status text default 'active' check (status in ('active', 'archived', 'completed', 'on_hold')),
  stack jsonb default '[]',
  blueprint jsonb,
  overall_score numeric(4,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- TASKS (Kanban)
-- ─────────────────────────────────────────
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'backlog' check (status in ('backlog', 'todo', 'in_progress', 'in_review', 'done')),
  priority text default 'p2' check (priority in ('p1', 'p2', 'p3')),
  category text default 'dev' check (category in ('dev', 'design', 'content', 'seo', 'devops', 'testing', 'other')),
  effort text default 'medium' check (effort in ('low', 'medium', 'high')),
  position integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- TIME LOGS
-- ─────────────────────────────────────────
create table time_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  description text not null,
  hours numeric(6,2) not null,
  billable boolean default true,
  hourly_rate numeric(10,2),
  currency text default 'GBP',
  logged_date date default current_date,
  invoice_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- INVOICES
-- ─────────────────────────────────────────
create table invoices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,
  invoice_number text not null,
  status text default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date date default current_date,
  due_date date,
  subtotal numeric(12,2) default 0,
  tax_rate numeric(5,2) default 0,
  tax_amount numeric(12,2) default 0,
  total numeric(12,2) default 0,
  currency text default 'GBP',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add FK from time_logs.invoice_id to invoices (before RLS)
alter table time_logs
  add constraint time_logs_invoice_id_fkey
  foreign key (invoice_id) references invoices(id) on delete set null;

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
alter table clients enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table time_logs enable row level security;
alter table invoices enable row level security;

create policy "Users can manage their own clients"
  on clients for all using (auth.uid() = user_id);

create policy "Users can manage their own projects"
  on projects for all using (auth.uid() = user_id);

create policy "Users can manage their own tasks"
  on tasks for all using (auth.uid() = user_id);

create policy "Users can manage their own time logs"
  on time_logs for all using (auth.uid() = user_id);

create policy "Users can manage their own invoices"
  on invoices for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- UPDATED_AT TRIGGER FUNCTION
-- ─────────────────────────────────────────
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_updated_at before update on clients for each row execute function handle_updated_at();
create trigger projects_updated_at before update on projects for each row execute function handle_updated_at();
create trigger tasks_updated_at before update on tasks for each row execute function handle_updated_at();
create trigger time_logs_updated_at before update on time_logs for each row execute function handle_updated_at();
create trigger invoices_updated_at before update on invoices for each row execute function handle_updated_at();
