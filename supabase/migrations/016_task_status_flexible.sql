-- Allow arbitrary task status values (board stages are per-project and user-defined).
alter table tasks drop constraint if exists tasks_status_check;
