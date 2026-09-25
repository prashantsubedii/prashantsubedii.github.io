// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Custom domain (GitHub Pages). Root domain => base '/'.
const SITE_URL = 'https://www.prashantsubedi.info.np';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  // Static build -> deployed to GitHub Pages via Actions.
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    // Hashed assets in a dedicated dir; long-cache friendly.
    assets: '_astro',
  },
});
