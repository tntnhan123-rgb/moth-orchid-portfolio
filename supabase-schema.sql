-- MOTH / ORCHID v3 — run in Supabase SQL Editor.
-- Safe to run after the previous v2 schema. Never expose service_role in frontend.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Graphic Design',
  year text,
  description text,
  external_url text,
  image_url text,
  image_path text,
  thumbnail_url text,
  thumbnail_path text,
  video_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.projects add column if not exists thumbnail_url text;
alter table public.projects add column if not exists thumbnail_path text;
alter table public.projects add column if not exists video_url text;
alter table public.projects add column if not exists sort_order integer not null default 0;

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  image_url text not null,
  image_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_analytics (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('page_view','project_view')),
  project_id uuid references public.projects(id) on delete set null,
  session_id text,
  referrer text,
  page_path text,
  created_at timestamptz not null default now()
);
create index if not exists portfolio_analytics_created_idx on public.portfolio_analytics(created_at desc);
create index if not exists portfolio_analytics_project_idx on public.portfolio_analytics(project_id);

create or replace function public.is_portfolio_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.admin_users where user_id=(select auth.uid())); $$;

alter table public.admin_users enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.portfolio_analytics enable row level security;

drop policy if exists "Admins can read admin list" on public.admin_users;
create policy "Admins can read admin list" on public.admin_users for select to authenticated using(user_id=(select auth.uid()));

drop policy if exists "Public can read projects" on public.projects;
create policy "Public can read projects" on public.projects for select to anon,authenticated using(true);
drop policy if exists "Admins can insert projects" on public.projects;
create policy "Admins can insert projects" on public.projects for insert to authenticated with check(public.is_portfolio_admin());
drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects" on public.projects for update to authenticated using(public.is_portfolio_admin()) with check(public.is_portfolio_admin());
drop policy if exists "Admins can delete projects" on public.projects;
create policy "Admins can delete projects" on public.projects for delete to authenticated using(public.is_portfolio_admin());

drop policy if exists "Public can read project images" on public.project_images;
create policy "Public can read project images" on public.project_images for select to anon,authenticated using(true);
drop policy if exists "Admins can add project images" on public.project_images;
create policy "Admins can add project images" on public.project_images for insert to authenticated with check(public.is_portfolio_admin());
drop policy if exists "Admins can update project images" on public.project_images;
create policy "Admins can update project images" on public.project_images for update to authenticated using(public.is_portfolio_admin()) with check(public.is_portfolio_admin());
drop policy if exists "Admins can delete project images" on public.project_images;
create policy "Admins can delete project images" on public.project_images for delete to authenticated using(public.is_portfolio_admin());

-- Public clients can insert anonymous view events; only admins can read analytics.
drop policy if exists "Public can record analytics" on public.portfolio_analytics;
create policy "Public can record analytics" on public.portfolio_analytics for insert to anon,authenticated
with check(event_type in ('page_view','project_view'));
drop policy if exists "Admins can read analytics" on public.portfolio_analytics;
create policy "Admins can read analytics" on public.portfolio_analytics for select to authenticated using(public.is_portfolio_admin());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('portfolio-covers','portfolio-covers',true,8388608,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=8388608,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists "Public can view portfolio covers" on storage.objects;
create policy "Public can view portfolio covers" on storage.objects for select to anon,authenticated using(bucket_id='portfolio-covers');
drop policy if exists "Admins can upload portfolio covers" on storage.objects;
create policy "Admins can upload portfolio covers" on storage.objects for insert to authenticated with check(bucket_id='portfolio-covers' and public.is_portfolio_admin());
drop policy if exists "Admins can update portfolio covers" on storage.objects;
create policy "Admins can update portfolio covers" on storage.objects for update to authenticated using(bucket_id='portfolio-covers' and public.is_portfolio_admin()) with check(bucket_id='portfolio-covers' and public.is_portfolio_admin());
drop policy if exists "Admins can delete portfolio covers" on storage.objects;
create policy "Admins can delete portfolio covers" on storage.objects for delete to authenticated using(bucket_id='portfolio-covers' and public.is_portfolio_admin());

-- Create an Auth user in Supabase Authentication > Users, then grant admin:
-- insert into public.admin_users(user_id) values('YOUR-AUTH-USER-UUID');

-- Homepage editor v4: persistent public settings, admin-only writes.
create table if not exists public.site_settings(id text primary key,settings jsonb not null default '{}'::jsonb,updated_at timestamptz not null default now());
alter table public.site_settings enable row level security;
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings for select to anon,authenticated using(true);
drop policy if exists "Admins can insert site settings" on public.site_settings;
create policy "Admins can insert site settings" on public.site_settings for insert to authenticated with check(public.is_portfolio_admin());
drop policy if exists "Admins can update site settings" on public.site_settings;
create policy "Admins can update site settings" on public.site_settings for update to authenticated using(public.is_portfolio_admin()) with check(public.is_portfolio_admin());
