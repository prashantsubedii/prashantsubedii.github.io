# Security architecture

The browser is inspectable. Authorization is enforced by Supabase Postgres RLS and Auth, independently of the admin screen. Public configuration is exposed; passwords and server keys are not embedded in the bundle.

## Authentication
- **Supabase Auth** handles login. Passwords are hashed and verified by Supabase
  on the server; the password exists transiently in the login form and is sent to Supabase Auth over HTTPS. It is cleared after submission and never saved by the app.
- The admin app calls `signInWithPassword`. Sessions are JWTs managed by the
  Supabase client, auto-refreshed, and expire. The browser uses sessionStorage. Sign-out clears the local session; already-issued access tokens remain valid until expiry, so database RLS checks the allowlist on every request.
- Login errors are **generic** (“Invalid email or password”) — no user
  enumeration. Supabase applies server-side **rate limiting** to auth endpoints.

## Authorization (the important part)
Authentication only proves *who* you are. Authorization is enforced by
**Row Level Security (RLS)** in Postgres, on every table:
- A single allowlist table `public.admins` holds one authorized **user ID**. Browser roles cannot modify it, including the signed-in admin. Membership is provisioned through trusted SQL only.
- `public.is_admin()` returns true only when `auth.uid()` is in that table.
- Policies:
  - **anon / public**: `SELECT` only, and only rows meant to be public
    (visible sections, published posts). No insert/update/delete anywhere.
  - **admin**: full CRUD, gated by `is_admin()`.
  - **analytics / audit / admins**: never public; admin-read only. Analytics
    rows are written solely by the trusted Edge Function (service role).
- Because this lives in the database, **editing frontend JS or calling the
  Supabase REST API directly cannot bypass it** — an unauthorized token is
  rejected by the policy, not by the UI. Authorization keys off the **immutable
  user id**, not a client-supplied email.

## Storage
- One public-read `media` bucket. **Only the admin** can upload/update/delete
  (RLS on `storage.objects`). Uploads are constrained by an **allowed MIME-type
  list** and a **10 MB size limit** at the bucket level.

## Secrets
- `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY` are safe in the browser by
  design: they permit public reads and are constrained by RLS.
- `SUPABASE_SERVICE_ROLE_KEY` is **server-only** (Edge Functions / your machine).
  It is never prefixed `PUBLIC_`, never bundled, never sent to the browser.

## Input handling & XSS
- Blog content is authored as Markdown and will be rendered through
  `marked` + `isomorphic-dompurify` (sanitized) — no raw HTML injection.
- Icon selection uses a controlled Lucide set; arbitrary SVG/HTML is not
  accepted as executable markup.
- Postgres access goes through the Supabase SDK with parameterized queries — no
  string-built SQL, so no SQL injection surface.

## Audit trail
- `public.audit_log` records every admin insert/update/delete (actor, table,
  row id, timestamp, snapshot) via a `SECURITY DEFINER` trigger. Admin-readable.

## Analytics privacy
- **Cookieless.** No durable identifier is stored. “Unique visitor” is a
  **daily-rotating salted SHA-256 of ip+user-agent** — it cannot be reversed to
  an IP and resets every day. The raw IP is used only in-memory on the server
  for geolocation and is never stored.

## Honest limitations
- Static hosting (GitHub Pages) cannot set HTTP-only cookies for *its own*
  origin, so the session token lives in the Supabase client’s storage. This is
  the standard JAMstack model; RLS — not cookie flags — is the security boundary.
- Frames and Certificates load live from an RLS-protected RPC. Other content changes require a rebuild. Public media URLs remain accessible when a section is hidden.
- No system is “unhackable.” This follows current best practices; keep the
  Supabase project, dependencies, and admin credentials well-maintained.
