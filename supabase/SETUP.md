# Backend & deployment setup

This portfolio is a **static Astro site** (deployed to GitHub Pages) with a
**Supabase** backend (Postgres + Auth + Storage) that powers the CMS at
`/adminprashant`. Follow these steps once.

---

## 1. Create the Supabase project
1. Go to <https://supabase.com> → **New project**. Pick a region close to Nepal
   (e.g. Singapore). Save the database password somewhere safe.
2. In **Project Settings → API**, copy:
   - **Project URL** → `PUBLIC_SUPABASE_URL`
   - **anon public** key → `PUBLIC_SUPABASE_ANON_KEY`
   - Keep secret/service-role keys out of the site environment and frontend. Supabase supplies the server key to its Edge Functions automatically.

## 2. Create the database schema
In the Supabase **SQL Editor**, run these files **in order** (paste + Run):
1. `supabase/schema.sql`   — tables, functions, triggers, analytics RPCs
2. `supabase/policies.sql` — Row Level Security policies
3. `supabase/storage.sql`  — the `media` storage bucket + its policies
4. `supabase/seed.sql`     — default editable content (optional but recommended)
5. `supabase/live-content.sql` — live Frames/Certificates reads, visibility gates and single-admin protection

## 3. Create the ONE admin account
1. **Authentication → Users → Add user** → create `adminprashant@prashantsubedi.info.np` with the password entered directly in Supabase.
   Supabase hashes the password; it is never stored in this repo.
2. Turn **off public sign-ups** in Authentication settings. Keep Auth rate limits enabled and disable unused identity providers.
3. Run `supabase/seed_admin.sql` in the SQL Editor. It finds the exact account and grants authorization by immutable user ID. It refuses to replace a different existing admin. No password is written into SQL or site code.

## 4. Local development
```bash
cp .env.example .env      # fill PUBLIC_SUPABASE_URL + PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev               # http://localhost:4321  (admin: /adminprashant)
```
Without a `.env`, the site still builds and shows default content; the admin
shows a “not configured” screen.

## 5. Analytics (optional but recommended)
The beacon + geolocation run in a Supabase Edge Function so no IP ever reaches
the browser.
```bash
# Install the Supabase CLI, then:
supabase login
supabase link --project-ref <your-project-ref>
supabase secrets set ANALYTICS_SALT="$(openssl rand -hex 16)" ALLOWED_ORIGIN="https://www.prashantsubedi.info.np"
supabase functions deploy track --no-verify-jwt
```
Copy the function URL (`https://<ref>.supabase.co/functions/v1/track`) into
`PUBLIC_ANALYTICS_URL` (env + GitHub variable). Data appears under **Analytics**
in the admin.

## 6. Deploy to GitHub Pages
1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Secrets and variables → Actions → Variables** — add repository
   **variables** (client-safe): `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`,
   `PUBLIC_SITE_URL`, `PUBLIC_ANALYTICS_URL`.
3. Push to `main`. The **Deploy site** workflow builds Astro and publishes.
   The `CNAME` (`www.prashantsubedi.info.np`) ships in `public/`, so the custom
   domain is preserved.

## 7. Publishing content
Frames photos/captions, certificates and their visibility switches are read directly from Supabase on every public page load and when a visitor returns to the tab. No rebuild is needed for those features. Certificates appear immediately after Featured Projects. Turning a section off removes its navigation links and public content.

The upload library saves files to the public `media` bucket under `frames/`, `certificates/` or `uploads/`. Captions are optional. An image certificate is automatically used as its preview; online credentials get a card with a verification link. Upload a separate thumbnail for a PDF if desired. Bucket limits are 10 MB and the listed supported MIME types. Turning a section off is a display setting: previously shared file URLs remain public.

Other portfolio content is prerendered. After changing those fields, trigger a rebuild by any of:
- **Actions → Deploy site → Run workflow**, or
- push any commit, or
- fire a `repository_dispatch` of type `cms-publish` (a future “Publish” button
  can call the GitHub API to do this automatically).

## 8. Verification
`npm run test:security` runs the real PostgreSQL schema/policies against an isolated PGlite database. It checks anonymous and non-admin denials, admin CRUD, the allowlist, storage rules, hidden public content and analytics privacy. `npm run check` validates Astro/TypeScript.

After connecting the actual project, verify sign-in, an upload, each section toggle and the deployed analytics beacon there. Local SQL tests do not provision or test your live Supabase project.

## 9. In-page Nepali reading
The blog language switch translates text in place using MyMemory's documented translation API, preserving images, links and code blocks. English can be restored at any time. Results are cached in the reader's browser. The free service has a daily quota (see https://mymemory.translated.net/doc/usagelimits.php); failures leave the English article intact and show a notice. It is machine translation, not a reviewed Nepali edition.

---

### What must NEVER be committed
- `.env` (real keys) — already git-ignored.
- `SUPABASE_SERVICE_ROLE_KEY` — lives only in Supabase Function secrets / your
  machine. It must never appear in the site bundle, HTML, or any `PUBLIC_*` var.
- Your admin password — only ever entered into Supabase Auth.
