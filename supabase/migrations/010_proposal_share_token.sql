-- Shareable read-only proposal links: token and enabled flag
alter table proposals add column if not exists share_token text;
alter table proposals add column if not exists share_enabled boolean default false;

-- Optional: unique index so lookup by token is fast (token is only set when share_enabled)
create unique index if not exists proposals_share_token_key on proposals (share_token) where share_token is not null;
