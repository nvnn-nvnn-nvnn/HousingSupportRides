import { config, collection, fields } from '@keystatic/core'

/**
 * Keystatic — the git-based CMS.
 * Admin UI runs at /keystatic (in `npm run dev`). Edits read/write the MDX
 * files in src/content/journal/, which Astro's content collection then renders.
 * Frontmatter field keys here MUST match src/content.config.ts.
 */
/**
 * Keystatic Cloud project, written as "team-slug/project-slug". Copy it from
 * keystatic.cloud after creating the project (how-to/keystatic-cloud.md).
 *
 * Empty = production stays in GitHub mode, so it's safe to deploy before the
 * Cloud project exists. Filled in = production uses Keystatic Cloud, and
 * editors sign in with an emailed invite instead of a GitHub account.
 */
const KEYSTATIC_CLOUD_PROJECT = ''

/**
 * Where uploaded journal images go — the cover AND images dropped into the
 * post body. See how-to/writing-a-post.md, "Adding images".
 *
 * public/ (not src/assets/) so the saved value is a plain URL like
 * /img/journal/<slug>/cover.jpg, which the post pages already accept.
 * The cost: files in public/ are served exactly as uploaded — nothing resizes
 * them. That's why the field descriptions ask editors to resize first.
 *
 * ⚠️ Change both together. `publicPath` must be the URL that `directory`
 * is served at, or every uploaded image breaks.
 */
const JOURNAL_IMAGE_DIR = 'public/img/journal'
const JOURNAL_IMAGE_URL = '/img/journal/'
const RESIZE_NOTE = 'Resize to about 1600px wide (under 500 KB) before uploading — images are not shrunk automatically.'

export default config({
  // Editing access:
  //   - dev (`npm run dev`): always local mode — reads/writes files on this machine.
  //   - production, KEYSTATIC_CLOUD_PROJECT set: Keystatic Cloud. Editors are
  //     invited by email at keystatic.cloud; no GitHub account needed. Saves
  //     still become commits on main, made by Keystatic's GitHub App.
  //   - production, KEYSTATIC_CLOUD_PROJECT empty: GitHub mode (the fallback).
  // Either way /keystatic sits behind the /admin login first (src/middleware.ts).
  storage: import.meta.env.DEV
    ? { kind: 'local' }
    : KEYSTATIC_CLOUD_PROJECT
      ? { kind: 'cloud' }
      : { kind: 'github', repo: 'devvdevvdevv/HousingSuportRides' },
  ...(KEYSTATIC_CLOUD_PROJECT ? { cloud: { project: KEYSTATIC_CLOUD_PROJECT } } : {}),
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
        // An upload button. Saved as public/img/journal/<slug>/cover.<ext>, and
        // the frontmatter gets the URL (/img/journal/<slug>/cover.<ext>) — the
        // same plain string the old text field held, so content.config.ts and
        // the post pages didn't need to change.
        cover: fields.image({
          label: 'Cover image',
          description: `Optional. Shown at the top of the post and on the /journal list. Landscape works best. ${RESIZE_NOTE}`,
          directory: JOURNAL_IMAGE_DIR,
          publicPath: JOURNAL_IMAGE_URL,
        }),
        coverAlt: fields.text({
          label: 'Cover alt text',
          description: 'Describe the photo for someone who can’t see it, e.g. "Volunteers serving food at an outdoor picnic".',
        }),
        draft: fields.checkbox({
          label: 'Draft',
          description: 'Drafts are hidden from the site until unchecked.',
          defaultValue: false,
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        // Images in the body: the editor's image button uploads into the same
        // folder as covers, keeping the original filename. Without
        // `directory`/`publicPath` they'd be saved next to the .mdx file in
        // src/content/journal/, mixed in with the posts.
        body: fields.mdx({
          label: 'Body',
          description: RESIZE_NOTE,
          options: {
            image: {
              directory: JOURNAL_IMAGE_DIR,
              publicPath: JOURNAL_IMAGE_URL,
            },
          },
        }),
      },
    }),
  },
})
