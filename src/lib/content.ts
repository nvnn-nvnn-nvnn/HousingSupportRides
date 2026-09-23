/**
 * Central copy + data for the Housing Support Rides site.
 * Keeping strings here makes the components read cleanly and gives you one
 * place to edit real content later.
 *
 * The mission + program text below is VERBATIM from the organization's own
 * program description — the source document is kept at
 * notes/mission-and-programs.md. Don't paraphrase it here.
 */
import type { LucideIcon } from 'lucide-react'
import { Key, Car, Handshake, Users, Heart } from 'lucide-react'

// Root-relative (with leading "/") so the links work from any page, including
// the journal — "/#impact" jumps to the landing page and scrolls to the anchor.
export const NAV_LINKS = [
  { label: 'What We Do', href: '/what-we-do' },
  { label: 'Meetings', href: '/recovery-meetings' },
  // PLACEHOLDER — the Impact section is commented out in App.tsx until
  // IMPACT_STATS holds real numbers. Restore this with it.
  // { label: 'Impact', href: '/#impact' },
  { label: 'Volunteer', href: '/volunteer' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'History', href: '/history' },
  { label: 'FAQ', href: '/faq' },
  { label: 'News', href: '/journal' },
  { label: 'Contact', href: '/contact' },
] as const

/**
 * Hero image. Drop a file in public/img/ and set the path here, e.g.
 * '/img/hero.jpg'. Leave '' to keep the gradient placeholder.
 */
export const HERO_IMAGE = '/img/cover.jpg'

/**
 * Givebutter donation processor. Create a free account at givebutter.com,
 * then set both of these — see how-to/deploying.md for the exact steps:
 *   - GIVEBUTTER_ACCOUNT_ID:   Dashboard → Settings → Integrations
 *   - GIVEBUTTER_CAMPAIGN_CODE: the 6-character code atop your campaign page
 * Leave either blank and the Donate button stays a harmless placeholder —
 * no widget script loads, nothing breaks.
 */
export const GIVEBUTTER_ACCOUNT_ID = ''
export const GIVEBUTTER_CAMPAIGN_CODE = ''

/**
 * Web3Forms — powers the Contact and Volunteer intake forms (no backend
 * server needed; submissions email straight to your inbox).
 * Get a free key at https://web3forms.com — enter your email, they send you
 * an access key. It's meant to be public/client-side, safe to commit.
 * Leave blank and both forms show a friendly "not connected yet" message
 * instead of silently failing. See how-to/deploying.md for setup steps.
 */
export const WEB3FORMS_ACCESS_KEY = '30b0aae6-c622-439b-8cff-1f660edfed3e'

export const IMPACT_STATS: { value: number; suffix?: string; label: string }[] = [
  { value: 1850, label: 'Neighbors housed' },
  { value: 24000, label: 'Rides provided' },
  { value: 76, label: 'Partner organizations' },
  { value: 610, label: 'Active volunteers' },
]

/**
 * Official mission + charitable-purpose language, VERBATIM from the
 * organization's program description. See notes/mission-and-programs.md for
 * the full source document — do not paraphrase these on the site.
 */
export const MISSION = {
  /** One line. Works as a tagline, a social bio, or an email signature. */
  short:
    'Housing, transportation, and community resources for neighbors facing homelessness, housing instability, and economic hardship.',
  /** "Organization Mission" — verbatim. */
  statement:
    'Housing Support Rides (HSR) is a nonprofit charitable organization dedicated to assisting individuals and families experiencing homelessness, housing instability, economic hardship, and transportation barriers. Our mission is to improve stability, independence, and quality of life by connecting vulnerable individuals with safe housing, reliable transportation, community resources, and supportive services.',
  /** The "what we provide" line — the one plain-language rewrite, used as a pull quote. */
  purpose:
    'Providing a trustworthy community, stable housing, and reliable transportation — the three things people need at the same time, not one at a time. Together we make sure a missing ride never costs someone their home, their health, or their job.',
} as const

/** "Charitable Purpose" — verbatim, both paragraphs. */
export const CHARITABLE_PURPOSE: string[] = [
  "HSR's housing, transportation, outreach, and resource-navigation activities are conducted in furtherance of its charitable purposes. The organization's programs are designed primarily to assist individuals and families experiencing homelessness, economic hardship, housing instability, transportation barriers, and related circumstances.",
  "Housing Support Rides does not operate these programs for the private benefit of its officers, directors, or other individuals. Its programs and resources are used to advance the organization's charitable mission and benefit the communities it serves.",
]

