// @ts-check
import { defineConfig, envField } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'
import keystatic from '@keystatic/astro'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  // The live address. Vercel redirects the bare domain to www, so this must be
  // the www one, or the sitemap, RSS and canonical links point at a redirect.
  // Keep it identical to BETTER_AUTH_URL in Vercel. (Changed 2026-11-18.)
  site: 'https://www.housingsupportrides.org',
  // Public pages stay static; only Keystatic's admin/API routes render on-demand.
  // Deploying to Vercel, so we use the Vercel adapter (emits Vercel build output).
  adapter: vercel(),
  // Admin pages are left out of the sitemap: no reason to point search engines
  // at the sign-in page. (They're also blocked by the middleware, not just hidden.)
  integrations: [
    react(),
    mdx(),
    keystatic(),
    sitemap({ filter: (page) => !/^\/(admin|keystatic|api)(\/|$)/.test(new URL(page).pathname) }),
  ],
  // Admin dashboard secrets. `access: 'secret'` means they're read at RUNTIME
  // on the server and never inlined into the build output — unlike a plain
  // import.meta.env read, which Vite can bake into the bundle.
  // `optional: true` so the public site still builds before these are set;
  // src/lib/server/index.ts fails loudly at request time instead, and only on
  // /admin. See how-to/admin-dashboard.md.
  env: {
    schema: {
      DATABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      DATABASE_AUTH_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      BETTER_AUTH_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      BETTER_AUTH_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
