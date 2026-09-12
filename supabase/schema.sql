-- ============================================================================
--  Prashant Subedi — Portfolio CMS schema (Supabase / PostgreSQL)
-- ----------------------------------------------------------------------------
--  Run this ONCE in the Supabase SQL editor (or via `supabase db push`).
--  It is written to be re-runnable (idempotent) where practical.
--
--  SECURITY MODEL (read supabase/SECURITY.md for the full write-up):
--   * Every table has Row Level Security ON.
--   * The PUBLIC (anonymous) role may only SELECT rows meant for publication
--     (visible sections / published posts). It can never INSERT/UPDATE/DELETE.
--   * Only the ONE authorized admin — identified by an immutable auth user id
--     recorded in public.admins — may mutate content. This is enforced in the
--     database, so editing frontend JS or calling the API directly cannot grant
--     admin rights.
--   * Analytics rows are never readable or writable by the public; they are
--     written by a trusted Edge Function (service role) and read only by admin.
-- ============================================================================

-- Needed for gen_random_uuid() etc. (usually present on Supabase).
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 0. Admin allowlist + authorization helper
-- ----------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);
comment on table public.admins is
  'Allowlist of authorized administrators (normally exactly one row). '
  'Authorization is by immutable auth user id, not by a client-supplied email.';

-- is_admin(): true when the current request is authenticated as an allowlisted
-- admin. SECURITY DEFINER so it can read public.admins under RLS; STABLE so the
-- planner can cache it per statement.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 1. Shared triggers: updated_at + audit log
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table if not exists public.audit_log (
  id         bigint generated always as identity primary key,
  actor      uuid,
  action     text not null,          -- INSERT | UPDATE | DELETE
  table_name text not null,
  row_id     text,
  at         timestamptz not null default now(),
  meta       jsonb
);
comment on table public.audit_log is 'Append-only trail of admin content mutations.';

create or replace function public.audit_row()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  rid text;
begin
  rid := coalesce(
           (to_jsonb(new)  ->> 'id'),
           (to_jsonb(old)  ->> 'id')
         );
  insert into public.audit_log (actor, action, table_name, row_id, meta)
  values (auth.uid(), tg_op, tg_table_name, rid,
          case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end);
  return coalesce(new, old);
end;
$$;

-- Helper: apply updated_at + audit triggers to a table by name.
-- (Kept as explicit statements below for clarity / re-runnability.)

-- ----------------------------------------------------------------------------
-- 2. Singletons: site settings, hero, about
-- ----------------------------------------------------------------------------

