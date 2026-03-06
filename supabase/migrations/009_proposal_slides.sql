-- Proposal whiteboard: slides (3x3 grid), each { id, title, body, order }
alter table proposals add column if not exists slides jsonb default '[]';
