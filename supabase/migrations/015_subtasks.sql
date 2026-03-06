-- Subtasks for tasks: title, completed, position
create table subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index subtasks_task_id_idx on subtasks(task_id);

create trigger subtasks_updated_at
  before update on subtasks for each row
  execute function handle_updated_at();

alter table subtasks enable row level security;

-- Users can manage subtasks only for tasks they own
create policy "Users can select own task subtasks"
  on subtasks for select
  using (
    task_id in (select id from tasks where user_id = auth.uid())
  );

create policy "Users can insert own task subtasks"
  on subtasks for insert
  with check (
    task_id in (select id from tasks where user_id = auth.uid())
  );

create policy "Users can update own task subtasks"
  on subtasks for update
  using (
    task_id in (select id from tasks where user_id = auth.uid())
  );

create policy "Users can delete own task subtasks"
  on subtasks for delete
  using (
    task_id in (select id from tasks where user_id = auth.uid())
  );