/**
 * The full program description, VERBATIM. Rendered in order on /what-we-do.
 * Every string below is the organization's own wording — if you need to
 * reword something for the web, do it in a component, not here.
 * Source of truth: notes/mission-and-programs.md
 */
export const PROGRAM_DESCRIPTION = {
  /** "Program Description" — the opening paragraph. */
  intro:
    'Housing Support Rides (HSR) is a nonprofit organization dedicated to helping individuals in need by providing housing and transportation services that promote stability, safety, and access to essential resources.',

  housing: {
    slug: 'housing',
    title: 'Housing Support Program',
    /** "Housing Program" — the plain-language description. */
    plain: [
      'Housing Support Rides provides housing for individuals who need a safe and stable place to live. Our housing program is designed to assist individuals experiencing homelessness, housing instability, or other circumstances that make it difficult for them to maintain stable housing.',
      'Through this program, HSR works to provide a safe and supportive living environment while helping individuals maintain stability and access resources that support their well-being and independence.',
    ],
    /** "Housing Support Program" — the formal description. */
    lead: 'The Housing Support Program assists individuals and families who are homeless, at risk of homelessness, or experiencing housing instability.',
    activitiesLabel: 'Program activities include:',
    activities: [
      'Assisting individuals experiencing homelessness in locating safe and stable housing.',
      'Providing temporary and supportive housing assistance when resources and appropriate housing are available.',
      'Helping participants navigate housing applications and community housing resources.',
      'Connecting participants with public benefits and other programs that may help maintain housing stability.',
      'Providing referrals to shelters, supportive housing programs, food assistance, employment resources, healthcare, and other community services.',
      'Assisting participants with developing plans toward permanent housing and greater self-sufficiency.',
      'Coordinating with government agencies, nonprofit organizations, landlords, and community partners when appropriate.',
      'Conducting outreach to individuals and families experiencing homelessness or housing insecurity.',
    ],
    close:
      'The program is intended to reduce homelessness and help economically disadvantaged individuals and families achieve long-term housing stability.',
  },

  transportation: {
    slug: 'rides',
    title: 'Transportation Support Program',
    /** "Transportation Program" — the plain-language description. */
    plain: [
      'Housing Support Rides provides transportation for individuals who need assistance getting to important appointments and essential services.',
      'Transportation may be provided for medical appointments, social-service appointments, housing-related appointments, government appointments, employment-related appointments, and other necessary appointments.',
      'The purpose of the transportation program is to ensure that a lack of reliable transportation does not prevent individuals from accessing essential services and resources.',
    ],
    /** "Transportation Support Program" — the formal description. */
    lead: 'The Transportation Support Program helps individuals experiencing economic hardship or other barriers obtain transportation necessary to access essential services and opportunities.',
    activitiesLabel:
      'Transportation assistance may include rides or transportation coordination for:',
    activities: [
      'Housing appointments and housing searches.',
      'Medical and healthcare appointments.',
      'Employment, job interviews, and workforce-development activities.',
      'Government and public-benefit appointments.',
      'Food shelves and community meal programs.',
      'Social-service appointments.',
      'Educational and training programs.',
      'Other essential community resources.',
    ],
    close:
      'Transportation services are provided to reduce transportation barriers that could otherwise prevent individuals from obtaining housing, healthcare, employment, food, public assistance, and other essential services.',
  },

  /** "Community Support and Resource Navigation" — verbatim. */
  community: {
    slug: 'community',
    title: 'Community Support and Resource Navigation',
    body: [
      'Housing Support Rides also helps participants identify and access community resources appropriate to their individual circumstances. HSR works to connect individuals with existing nonprofit, government, and community programs rather than unnecessarily duplicating services already available within the community.',
    ],
  },

  /** "Overall Purpose" — verbatim. */
  overallPurpose: [
    'Together, our housing and transportation programs address two significant barriers faced by vulnerable individuals: lack of stable housing and lack of reliable transportation.',
    'Housing Support Rides is committed to helping individuals achieve greater stability by providing housing and ensuring they can attend the appointments and services necessary to support their health, well-being, and independence.',
  ],
} as const

