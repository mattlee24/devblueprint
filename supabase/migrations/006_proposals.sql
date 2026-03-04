-- Proposals table for client onboarding (pre-project)
create table proposals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references clients(id) on delete set null,
  title text not null,
  description text,
  type text not null check (type in ('website', 'web_application', 'mobile_app', 'api', 'cli', 'other')),
  stack jsonb default '[]',
  target_audience text,
  goals jsonb default '[]',
  constraints text,
  hourly_rate_override numeric(10,2),
  status text default 'draft' check (status in ('draft', 'sent', 'agreed', 'declined')),
  project_id uuid references projects(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table proposals enable row level security;

create policy "Users can manage their own proposals"
  on proposals for all using (auth.uid() = user_id);

create trigger proposals_updated_at before update on proposals for each row execute function handle_updated_at();
