// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'
import keystatic from '@keystatic/astro'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  // Update to the real production domain — used for sitemap + RSS absolute URLs.
  site: 'https://housingsupportrides.org',
  // Public pages stay static; only Keystatic's admin/API routes render on-demand.
  // Deploying to Vercel, so we use the Vercel adapter (emits Vercel build output).
  adapter: vercel(),
  integrations: [react(), mdx(), keystatic(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
})