/**
 * The founder's letter — VERBATIM, in Kong Meng Vang's own words, rendered on
 * /history. It is his personal story, including his own recovery, published
 * because he wrote it for the site. Do not edit, tighten, or paraphrase it; if
 * a word needs to change, it changes because he changed it.
 * Source copy: notes/mission-and-programs.md.
 */
export const FOUNDER_LETTER = {
  title: 'Why I Founded Housing Support Rides',
  name: 'Kong Meng Vang',
  role: 'Founder & Executive Director',
  paragraphs: [
    'My name is Kong Meng Vang, founder of Housing Support Rides.',
    'Deep in my heart, I always wanted to change, but I did not have the strength to ask for help. I needed a helping hand—someone willing to walk beside me, not in front of me or behind me—as I faced my fears and broke through decades of addiction, pain, and failure.',
    'By God’s grace, I found strength through Narcotics Anonymous, the Twelve Steps, and a sponsor who helped me work through each step. That personal support was the missing piece in my recovery. Today, I understand that many people truly want to change, but they need someone to help them stand up and believe that a new life is possible. Once they find recovery, they can reach back and help the next person. Recovery is a lifelong journey, and none of us should have to walk it alone.',
    'Transportation is also an important part of that journey. Early in recovery, some people are not ready to ride buses or light rail alone. They may feel afraid, overwhelmed, or vulnerable to returning to old places and habits. HSR provides safe, supportive transportation until participants gain the strength and confidence to take those steps on their own.',
    'I lived through these struggles myself. That is why I founded Housing Support Rides, along with Hnub Zoo Culture-Specific All Recovery—“The Day Healing Starts” and HSR NA, which is based on the Twelve Steps.',
    'Our purpose is simple: to offer safe housing support, dependable rides, recovery meetings, and a caring person who will walk beside someone until they are strong enough to keep moving forward—and one day help someone else do the same.',
  ],
  /** A line lifted verbatim from paragraph two, set large as the page's focal point. */
  pullQuote:
    'I needed a helping hand—someone willing to walk beside me, not in front of me or behind me.',
} as const

/**
 * The three programs, as cards on the home page. Bodies are verbatim sentences
 * from the program description; `details` are the verbatim activity lists.
 * The full text lives in PROGRAM_DESCRIPTION above and renders on /what-we-do.
 */
export const PROGRAMS: {
  icon: LucideIcon
  slug: string
  title: string
  body: string
  /** Extra bullet points shown on the /what-we-do page. */
  details: string[]
}[] = [
  {
    icon: Key,
    slug: 'housing',
    title: 'Housing Support Program',
    body: 'Housing Support Rides provides housing for individuals who need a safe and stable place to live. Our housing program is designed to assist individuals experiencing homelessness, housing instability, or other circumstances that make it difficult for them to maintain stable housing.',
    details: [...PROGRAM_DESCRIPTION.housing.activities],
  },
  {
    icon: Car,
    slug: 'rides',
    title: 'Transportation Support Program',
    body: 'Housing Support Rides provides transportation for individuals who need assistance getting to important appointments and essential services. Transportation may be provided for medical appointments, social-service appointments, housing-related appointments, government appointments, employment-related appointments, and other necessary appointments.',
    details: [...PROGRAM_DESCRIPTION.transportation.activities],
  },
  {
    icon: Handshake,
    slug: 'community',
    title: 'Community Support and Resource Navigation',
    body: 'Housing Support Rides also helps participants identify and access community resources appropriate to their individual circumstances. HSR works to connect individuals with existing nonprofit, government, and community programs rather than unnecessarily duplicating services already available within the community.',
    details: [],
  },
]

export const DONATION_TIERS: { amount: number; impact: string }[] = [
  { amount: 25, impact: 'covers a week of rides to work and appointments for one person' },
  { amount: 60, impact: 'stocks a move-in kit for someone starting over in a new apartment' },
  { amount: 150, impact: 'funds a month of transit passes for someone starting a job' },
  { amount: 400, impact: 'helps cover a security deposit for a family moving into housing' },
]

