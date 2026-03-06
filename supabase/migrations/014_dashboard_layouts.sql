-- Dashboard layout per user: drag-and-drop widget positions and note content
create table dashboard_layouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  layout jsonb not null default '{"items":[]}'::jsonb,
  updated_at timestamptz default now()
);

create trigger dashboard_layouts_updated_at
  before update on dashboard_layouts for each row
  execute function handle_updated_at();

alter table dashboard_layouts enable row level security;

create policy "Users can manage own dashboard layout"
  on dashboard_layouts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
