/**
 * Central copy + data for the Housing Support Rides site.
 * Keeping strings here makes the components read cleanly and gives you one
 * place to edit real content later.
 */
import type { LucideIcon } from 'lucide-react'
import {
  FlaskConical,
  Sprout,
  Scale,
  GraduationCap,
  Users,
  MapPin,
  Heart,
} from 'lucide-react'

// Root-relative (with leading "/") so the links work from any page, including
// the journal — "/#impact" jumps to the landing page and scrolls to the anchor.
export const NAV_LINKS = [
  { label: 'Our Work', href: '/#our-work' },
  { label: 'Impact', href: '/#impact' },
  { label: 'Get Involved', href: '/#get-involved' },
  { label: 'About', href: '/#transparency' },
  { label: 'News', href: '/journal' },
] as const

export const IMPACT_STATS: { value: number; suffix?: string; label: string }[] = [
  { value: 340, label: 'Miles of river monitored' },
  { value: 1240, label: 'Volunteers active this year' },
  { value: 86, label: 'Restoration projects completed' },
  { value: 12400, label: 'Households with cleaner water' },
]

export const PROGRAMS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: FlaskConical,
    title: 'Water Quality Monitoring',
    body: 'Volunteers collect samples at 62 fixed sites every month, year-round. The data goes into a public database and into regulatory filings. When a number moves the wrong way, we know within weeks rather than years.',
  },
  {
    icon: Sprout,
    title: 'Streambank Restoration',
    body: 'We stabilise eroding banks with native plantings and engineered log structures. Restored segments hold sediment, cool the water, and bring back the insects that everything else eats. Eighty-six projects completed since 2004.',
  },
  {
    icon: Scale,
    title: 'Advocacy & Permits',
    body: 'We read every discharge permit application in the watershed, and we comment on the ones that matter. It is unglamorous work that has prevented more pollution than any cleanup we have ever run.',
  },
  {
    icon: GraduationCap,
    title: 'Watershed Education',
    body: 'Field programs for 4,000 students a year, plus landowner workshops on riparian buffers and septic maintenance. The next generation of stewards is currently in sixth grade.',
  },
]

export const DONATION_TIERS: { amount: number; impact: string }[] = [
  { amount: 25, impact: 'provides a household water filter for one year' },
  { amount: 60, impact: 'funds one week of river-quality monitoring' },
  { amount: 150, impact: 'trains a volunteer steward for a full season' },
  { amount: 400, impact: 'restores 100 feet of eroded streambank' },
]

export const FIELD_STORIES: {
  category: string
  title: string
  blurb: string
  imageAlt: string
  imageHint: string
  /** Slug of the matching post in src/content/journal/. */
  slug: string
  feature?: boolean
}[] = [
  {
    category: 'Field Story',
    title: 'Bringing the Muddy Fork back',
    blurb: 'Four years, 1,800 native plants, and one very patient landowner. The trout returned in year three.',
    imageAlt: 'Volunteers restoring a riverbank',
    imageHint: 'Community volunteers planting native grasses along a riverbank, natural daylight, candid documentary photography, warm and hopeful mood',
    slug: 'bringing-the-muddy-fork-back',
    feature: true,
  },
  {
    category: 'Advocacy',
    title: 'The permit nobody else read',
    blurb: 'How a routine-looking discharge application turned into an eighteen-month fight, and why we won it.',
    imageAlt: 'Close-up of a river discharge outfall',
    imageHint: 'A discharge pipe at a riverbank under gray sky, documentary style',
    slug: 'the-permit-nobody-else-read',
  },
  {
    category: 'Cleanup',
    title: 'Sixty-two volunteers, one Saturday',
    blurb: 'Our largest single cleanup pulled 3.4 tons out of a two-mile stretch. Here is what we found.',
    imageAlt: 'Volunteers bagging litter along a river',
    imageHint: 'Large group of volunteers collecting trash along a river on a sunny day',
    slug: 'sixty-two-volunteers-one-saturday',
  },
]

export const INVOLVEMENT: {
  icon: LucideIcon
  title: string
  body: string
  cta: string
}[] = [
  {
    icon: Users,
    title: 'Volunteer',
    body: 'Monthly cleanups, monitoring runs, and planting days. No experience needed, and we always feed you.',
    cta: 'Find a workday',
  },
  {
    icon: MapPin,
    title: 'Become a Steward',
    body: 'Adopt a half-mile segment and walk it four times a year. Stewards are our early-warning system.',
    cta: 'Adopt a segment',
  },
  {
    icon: Heart,
    title: 'Give Monthly',
    body: 'Join The Current, our monthly giving circle. Predictable funding is what lets us commit to multi-year restoration.',
    cta: 'Join The Current',
  },
]

export const BUDGET_SEGMENTS: { label: string; pct: number; color: string }[] = [
  { label: 'Programs', pct: 89, color: 'var(--primary)' },
  { label: 'Fundraising', pct: 7, color: 'var(--accent-warm)' },
  { label: 'Administration', pct: 4, color: 'hsl(196, 20%, 60%)' },
]

export const DOCUMENTS = [
  'Annual Report 2025',
  'IRS Form 990',
  'Audited Financials 2025',
  'Board of Directors',
]

export const PARTNERS = [
  'State Water Trust',
  'Fairhaven Community Fund',
  'Northern Counties Coalition',
  'Ridgeline Outdoor Co.',
  'University Watershed Lab',
  'Anonymous Family Foundation',
]
