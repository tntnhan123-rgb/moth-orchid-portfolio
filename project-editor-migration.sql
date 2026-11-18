-- Neil Portfolio: project editor fields
-- Run once in Supabase SQL Editor before using the new Studio fields.
alter table public.projects
  add column if not exists detail_content text,
  add column if not exists layout_style text not null default 'editorial';
