# prashantsubedi.info.np

Personal portfolio of **Prashant Subedi**, an aspiring AI/ML engineer, researcher and tech
community builder from Chitwan, Nepal.

**Live:** [www.prashantsubedi.info.np](https://www.prashantsubedi.info.np) ·
[GitHub](https://github.com/prashantsubedii) ·
[LinkedIn](https://linkedin.com/in/prashantsubedii) ·
[ResearchGate](https://www.researchgate.net/profile/Prashant-Subedi-7) ·
[Medium](https://medium.com/@prashantsubedii)

Built as a static [Astro](https://astro.build) site with Tailwind CSS and deployed to
GitHub Pages. There is no backend or admin panel. All content lives in this repo and is
updated by editing code.

## Features
- Fully prerendered pages: fast and SEO-friendly (Open Graph, JSON-LD, sitemap)
- Light/dark theme, responsive layout, reduced-motion support
- Projects pulled from pinned GitHub repos, with README-based project pages
- Blog pulled from Medium at build time, with Nepali translation support
- Contact form via Formspree

## Quick start
```bash
npm install
npm run dev              # http://localhost:4321
```
Build / verify:
```bash
npm run build            # static output in dist/
npm run check            # astro type + template check
```

## Updating content
| What | Where |
| --- | --- |
| Name, SEO, hero, about, experience, education, skills, certificates, social links, section order/visibility | `src/lib/content.ts` |
| Contact form destination (Formspree) | `CONTACT_FORM_ENDPOINT` in `src/lib/content.ts` |
| Profile / about photos, CV | `public/assets/images/`, `public/assets/CV.pdf` |
| Frames page photos | drop images into `public/frames/` (the page and nav link appear automatically) |
| Blog posts | published on Medium; pulled in at build time |
| Projects | pin repos on GitHub; `update-pinned.yml` syncs `public/assets/pinned.json` |

Commit and push to `main`; the deploy workflow rebuilds the site.

## Structure
```
public/            Static assets (images, CNAME, favicons, pinned.json, frames/)
src/
  layouts/         BaseLayout.astro (SEO, JSON-LD, OG/Twitter)
  components/      Nav, footer, social icons, feedback UI
    sections/      Hero, About, Experience, Education, Skills, Projects, …
  pages/           index, blog/, projects/, frames
  lib/             content.ts (all site content), types, Medium/GitHub loaders
legacy/            The previous hand-written site, kept for reference
.github/workflows/ deploy.yml (Pages), update-pinned.yml (GitHub pins → JSON)
```
