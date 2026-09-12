import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const db = new PGlite();
const admin = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
await db.exec(`
  create role anon; create role authenticated;
  create schema auth; create table auth.users(id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.user_id',true),'')::uuid $$;
  grant usage on schema public,auth to anon,authenticated;
  grant execute on function auth.uid() to anon,authenticated;
  insert into auth.users values('${admin}'),('${other}');
  create schema storage;
  create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
  create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
  alter table storage.objects enable row level security;
  grant usage on schema storage to anon,authenticated;
`);
for (const name of ['schema.sql','policies.sql','storage.sql','live-content.sql']) {
  let sql = await readFile(new URL(`../supabase/${name}`,import.meta.url),'utf8');
  sql = sql.replace('create extension if not exists pgcrypto;',''); // gen_random_uuid is native in this Postgres runtime.
  await db.exec(sql);
}
// Match Supabase API role grants; RLS must still reject unauthorized mutations.
await db.exec(`grant select,insert,update,delete on all tables in schema public,storage to anon,authenticated;
  grant usage,select on all sequences in schema public to anon,authenticated;
  revoke insert,update,delete on public.admins from anon,authenticated;
  insert into public.admins(user_id,email) values('${admin}','admin@example.test');
  insert into public.sections(key,label,is_visible,in_nav,sort_order) values('about','About',true,true,10);
`);
async function role(name, uid='') { await db.exec(`reset role; select set_config('test.user_id','${uid}',false); set role ${name};`); }
async function denied(sql) { await assert.rejects(db.exec(sql), /row-level security|permission denied/i); }

await role('anon');
assert.equal((await db.query('select public.is_admin() as ok')).rows[0].ok,false);
await denied("insert into public.certificates(name) values('Unauthorized')");
await denied("insert into storage.objects(bucket_id,name) values('media','frames/unauthorized.png')");
await denied('select * from public.analytics_overview(now()-interval \'1 day\',now())');
assert.equal((await db.query('select * from public.admins')).rows.length,0);
assert.equal((await db.query("update public.sections set is_visible=false where key='about' returning key")).rows.length,0);

await role('authenticated',other);
assert.equal((await db.query('select public.is_admin() as ok')).rows[0].ok,false);
await denied(`insert into public.admins(user_id) values('${other}')`);
await denied("insert into public.snapshots(caption) values('Unauthorized')");
await denied("insert into storage.objects(bucket_id,name) values('media','certificates/unauthorized.png')");
assert.equal((await db.query('select * from public.analytics_events')).rows.length,0);
assert.equal((await db.query("select * from public.analytics_overview(now()-interval '1 day',now())")).rows[0].views,0);

await role('authenticated',admin);
assert.equal((await db.query('select public.is_admin() as ok')).rows[0].ok,true);
await denied(`insert into public.admins(user_id) values('${other}')`);
const media = (await db.query("insert into public.media(storage_path,bucket,mime_type) values('certificates/test.png','media','image/png') returning id")).rows[0].id;
await db.exec(`insert into public.certificates(name,file_media_id) values('Verified learning','${media}');
  insert into public.snapshots(image_media_id,caption) values('${media}',null);
  insert into storage.objects(bucket_id,name) values('media','certificates/test.png');
`);
await assert.rejects(db.exec("insert into public.certificates(name,credential_url) values('XSS','javascript:alert(1)')"),/certificate_safe_url/);
await role('anon');
assert.equal((await db.query('select * from public.certificates')).rows.length,0);
let data = (await db.query('select public.public_portfolio() as data')).rows[0].data;
assert.equal(data.certificates.length,0);
assert.equal(data.frames.length,1);
assert.equal(data.frames[0].caption,null);
await role('authenticated',admin);
await db.exec("update public.sections set is_visible=true where key='certificates'; update public.sections set is_visible=false where key='frames';");
await role('anon');
data = (await db.query('select public.public_portfolio() as data')).rows[0].data;
assert.equal(data.certificates.length,1);
assert.equal(data.certificates[0].file.storage_path,'certificates/test.png');
assert.equal(data.frames.length,0);
assert.equal((await db.query('select * from public.snapshots')).rows.length,0);
assert.equal((await db.query('select * from public.audit_log')).rows.length,0);
await db.close();
console.log('PASS: anonymous/non-admin writes denied; allowlist protected; admin CRUD; public visibility; safe credential URLs; storage policies; analytics privacy.');
