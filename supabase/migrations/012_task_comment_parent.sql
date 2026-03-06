-- Threaded comments: allow replies via parent_id
alter table task_comments
  add column if not exists parent_id uuid references task_comments(id) on delete cascade;

create index if not exists task_comments_task_id_created_at_idx
  on task_comments(task_id, created_at);
