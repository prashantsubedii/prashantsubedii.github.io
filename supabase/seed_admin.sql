-- ============================================================================
--  Bootstrap the single authorized admin. Run this ONCE, AFTER you have
--  created the admin user in Supabase → Authentication → Users (email +
--  password). Supabase hashes the password; it is never stored here.
--
--  Resolves the requested email to its Auth UUID. Do NOT paste any password.
-- ============================================================================

do $$
declare admin_id uuid;
begin
  select id into admin_id from auth.users where lower(email) = 'adminprashant@prashantsubedi.info.np';
  if admin_id is null then raise exception 'Create the admin account in Supabase Authentication first.'; end if;
  if exists(select 1 from public.admins where user_id <> admin_id) then
    raise exception 'A different admin is already configured. Review the allowlist in the SQL editor.';
  end if;
  insert into public.admins(user_id,email) values(admin_id,'adminprashant@prashantsubedi.info.np')
  on conflict(user_id) do nothing;
end $$;

-- Verify:
select * from public.admins;
