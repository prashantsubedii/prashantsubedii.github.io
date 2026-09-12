-- Run after schema.sql, policies.sql, storage.sql and seed.sql.
-- These two sections update on page load without a static-site rebuild.
insert into public.sections (key,label,is_visible,in_nav,sort_order)
values ('frames','Frames',true,true,75), ('certificates','Certificates',false,true,60)
on conflict (key) do nothing;

-- The allowlist is provisioned only through a trusted SQL/service-role session.
drop policy if exists admins_admin_write on public.admins;
revoke insert, update, delete on public.admins from anon, authenticated;
create unique index if not exists single_portfolio_admin on public.admins ((true));

drop policy if exists certificates_public_read on public.certificates;
create policy certificates_public_read on public.certificates for select to anon, authenticated
using (is_visible and exists(select 1 from public.sections where key='certificates' and is_visible));
drop policy if exists snapshots_public_read on public.snapshots;
create policy snapshots_public_read on public.snapshots for select to anon, authenticated
using (is_visible and exists(select 1 from public.sections where key='frames' and is_visible));

-- SECURITY INVOKER preserves RLS. No user email, tokens or analytics are returned.
create or replace function public.public_portfolio() returns jsonb
language sql stable security invoker set search_path = public as $$
select jsonb_build_object(
  'sections', (select coalesce(jsonb_agg(jsonb_build_object('key',key,'is_visible',is_visible,'in_nav',in_nav)),'[]') from public.sections where key in ('frames','certificates')),
  'certificates', (select coalesce(jsonb_agg(jsonb_build_object(
    'name',c.name,'issuer',c.issuer,'description',c.description,'credential_url',c.credential_url,
    'file',case when f.id is not null then jsonb_build_object('bucket',f.bucket,'storage_path',f.storage_path,'mime_type',f.mime_type) end,
    'thumbnail',case when t.id is not null then jsonb_build_object('bucket',t.bucket,'storage_path',t.storage_path,'mime_type',t.mime_type) end
  ) order by c.sort_order,c.created_at desc),'[]') from public.certificates c
    left join public.media f on f.id=c.file_media_id left join public.media t on t.id=c.thumbnail_media_id
    where c.is_visible and exists(select 1 from public.sections where key='certificates' and is_visible)),
  'frames', (select coalesce(jsonb_agg(jsonb_build_object('caption',s.caption,
    'image',jsonb_build_object('bucket',m.bucket,'storage_path',m.storage_path,'mime_type',m.mime_type)
  ) order by s.sort_order,s.created_at desc),'[]') from public.snapshots s join public.media m on m.id=s.image_media_id
    where s.is_visible and exists(select 1 from public.sections where key='frames' and is_visible))
);
$$;
revoke all on function public.public_portfolio() from public;
grant execute on function public.public_portfolio() to anon,authenticated;

-- Only web links can be published as external credentials.
alter table public.certificates drop constraint if exists certificate_safe_url;
alter table public.certificates add constraint certificate_safe_url
check (credential_url is null or credential_url = '' or credential_url ~* '^https?://[^[:space:]]+$');

-- Daily rotating visitor hashes represent daily uniques, not cross-day people.
create or replace function public.analytics_overview(p_from timestamptz,p_to timestamptz)
returns table(views bigint,uniques bigint,countries bigint)
language sql stable security definer set search_path=public as $$
select count(*),count(distinct visitor_hash),count(distinct country_code)
from public.analytics_events where public.is_admin() and ts>=p_from and ts<p_to;
$$;
create or replace function public.analytics_timeseries(p_from timestamptz,p_to timestamptz,p_bucket text default 'day')
returns table(bucket timestamptz,views bigint,uniques bigint)
language sql stable security definer set search_path=public as $$
select date_trunc(case when p_bucket in ('day','week','month') then p_bucket else 'day' end,ts),count(*),count(distinct visitor_hash)
from public.analytics_events where public.is_admin() and ts>=p_from and ts<p_to group by 1 order by 1;
$$;
