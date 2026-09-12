-- ============================================================================
--  Row Level Security policies. Run AFTER schema.sql.
--  Rule of thumb:
--    * anon  -> SELECT only, and only rows meant to be public.
--    * admin -> full CRUD (is_admin() gate), on every table.
--    * analytics/audit/admins -> NEVER public. Admin read only.
-- ============================================================================

-- Enable RLS everywhere (safe to re-run).
do $$
declare t text;
declare all_tables text[] := array[
  'admins','audit_log','site_settings','hero','about','about_highlights',
  'about_stats','sections','nav_links','experience','education',
  'skill_categories','skills','projects','certificates','blog_posts',
  'social_links','snapshots','media','page_seo','analytics_events'
];
begin
  foreach t in array all_tables loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force row level security;', t);
  end loop;
end $$;

-- Drop-and-recreate helper keeps this file idempotent.
-- ---- Admins & audit & analytics: admin read; no public access at all --------
drop policy if exists admins_admin_read on public.admins;
create policy admins_admin_read on public.admins
  for select using (public.is_admin());
drop policy if exists admins_admin_write on public.admins;
-- Allowlist membership is managed only in a trusted SQL/service-role session.
revoke insert, update, delete on public.admins from anon, authenticated;

drop policy if exists audit_admin_read on public.audit_log;
create policy audit_admin_read on public.audit_log
  for select using (public.is_admin());
-- No insert/update/delete policy => only SECURITY DEFINER trigger writes it.

drop policy if exists analytics_admin_read on public.analytics_events;
create policy analytics_admin_read on public.analytics_events
  for select using (public.is_admin());
-- No public insert. The analytics Edge Function uses the service role, which
-- bypasses RLS, so beacons are validated + geolocated server-side only.

-- ---- Singletons: public read, admin write -----------------------------------
do $$
declare t text;
declare singletons text[] := array['site_settings','hero','about'];
begin
  foreach t in array singletons loop
    execute format('drop policy if exists %1$s_public_read on public.%1$s;', t);
    execute format('create policy %1$s_public_read on public.%1$s for select using (true);', t);
    execute format('drop policy if exists %1$s_admin_all on public.%1$s;', t);
    execute format('create policy %1$s_admin_all on public.%1$s for all using (public.is_admin()) with check (public.is_admin());', t);
  end loop;
end $$;

-- ---- Visibility-gated content: public reads visible rows, admin all ---------
do $$
declare t text;
declare vis_tables text[] := array[
  'about_highlights','about_stats','nav_links','experience','education',
  'skill_categories','skills','projects','certificates','social_links','snapshots'
];
begin
  foreach t in array vis_tables loop
    execute format('drop policy if exists %1$s_public_read on public.%1$s;', t);
    execute format('create policy %1$s_public_read on public.%1$s for select using (is_visible = true);', t);
    execute format('drop policy if exists %1$s_admin_all on public.%1$s;', t);
    execute format('create policy %1$s_admin_all on public.%1$s for all using (public.is_admin()) with check (public.is_admin());', t);
  end loop;
end $$;

-- ---- sections: public reads visible; admin all ------------------------------
drop policy if exists sections_public_read on public.sections;
create policy sections_public_read on public.sections
  for select using (is_visible = true);
drop policy if exists sections_admin_all on public.sections;
create policy sections_admin_all on public.sections
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- blog: public reads PUBLISHED only; admin all ---------------------------
drop policy if exists blog_public_read on public.blog_posts;
create policy blog_public_read on public.blog_posts
  for select using (status = 'published');
drop policy if exists blog_admin_all on public.blog_posts;
create policy blog_admin_all on public.blog_posts
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- media + page_seo: public read (needed to resolve images/SEO), admin all-
drop policy if exists media_public_read on public.media;
create policy media_public_read on public.media for select using (true);
drop policy if exists media_admin_all on public.media;
create policy media_admin_all on public.media
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists page_seo_public_read on public.page_seo;
create policy page_seo_public_read on public.page_seo for select using (true);
drop policy if exists page_seo_admin_all on public.page_seo;
create policy page_seo_admin_all on public.page_seo
  for all using (public.is_admin()) with check (public.is_admin());