/**
 * Cards in the "From the field" section of the home page. Each one links to a
 * real post in src/content/journal/ — `slug` must match a file there, or the
 * "Read the story" link 404s.
 *
 * The section adapts to the number of entries: one story renders as a single
 * full-width feature, several fall into the 3-column mosaic.
 */
export const FIELD_STORIES: {
  category: string
  title: string
  blurb: string
  imageAlt: string
  imageHint: string
  /** Image path in public/ (e.g. '/img/story.jpg'). Empty = gradient placeholder. */
  image: string
  /** Slug of the matching post in src/content/journal/. */
  slug: string
  feature?: boolean
}[] = [
  {
    category: 'Community',
    title: 'The 2026 Recovery Picnic',
    blurb:
      'PLACEHOLDER — one or two sentences about the day, matching the excerpt on the post itself.',
    imageAlt:
      'A large group of people gathered outdoors on a lawn, several holding printed certificates',
    imageHint: 'A community picnic on a lawn, people gathered around tables, warm afternoon light',
    image: '/img/cover.jpg',
    slug: 'recovery-picnic-2026',
    feature: true,
  },
]

/**
 * Photo gallery (/gallery).
 *
 * `file` is the BARE FILENAME of a photo in `src/assets/img/gallery/` — not a
 * path and not a `/public` URL. The page resolves it with `import.meta.glob`
 * so Astro can optimize it (resize + WebP). Drop a new photo in that folder,
 * add an entry here, done. See how-to/images.md.
 *
 * ⚠️ Most `alt` / `title` / `blurb` values below are PLACEHOLDER. Three entries
 * are real (marked ✓) because they were actually reviewed. Before launch:
 *   1. Confirm photo consent — these show identifiable faces at recovery
 *      events. See notes/todo-next-steps.md.
 *   2. Replace the placeholder text. `alt` is what screen readers announce,
 *      so shipping "Placeholder —" strings is an accessibility failure.
 *   3. Rename the files to something meaningful; IMG_2026… doesn't scale.
 *
 * `date` drives newest-first ordering and the Highlights/Archive split. These
 * are all the import date, not the date each photo was taken — fix per photo.
 */
export type GalleryPhoto = {
  /** Bare filename inside src/assets/img/gallery/ */
  file: string
  /** Required. What a screen reader announces. */
  alt: string
  /** Short heading under the photo. */
  title: string
  /** Sentence under the title in the grid, and over the photo in the lightbox. */
  blurb: string
  /** ISO 'YYYY-MM-DD'. Newest first; top HIGHLIGHT_COUNT become Highlights. */
  date: string
}

const PLACEHOLDER_ALT = 'Recovery Highlights'
const PLACEHOLDER_BLURB = 'Recovery Highlights'

export const GALLERY_IMAGES: GalleryPhoto[] = [
  // ✓ reviewed
  {
    file: 'cover.jpg',
    alt: 'September 5th, 2026 - Housing Support Rides Picnic and Recovery Celebration',
    title: 'Celebrating milestones together',
    blurb: 'September 5th, 2026 - Housing Support Rides Picnic and Recovery Celebration',
    date: '2026-09-05',
  },
  // ✓ reviewed
  {
    file: 'IMG_20260920_024642.jpg',
    alt: 'Three volunteers posing playfully beside folding tables and stacked chairs in a community room',
    title: 'Setting up the room',
    blurb: 'Volunteers setting up (and clowning around) before an event.',
    date: '2026-09-20',
  },
  // ✓ reviewed
  {
    file: 'IMG_20260920_024720.jpg',
    alt: 'A group standing outdoors beside a large "Recovery Is Everywhere" story banner at an outdoor event',
    title: 'Walk for Recovery',
    blurb: 'At the Walk for Recovery, beside a banner of personal recovery stories.',
    date: '2026-09-20',
  },

  // --- placeholder text below; files are real, descriptions are not ---------
  // PLACEHOLDER — commented out until each photo has real alt text, a real
  // caption, AND a signed photo release (these show identifiable faces at
  // recovery events). Restore entries one at a time as they are reviewed.
  // { file: 'IMG_20260920_024632.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024633.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024640.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024645.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024647.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024649.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024653.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024654.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024657.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024659.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024701.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024703.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024705.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024707.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024710.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024711.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024714.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024715.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024716.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024718.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024724.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024726.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024727.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024729.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024730.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024732.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024733.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024735.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
  // { file: 'IMG_20260920_024739.jpg', alt: PLACEHOLDER_ALT, title: 'Recovery Highlights', blurb: PLACEHOLDER_BLURB, date: '2026-09-20' },
]

