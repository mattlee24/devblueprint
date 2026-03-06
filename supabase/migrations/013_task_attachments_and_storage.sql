-- Task attachments table: metadata for files stored in Supabase Storage
create table task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  filename text not null,
  content_type text,
  byte_size bigint,
  created_at timestamptz default now()
);

create index task_attachments_task_id_idx on task_attachments(task_id);

alter table task_attachments enable row level security;

-- Users can only access attachments for tasks they own
create policy "Users can select own task attachments"
  on task_attachments for select
  using (
    task_id in (select id from tasks where user_id = auth.uid())
  );

create policy "Users can insert own task attachments"
  on task_attachments for insert
  with check (
    auth.uid() = user_id
    and task_id in (select id from tasks where user_id = auth.uid())
  );

create policy "Users can delete own task attachments"
  on task_attachments for delete
  using (
    task_id in (select id from tasks where user_id = auth.uid())
  );

-- Storage bucket for task attachments (private)
insert into storage.buckets (id, name, public)
values ('task-attachments', 'task-attachments', false)
on conflict (id) do nothing;

-- Storage policies: path is {task_id}/{filename}
-- Allow insert: user owns the task (task_id is first segment of name)
create policy "Users can upload to own task folder"
  on storage.objects for insert
  with check (
    bucket_id = 'task-attachments'
    and auth.uid() in (
      select user_id from tasks where id = (regexp_split_to_array(name, '/'))[1]::uuid
    )
  );

create policy "Users can select own task files"
  on storage.objects for select
  using (
    bucket_id = 'task-attachments'
    and auth.uid() in (
      select user_id from tasks where id = (regexp_split_to_array(name, '/'))[1]::uuid
    )
  );

create policy "Users can delete own task files"
  on storage.objects for delete
  using (
    bucket_id = 'task-attachments'
    and auth.uid() in (
      select user_id from tasks where id = (regexp_split_to_array(name, '/'))[1]::uuid
    )
  );
