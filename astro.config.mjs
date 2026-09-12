// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Custom domain (GitHub Pages). Root domain => base '/'.
const SITE_URL = 'https://www.prashantsubedi.info.np';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  // Static build -> deployed to GitHub Pages via Actions. The public site is
  // fully prerendered for SEO; the /adminprashant app is a client-only island.
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [
    react(),
    sitemap({
      // Keep the private admin area out of the sitemap.
      filter: (page) => !page.includes('/adminprashant'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    // Hashed assets in a dedicated dir; long-cache friendly.
    assets: '_astro',
  },
});
