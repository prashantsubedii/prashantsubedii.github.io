# Public portfolio redesign — September 11, 2026

## Scope and architecture

This pass changes the existing Astro public site locally. The working tree already contained an extensive staged legacy-to-Astro migration plus untracked application/CMS files; those changes were retained. No commits, pushes, database writes, or deployments were performed.

The application uses Astro 7, Tailwind 4, a static GitHub Pages build, and a client-only React admin at `/adminprashant`. Public sections and navigation derive visibility/order from Supabase content with existing local defaults. Medium RSS is fetched at build time and sanitized into internal article pages. Pinned GitHub JSON supplies repository metadata; GitHub README content is fetched and sanitized for internal project pages. Supabase authentication, RLS, storage, collection editors, analytics and content getters remain intact.

The supplied images informed the portrait-led composition and compact grouped skills. The footer reference at https://aashutosh.tech/ informed the idea of an illustrated closing scene. The new drawing is original SVG geometry, not a copied asset.

## Main changes

- `src/styles/global.css`: coherent charcoal/off-white/blue tokens, typography, spacing, fine borders, restrained interactions and reduced-motion support. Removed ambient glow and blueprint backgrounds.
- `src/components/sections/Hero.astro`: asymmetrical name/portrait composition, arch crop, slow rotating outline geometry replacing the blurred gradient ring. Preserved existing biography, links and photo; displays availability only when enabled in content.
- About, Experience, Education and Skills components: image/text composition, open experience rows, compact academic records, grouped thin skill bars. Existing skill values retained; unknown values no longer get an invented displayed percentage. Existing CMS about statistics can render.
- `src/components/sections/Projects.astro`: image-led first pinned project plus supporting projects. Uses existing `openGraphImage`, stars, forks, language, topics and internal README links. Image error fallback preserves layout. CMS project links and featured ordering retained.
- `src/components/sections/BlogPreview.astro`: lead article plus supporting editorial rows, keeping Medium content and internal reading routes.
- Contact: simpler split composition and form, clear “Compose email” wording for the existing mailto behavior, preserved validation.
- `src/components/SiteNav.astro`: layout fits long CMS labels, 44px menu/theme controls, Escape/outside-click close behavior, resize reset, synchronized desktop/mobile scroll spy and `aria-current`.
- `src/components/SiteFooter.astro` and new `FooterArt.astro`: original responsive developer desk/window/landscape illustration, existing social/navigation/copyright values, back-to-top link.
- BaseLayout and public pages: skip-to-content link and matching focusable main landmarks; existing SEO, canonical, JSON-LD, sitemap, icons and analytics retained.
- `tsconfig.json`: removed deprecated baseUrl, kept aliases with relative targets and explicitly included Astro/Node types. The standalone typecheck previously failed before checking source.
- `.github/workflows/deploy.yml`: Node 22 replaces Node 20 because the installed Astro and React integration require Node >=22.12. No workflow was triggered.

## Verification

- `npm run check`: 53 files, zero errors/warnings/hints.
- `npm run typecheck`: passes after repairing the existing configuration.
- `npm run build`: succeeds, 11 static pages including 4 live Medium articles and 3 pinned repository pages.
- No lint or test scripts exist in package.json; none were invented.
- Browser checked widths: 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920px. No horizontal document overflow found. Visually reviewed desktop hero/projects/writing/experience/footer, mobile hero/contact/article/project views, and tablet skills/footer.
- All 3 GitHub Open Graph images loaded. The ForestSathi README rendered inside its project page. The first Medium article rendered full content inside its article page.
- Mobile disclosure opens/closes, Escape closes it, section selection closes it, and both copies of the active section link update.
- Empty contact submission displays the error and focuses Name. No email was sent.
- Dark/light themes checked in browser. Reduced-motion CSS disables rotating geometry and transitions; OS preference emulation was not performed.
- No browser console errors observed in the checked local pages.

## Existing content and integration limits

- No local `.env` is present. Public pages were checked using the existing fallback content plus live Medium/GitHub data. Authenticated Supabase reads/writes, admin CRUD and analytics delivery were not live-tested.
- The fallback education still contains the existing placeholder “Higher Secondary School” and lacks dates. Replace it through your content setup when ready. The UI no longer labels the undated, non-current record as “Present.”
- Certificates and snapshots are empty without CMS content; their truthful empty states remain.
- The CMS blog editor exists, but public writing routes currently read Medium, not the CMS `blog_posts` records. This predates the redesign; the backend contract was not rewritten.
- The README's “pin/unpin ... to change what shows” wording omits that public pages are static. The pin-sync workflow commits with `[skip ci]`, and the Pages workflow has no schedule. Updated pins need a subsequent site rebuild to appear publicly. Existing publishing automation is retained for a separate backend/publishing pass.
- Medium/GitHub fetchers retain their existing soft-failure behavior. An upstream outage during a build can omit article routes or show the README fallback; no new caching layer was introduced.

Final static link audit: 351 root-relative links across 11 generated pages resolve to existing local output files; zero missing targets. Fragment targets and external URLs are not included in this file-existence audit.
