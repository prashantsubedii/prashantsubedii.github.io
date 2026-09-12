-- ============================================================================
--  Storage: one public-read "media" bucket; only the admin may write/delete.
--  Run AFTER schema.sql + policies.sql.
-- ============================================================================

-- Create the bucket (public read so <img> URLs work without signed links).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true,
  10485760,  -- 10 MB per object
  array['image/png','image/jpeg','image/webp','image/gif','image/avif','application/pdf']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public may READ objects in the media bucket.
drop policy if exists media_read on storage.objects;
create policy media_read on storage.objects
  for select using (bucket_id = 'media');

-- Only the admin may upload / overwrite / delete.
drop policy if exists media_admin_insert on storage.objects;
create policy media_admin_insert on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

drop policy if exists media_admin_update on storage.objects;
create policy media_admin_update on storage.objects
  for update using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists media_admin_delete on storage.objects;
create policy media_admin_delete on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());