-- 2a. site_settings — global site + SEO + footer + contact config (single row)
create table if not exists public.site_settings (
  id                 smallint primary key default 1 check (id = 1),
  -- Branding
  site_name          text not null default 'Prashant Subedi',
  logo_media_id      uuid,
  favicon_media_id   uuid,
  -- Global SEO defaults
  seo_title          text not null default 'Prashant Subedi',
  seo_description    text not null default '',
  seo_keywords       text[] not null default '{}',
  social_image_media_id uuid,
  canonical_domain   text not null default 'https://www.prashantsubedi.info.np',
  twitter_handle     text default '@prashantsubedii',
  -- Contact
  contact_email      text,
  contact_location   text,
  -- Footer
  footer_tagline     text,
  footer_copyright   text,
  -- Feature flags
  analytics_enabled  boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- 2b. hero
create table if not exists public.hero (
  id               smallint primary key default 1 check (id = 1),
  headline         text not null default '',
  descriptor       text not null default '',   -- short professional line
  description      text not null default '',   -- supporting paragraph
  availability_text text,                       -- e.g. "Open to internships"
  show_availability boolean not null default false,
  image_media_id   uuid,
  primary_cta_label text,
  primary_cta_url   text,
  secondary_cta_label text,
  secondary_cta_url   text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 2c. about
create table if not exists public.about (
  id             smallint primary key default 1 check (id = 1),
  heading        text not null default 'About',
  bio            text not null default '',      -- markdown
  image_media_id uuid,
  resume_url     text,
  cta_label      text,
  cta_url        text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.about_highlights (
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  icon       text,                              -- lucide icon name
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.about_stats (
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  value      text not null,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. Section registry (visibility + ordering for homepage + nav)
-- ----------------------------------------------------------------------------
create table if not exists public.sections (
  key        text primary key,     -- 'about','experience','education',...
  label      text not null,        -- nav label
  is_visible boolean not null default true,
  in_nav     boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);
comment on table public.sections is
  'Drives which homepage sections render and their order; nav is derived from '
  'the visible + in_nav rows so visibility never has to be edited twice.';

-- Extra custom navigation links (beyond section anchors), optional.
create table if not exists public.nav_links (
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  url        text not null,
  is_visible boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. Experience
-- ----------------------------------------------------------------------------
create table if not exists public.experience (
  id               uuid primary key default gen_random_uuid(),
  organization     text not null,
  role             text not null,
  employment_type  text,            -- Full-time / Part-time / Internship ...
  work_mode        text,            -- On-site / Remote / Hybrid
  location         text,
  organization_url text,
  logo_media_id    uuid,
  start_date       date,
  end_date         date,            -- null => current
  is_current       boolean not null default false,
  description      text,            -- markdown
  achievements     text[] not null default '{}',
  technologies     text[] not null default '{}',
  is_visible       boolean not null default true,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. Education
-- ----------------------------------------------------------------------------
create table if not exists public.education (
  id              uuid primary key default gen_random_uuid(),
  institution     text not null,
  program         text,
  degree          text,
  location        text,
  institution_url text,
  logo_media_id   uuid,
  start_date      date,
  end_date        date,
  is_current      boolean not null default false,
  description     text,
  highlights      text[] not null default '{}',
  is_visible      boolean not null default true,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. Skills (categories + skills)
-- ----------------------------------------------------------------------------
create table if not exists public.skill_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  icon       text,
  is_visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid references public.skill_categories (id) on delete set null,
  name        text not null,
  icon        text,                 -- lucide name or media id ref
  icon_media_id uuid,               -- optional custom uploaded icon
  description text,
  level       int check (level between 0 and 100),  -- proficiency for the progress bar
  is_visible  boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 7. Projects
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  image_media_id uuid,
  github_url    text,
  live_url      text,
  technologies  text[] not null default '{}',
  category      text,
  project_date  date,
  is_featured   boolean not null default false,
  is_visible    boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 8. Certificates & Learning
-- ----------------------------------------------------------------------------
create table if not exists public.certificates (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  issuer             text,
  issue_date         date,
  expiry_date        date,
  credential_id      text,
  credential_url     text,          -- external verification link
  file_media_id      uuid,          -- uploaded certificate (pdf/image)
  thumbnail_media_id uuid,
  description        text,
  tags               text[] not null default '{}',
  is_visible         boolean not null default true,
  sort_order         int not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 9. Blog
-- ----------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  excerpt          text,
  body             text not null default '',   -- markdown, sanitized on render
  cover_media_id   uuid,
  tags             text[] not null default '{}',
  status           text not null default 'draft' check (status in ('draft','published','archived')),
  published_at     timestamptz,
  reading_minutes  int,
  seo_title        text,
  seo_description  text,
  seo_image_media_id uuid,
  is_indexable     boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists blog_posts_status_idx on public.blog_posts (status, published_at desc);

-- ----------------------------------------------------------------------------
-- 10. Social links
-- ----------------------------------------------------------------------------
create table if not exists public.social_links (
  id         uuid primary key default gen_random_uuid(),
  platform   text not null,         -- github, linkedin, medium ...
  label      text,
  url        text not null,
  icon       text,                  -- lucide name
  is_visible boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 10b. Snapshots (tech-related photo log shown on /snapshots)
-- ----------------------------------------------------------------------------
create table if not exists public.snapshots (
  id             uuid primary key default gen_random_uuid(),
  image_media_id uuid,
  caption        text,
  location       text,
  taken_on       date,
  tags           text[] not null default '{}',
  is_visible     boolean not null default true,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 11. Media library (metadata; bytes live in Storage bucket "media")
-- ----------------------------------------------------------------------------
create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  storage_path text not null,       -- path within the bucket
  bucket       text not null default 'media',
  filename     text,
  mime_type    text,
  size_bytes   bigint,
  width        int,
  height       int,
  alt_text     text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 12. Per-page SEO overrides (optional; global defaults live in site_settings)
-- ----------------------------------------------------------------------------
create table if not exists public.page_seo (
  path            text primary key,   -- '/', '/blog', ...
  seo_title       text,
  seo_description text,
  social_image_media_id uuid,
  is_indexable    boolean not null default true,
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 13. Analytics (cookieless). Written only by the trusted Edge Function.
-- ----------------------------------------------------------------------------
create table if not exists public.analytics_events (
  id           bigint generated always as identity primary key,
  ts           timestamptz not null default now(),
  path         text not null,
  referrer_host text,
  visitor_hash text not null,        -- daily-rotating salted hash of ip+ua
  is_unique    boolean not null default false, -- first hit for this hash+day
  country      text,
  country_code text,
  region       text,                 -- province/state (e.g. Bagmati)
  city         text,
  device       text,                 -- desktop / mobile / tablet
  browser      text,
  os           text
);
create index if not exists analytics_ts_idx      on public.analytics_events (ts desc);
create index if not exists analytics_country_idx on public.analytics_events (country_code);
create index if not exists analytics_path_idx    on public.analytics_events (path);

-- ============================================================================
--  TRIGGERS: updated_at + audit
-- ============================================================================
do $$
declare
  t text;
  content_tables text[] := array[
    'site_settings','hero','about','about_highlights','about_stats',
    'nav_links','experience','education','skill_categories','skills',
    'projects','certificates','blog_posts','social_links','snapshots','media','page_seo'
  ];
begin
  foreach t in array content_tables loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s;', t);
    execute format(
      'create trigger trg_%1$s_updated before update on public.%1$s
         for each row execute function public.set_updated_at();', t);

    execute format('drop trigger if exists trg_%1$s_audit on public.%1$s;', t);
    execute format(
      'create trigger trg_%1$s_audit after insert or update or delete on public.%1$s
         for each row execute function public.audit_row();', t);
  end loop;
end $$;

-- ============================================================================
--  ANALYTICS aggregation RPCs (admin-only, run efficiently server-side)
-- ============================================================================
create or replace function public.analytics_overview(p_from timestamptz, p_to timestamptz)
returns table (views bigint, uniques bigint, countries bigint)
language sql stable security definer set search_path = public as $$
  select
    count(*)                              as views,
    count(*) filter (where is_unique)     as uniques,
    count(distinct country_code)          as countries
  from public.analytics_events
  where public.is_admin() and ts >= p_from and ts < p_to;
$$;

create or replace function public.analytics_timeseries(p_from timestamptz, p_to timestamptz, p_bucket text default 'day')
returns table (bucket timestamptz, views bigint, uniques bigint)
language sql stable security definer set search_path = public as $$
  select date_trunc(p_bucket, ts) as bucket,
         count(*) as views,
         count(*) filter (where is_unique) as uniques
  from public.analytics_events
  where public.is_admin() and ts >= p_from and ts < p_to
  group by 1 order by 1;
$$;

create or replace function public.analytics_top(p_dimension text, p_from timestamptz, p_to timestamptz, p_limit int default 10)
returns table (label text, views bigint, uniques bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then
    return;  -- empty for non-admins
  end if;
  if p_dimension not in ('country','city','path','referrer_host','browser','os','device','region') then
    raise exception 'invalid dimension %', p_dimension;
  end if;
  return query execute format($f$
    select coalesce(%I::text,'(unknown)') as label,
           count(*) as views,
           count(*) filter (where is_unique) as uniques
    from public.analytics_events
    where ts >= $1 and ts < $2
    group by 1 order by views desc limit $3
  $f$, p_dimension) using p_from, p_to, p_limit;
end;
$$;
revoke all on function public.analytics_overview(timestamptz,timestamptz) from public;
revoke all on function public.analytics_timeseries(timestamptz,timestamptz,text) from public;
revoke all on function public.analytics_top(text,timestamptz,timestamptz,int) from public;
grant execute on function public.analytics_overview(timestamptz,timestamptz) to authenticated;
grant execute on function public.analytics_timeseries(timestamptz,timestamptz,text) to authenticated;
grant execute on function public.analytics_top(text,timestamptz,timestamptz,int) to authenticated;

-- Continue with RLS policies in supabase/policies.sql
