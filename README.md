# prashantsubedi.info.np — portfolio + CMS

Personal portfolio for Prashant Subedi, rebuilt as a static **Astro** site with a
secure **Supabase**-backed CMS. Deploys to **GitHub Pages** (custom domain
`www.prashantsubedi.info.np`).

- Public site: prerendered static HTML (fast, SEO-friendly), content pulled from
  the CMS at build time with safe fallbacks.
- Admin CMS: `/adminprashant` — a code-split, client-only React app. Auth +
  authorization are enforced server-side by Supabase Auth + Row Level Security.
- Analytics: cookieless page views + geo, via a Supabase Edge Function.

## Quick start
```bash
cp .env.example .env     # add your Supabase URL + anon key
npm install
npm run dev              # http://localhost:4321
```
Build / verify:
```bash
npm run build            # static output in dist/
npm run check            # astro type + template check
```

## Structure
```
public/            Static assets (images, CNAME, favicons, loading.json, pinned.json)
src/
  layouts/         BaseLayout.astro (SEO, JSON-LD, OG/Twitter)
  components/      Nav, Footer, social icons, analytics beacon
    sections/      Hero, About, Experience, Education, Skills, Projects, …
  pages/
    index.astro    Homepage (renders visible sections in CMS order)
    adminprashant/ The CMS app (client-only island)
  admin/           React admin: auth, shell, pages, UI kit
  lib/             Supabase client, content layer, types, formatters
supabase/          schema.sql, policies.sql, storage.sql, seed*.sql,
                   functions/track (analytics), SETUP.md, SECURITY.md
legacy/            The previous hand-written site, kept for reference
.github/workflows/ deploy.yml (Pages), update-pinned.yml (GitHub pins → JSON)
```

## Documentation
- **[supabase/SETUP.md](supabase/SETUP.md)** — provision Supabase, create the
  admin, configure env + GitHub, deploy.
- **[supabase/SECURITY.md](supabase/SECURITY.md)** — auth, RLS, storage,
  secrets, XSS, analytics privacy, and honest limitations.

## Content management
Nearly all visible content is editable in `/adminprashant`. Sections have
visibility toggles and an order control; the nav derives from that automatically.
See the setup guide for how publishing (rebuild) works.

## GitHub pinned repositories
`.github/workflows/update-pinned.yml` fetches your pinned repos via the GitHub
GraphQL API (using the built-in `GITHUB_TOKEN`, server-side — no token exposed)
and writes `public/assets/pinned.json`, which the Projects section reads at build.
Pin/unpin on GitHub to change what shows.
