-- Estimated price and optional currency for proposals (AI-suggested, user-editable)
alter table proposals add column if not exists estimated_price numeric(12,2);
alter table proposals add column if not exists currency text default 'GBP';
