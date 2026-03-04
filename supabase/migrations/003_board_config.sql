-- Board config per project (column labels, order for Kanban)
alter table projects add column if not exists board_config jsonb default '{}';
