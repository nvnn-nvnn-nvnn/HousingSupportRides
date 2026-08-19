// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import node from '@astrojs/node'
import keystatic from '@keystatic/astro'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  // Update to the real production domain — used for sitemap + RSS absolute URLs.
  site: 'https://housingsupportrides.org',
  // Public pages stay static; only Keystatic's admin/API routes render on-demand,
  // which is why an adapter is required. Swap `node` for your host's adapter
  // (@astrojs/netlify, @astrojs/vercel, …) at deploy time — see notes/how-to.
  adapter: node({ mode: 'standalone' }),
  integrations: [react(), mdx(), keystatic(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
})
