-- Task comments: multiple comments per task
create table task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create index task_comments_task_id_idx on task_comments(task_id);

alter table task_comments enable row level security;

-- Users can see comments on tasks they own
create policy "Users can select comments on own tasks"
  on task_comments for select
  using (
    task_id in (select id from tasks where user_id = auth.uid())
  );

-- Users can insert comments on tasks they own (as themselves)
create policy "Users can insert comments on own tasks"
  on task_comments for insert
  with check (
    auth.uid() = user_id
    and task_id in (select id from tasks where user_id = auth.uid())
  );

-- Users can update/delete only their own comments
create policy "Users can update own comments"
  on task_comments for update
  using (auth.uid() = user_id);

create policy "Users can delete own comments"
  on task_comments for delete
  using (auth.uid() = user_id);

-- Optional: due date on tasks
alter table tasks add column if not exists due_date date;
