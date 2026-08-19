import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

/**
 * The `journal` collection = the blog / journalism section.
 * Posts are MDX files in src/content/journal/, edited either by hand or via
 * Keystatic (see keystatic.config.tsx). Field names here MUST match the
 * frontmatter Keystatic writes.
 */
const journal = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    publishedAt: z.coerce.date(),
    author: z.string().default('Housing Support Rides'),
    category: z.string().default('Field Story'),
    // Defaulted (not required) so an in-progress draft saved without an excerpt
    // doesn't crash the whole content sync. Keystatic still prompts for one.
    excerpt: z.string().default(''),
    /** Optional cover image path (in /public) — falls back to a placeholder. */
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
})

export const collections = { journal }