/** How many of the most recent photos show under "Highlights". */
export const HIGHLIGHT_COUNT = 6




// Involvment - NOT GALLERY

export const INVOLVEMENT: {
  icon: LucideIcon
  title: string
  body: string
  cta: string
  href: string
}[] = [
  {
    icon: Users,
    title: 'Volunteer',
    body: 'Help at intake, sort donations, assemble move-in kits, or mentor a neighbor. No experience needed — just a few hours.',
    cta: 'Find a role',
    href: '/volunteer',
  },
  {
    icon: Car,
    title: 'Become a Driver',
    body: 'Give rides to work, appointments, and interviews on a schedule that fits your week. Mileage is covered.',
    cta: 'Start driving',
    href: '/volunteer/become-a-driver',
  },
  {
    icon: Heart,
    title: 'Give Monthly',
    body: 'Join our monthly giving circle. Steady, predictable support is what lets us commit to people for the long haul.',
    cta: 'Give monthly',
    href: '/volunteer/give-monthly',
  },
]

export const BUDGET_SEGMENTS: { label: string; pct: number; color: string }[] = [
  { label: 'Programs', pct: 89, color: 'var(--primary)' },
  { label: 'Fundraising', pct: 7, color: 'var(--accent-warm)' },
  { label: 'Administration', pct: 4, color: 'hsl(20, 12%, 58%)' },
]

export const DOCUMENTS = [
  'Annual Report 2025',
  'IRS Form 990',
  'Audited Financials 2025',
  'Board of Directors',
]

export const PARTNERS = [
  'County Housing Authority',
  'Community Health Partners',
  'Regional Transit Coalition',
  'Second Chance Employment',
  'United Way (placeholder)',
  'Anonymous Family Foundation',
]

/**
 * Weekly recovery meetings hosted by Housing Support Rides.
 *
 * Someone may be reading this in a bad moment, so the page that renders it
 * ({@link file://./../pages/recovery-meetings.astro}) puts day/time/address
 * above the description. Keep that order if you edit it.
 *
 * `mapQuery` is what gets handed to Google Maps. Keep it as the full one-line
 * address so the link resolves to the building, not the street.
 */
export type RecoveryMeeting = {
  /** Meeting name as people would say it out loud. */
  name: string
  /** Optional subtitle. Only Hnub Zoo has one. */
  tagline?: string
  /** Meeting type, shown as a small badge. */
  kind: string
  day: string
  time: string
  street: string
  cityStateZip: string
  /** Full address on one line, for the maps link. */
  mapQuery: string
  description: string
}

export const RECOVERY_MEETINGS: RecoveryMeeting[] = [
  {
    name: 'Hnub Zoo Recovery',
    tagline: 'The Day Healing Starts',
    kind: 'All Recovery Meeting',
    day: 'Every Monday',
    time: '5:30 PM',
    street: '1440 Arcade Street',
    cityStateZip: 'St. Paul, MN 55106',
    mapQuery: '1440 Arcade Street, St. Paul, MN 55106',
    description:
      'Hnub Zoo is an All Recovery meeting for anyone suffering from addiction, mental-health struggles, grief, trauma, or other life challenges. Everyone is welcome to find encouragement, healing, hope, and support. You do not have to struggle alone.',
  },
  {
    name: 'HSR Narcotics Anonymous Meeting',
    kind: 'Narcotics Anonymous',
    day: 'Every Saturday',
    time: '6:30 PM',
    street: '3207 Central Avenue NE',
    cityStateZip: 'Minneapolis, MN 55418',
    mapQuery: '3207 Central Avenue NE, Minneapolis, MN 55418',
    description:
      'A safe and supportive NA meeting for anyone seeking freedom from drug addiction. We celebrate clean-time milestones and recognize the hard work people put into their recovery. Come connect with others, share hope, and grow stronger in recovery.',
  },
]

/** Closing line on the recovery meetings page. */
export const RECOVERY_CLOSING =
  'At Housing Support Rides, we believe nobody should walk through recovery alone.'
