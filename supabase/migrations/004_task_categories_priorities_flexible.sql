-- Allow custom categories and priorities on tasks (drop strict check constraints)
alter table tasks drop constraint if exists tasks_priority_check;
alter table tasks drop constraint if exists tasks_category_check;
