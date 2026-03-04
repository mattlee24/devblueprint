-- AI-generated proposal document (objectives, deliverables, timeline, budget, etc.)
alter table proposals add column if not exists generated_content jsonb default '{}';

-- Allow proposals to be created with only title + description (type defaults to 'other')
alter table proposals alter column type set default 'other';
