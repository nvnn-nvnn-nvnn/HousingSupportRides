// ─────────────────────────────────────────────────────────────────────────────
// KEYSTATIC CONFIG: the settings for the blog editor at /keystatic.
//
// Keystatic has no database. Every blog post is a FILE in this repo
// (src/content/journal/<slug>.mdx). This file tells Keystatic:
//   1. where to save        (your computer, Keystatic Cloud, or GitHub)
//   2. what a post contains (title, date, cover photo, text…), which becomes
//      the form an admin fills in.
//
// Plain-English background: notes/admin-system.md → "What is Keystatic?"
// ─────────────────────────────────────────────────────────────────────────────

// The three building blocks Keystatic gives us:
//   config     = the overall settings (wraps everything below)
//   collection = a group of similar entries (here: journal posts)
//   fields     = the input boxes in the editor (text, date, image upload…)
import { config, collection, fields } from '@keystatic/core'

/**
 * Keystatic — the git-based CMS.
 * Admin UI runs at /keystatic (in `npm run dev`). Edits read/write the MDX
 * files in src/content/journal/, which Astro's content collection then renders.
 * Frontmatter field keys here MUST match src/content.config.ts.
 */

// ── SETTING 1: Which Keystatic Cloud project the LIVE site logs in through ──
/**
 * Keystatic Cloud project, written as "team-slug/project-slug". Copy it from
 * keystatic.cloud after creating the project (how-to/keystatic-cloud.md).
 *
 * Empty = production stays in GitHub mode, so it's safe to deploy before the
 * Cloud project exists. Filled in = production uses Keystatic Cloud, and
 * editors sign in with an emailed invite instead of a GitHub account.
 *
 * Ours: team "hsr-admin", project "housingsupportrides" (set 2026-11-24).
 * Not a secret: it's just a name. The project on keystatic.cloud decides
 * WHO may edit (its members) and FROM WHERE (its Project URLs list).
 */
const KEYSTATIC_CLOUD_PROJECT = 'hsr-admin/housingsupportrides'

// ── SETTING 2: Where uploaded photos are saved, and their web address ──
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
const JOURNAL_IMAGE_DIR = 'public/img/journal' // folder in the repo the file is saved into
const JOURNAL_IMAGE_URL = '/img/journal/' //      the web address that same folder is served at
// Help text shown under the upload buttons (used twice below, so it lives here once).
const RESIZE_NOTE = 'Resize to about 1600px wide (under 500 KB) before uploading — images are not shrunk automatically.'

// ── THE CONFIG ITSELF: everything Keystatic reads ──
export default config({
  // ── WHERE TO SAVE (storage) ──
  // Picks one of three modes, top to bottom:
  //
  //   Running `npm run dev`?            → 'local'  : save straight to the files on
  //                                                   this computer. No login.
  //   Live site + project name set?     → 'cloud'  : admins sign in by EMAIL through
  //                                                   Keystatic Cloud, which commits
  //                                                   the post to GitHub for them.  ← now
  //   Live site + project name empty?   → 'github' : every editor needs their OWN
  //                                                   GitHub account (backup mode).
  //
  // Whatever the mode, a live save = a commit on main → Vercel rebuilds → post is live.
  // Either way /keystatic sits behind the /admin login first (src/middleware.ts).
  storage: import.meta.env.DEV //       true only while `npm run dev` is running
    ? { kind: 'local' }
    : KEYSTATIC_CLOUD_PROJECT //        is SETTING 1 filled in?
      ? { kind: 'cloud' }
      : { kind: 'github', repo: 'devvdevvdevv/HousingSuportRides' }, // ⚠️ repo has moved to nvnn-nvnn-nvnn/HousingSupportRides (only used if Cloud is turned off)

  // Cloud mode also needs to know WHICH project. This line adds
  // `cloud: { project: '…' }` only when SETTING 1 is filled in; otherwise it
  // adds nothing. (`...` spreads the object's contents into this config.)
  ...(KEYSTATIC_CLOUD_PROJECT ? { cloud: { project: KEYSTATIC_CLOUD_PROJECT } } : {}),

  // ── LOOK OF THE EDITOR ──
  // The name shown in the editor's top-left corner.
  ui: {
    brand: { name: 'Housing Support Rides' },
  },

  // ── WHAT CAN BE EDITED (collections) ──
  // Each collection = one list in the editor's sidebar. Only "Journal" exists
  // for now; meetings, FAQ, bios etc. would each be a new collection here.
  collections: {
    journal: collection({
      label: 'Journal', //                        sidebar name in the editor
      slugField: 'title', //                      the file name / URL comes from the Title field
      path: 'src/content/journal/*', //           where post files live; * = the slug
      format: { contentField: 'body' }, //        the "body" field is the main text, everything else goes in the file's header (frontmatter)
      entryLayout: 'content', //                  editor layout: big writing area, other fields in a side panel

      // ── THE FORM: one entry per input box an admin sees ──
      // ⚠️ These names (title, publishedAt, author…) must match
      // src/content.config.ts, which checks every post when the site builds.
      schema: {
        // Title + its URL. Typing a title fills in the slug automatically
        // ("Spring Picnic" → spring-picnic → /journal/spring-picnic).
        title: fields.slug({
          name: { label: 'Title' },
          slug: {
            label: 'Slug (URL)',
            description: 'The last part of the article URL, e.g. /journal/<slug>',
          },
        }),

        // Publish date. Starts as today; posts are listed newest first.
        publishedAt: fields.date({
          label: 'Published',
          defaultValue: { kind: 'today' },
        }),

        // Byline. Defaults to the organization's name.
        author: fields.text({
          label: 'Author',
          defaultValue: 'Housing Support Rides',
        }),

        // Dropdown of categories. To add one, add a { label, value } line here.
        // (src/content.config.ts accepts any category text, so only this list
        // needs changing.)
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

        // Short summary for the /journal list and search engines. Required:
        // `min: 1` means it can't be saved empty.
        excerpt: fields.text({
          label: 'Excerpt',
          description: 'One or two sentences shown in the list and as the meta description.',
          multiline: true,
          validation: { length: { min: 1 } },
        }),

        // Cover photo upload button.
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

        // Description of the cover photo for screen-reader users (accessibility).
        coverAlt: fields.text({
          label: 'Cover alt text',
          description: 'Describe the photo for someone who can’t see it, e.g. "Volunteers serving food at an outdoor picnic".',
        }),

        // Draft checkbox. Ticked = saved but hidden from the public site.
        draft: fields.checkbox({
          label: 'Draft',
          description: 'Drafts are hidden from the site until unchecked.',
          defaultValue: false,
        }),

        // A list of free-text tags ("picnic", "recovery"…). `itemLabel` shows
        // each tag's text in the editor's list.
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),

        // The post itself: a rich-text editor (bold, headings, links, images).
        // Saved as MDX, which is Markdown that can also hold components.
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
