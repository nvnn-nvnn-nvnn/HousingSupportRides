import { config, collection, fields } from '@keystatic/core'

/**
 * Keystatic — the git-based CMS.
 * Admin UI runs at /keystatic (in `npm run dev`). Edits read/write the MDX
 * files in src/content/journal/, which Astro's content collection then renders.
 * Frontmatter field keys here MUST match src/content.config.ts.
 */
export default config({
  // Editing access:
  //   - dev (`npm run dev`): local mode — reads/writes files on your machine.
  //   - production: GitHub mode — multiple people sign in at /keystatic and each
  //     save becomes a commit. Anyone with WRITE access to the repo can edit
  //     (that's your editor list — manage it in GitHub → Settings → Collaborators).
  // TODO before deploy: replace OWNER with your GitHub org/user, push the repo to
  // GitHub, install the Keystatic GitHub App, and set the env vars. Full steps in
  // how-to/deploying.md. For editors without GitHub accounts, use Keystatic Cloud.
  storage: import.meta.env.DEV
    ? { kind: 'local' }
    : { kind: 'github', repo: 'OWNER/housing-support-rides' },
  ui: {
    brand: { name: 'Housing Support Rides' },
  },
  collections: {
    journal: collection({
      label: 'Journal',
      slugField: 'title',
      path: 'src/content/journal/*',
      format: { contentField: 'body' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: { label: 'Title' },
          slug: {
            label: 'Slug (URL)',
            description: 'The last part of the article URL, e.g. /journal/<slug>',
          },
        }),
        publishedAt: fields.date({
          label: 'Published',
          defaultValue: { kind: 'today' },
        }),
        author: fields.text({
          label: 'Author',
          defaultValue: 'Housing Support Rides',
        }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Client Story', value: 'Client Story' },
            { label: 'Housing', value: 'Housing' },
            { label: 'Rides', value: 'Rides' },
            { label: 'Volunteers', value: 'Volunteers' },
            { label: 'Community', value: 'Community' },
            { label: 'News', value: 'News' },
          ],
          defaultValue: 'Client Story',
        }),
        excerpt: fields.text({
          label: 'Excerpt',
          description: 'One or two sentences shown in the list and as the meta description.',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        cover: fields.text({
          label: 'Cover image path',
          description: 'Optional. Path to an image in /public, e.g. /img/muddy-fork.jpg',
        }),
        coverAlt: fields.text({ label: 'Cover alt text' }),
        draft: fields.checkbox({
          label: 'Draft',
          description: 'Drafts are hidden from the site until unchecked.',
          defaultValue: false,
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        body: fields.mdx({ label: 'Body' }),
      },
    }),
  },
})
