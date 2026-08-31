/**
 * Central copy + data for the Housing Support Rides site.
 * Keeping strings here makes the components read cleanly and gives you one
 * place to edit real content later. All copy below is placeholder.
 */
import type { LucideIcon } from 'lucide-react'
import { Key, Car, Handshake, Users, Heart } from 'lucide-react'

// Root-relative (with leading "/") so the links work from any page, including
// the journal — "/#impact" jumps to the landing page and scrolls to the anchor.
export const NAV_LINKS = [
  { label: 'What We Do', href: '/what-we-do' },
  { label: 'Impact', href: '/#impact' },
  { label: 'Volunteer', href: '/volunteer' },
  { label: 'History', href: '/history' },
  { label: 'FAQ', href: '/faq' },
  { label: 'News', href: '/journal' },
  { label: 'Contact', href: '/contact' },
] as const

export const IMPACT_STATS: { value: number; suffix?: string; label: string }[] = [
  { value: 1850, label: 'Neighbors housed' },
  { value: 24000, label: 'Rides provided' },
  { value: 76, label: 'Partner organizations' },
  { value: 610, label: 'Active volunteers' },
]

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
    title: 'Housing Placement',
    body: 'We help people move from shelters, transitional programs, and unsafe situations into stable housing — and we stay with them through the move-in, the deposit, and the first hard months that follow.',
    details: [
      'Help navigating waitlists, applications, and inspections',
      'Security deposits and first-month move-in costs',
      'Move-in kits: furniture, dishes, and bedding',
      'Follow-up support through the first months in a new home',
    ],
  },
  {
    icon: Car,
    slug: 'rides',
    title: 'Rides & Transportation',
    body: 'A missed ride can undo a week of progress. We provide non-emergency medical transportation and everyday rides — to clinics, work, court, and appointments — so people get where they need to be, reliably.',
    details: [
      'Non-emergency medical transportation (NEMT) to clinics and appointments',
      'Rides to work, interviews, and court dates',
      'Reliable pickups — including early mornings and off-hours',
      'Trained, vetted drivers',
    ],
  },
  {
    icon: Handshake,
    slug: 'support',
    title: 'Support & Case Management',
    body: 'Every person we serve is paired with a coordinator who helps them navigate benefits, employment, healthcare, and paperwork — one steady point of contact instead of a maze of agencies.',
    details: [
      'One dedicated coordinator per person',
      'Help with benefits, ID, and paperwork',
      'Warm connections to healthcare and employment',
      'A single point of contact, not a maze of agencies',
    ],
  },
  {
    icon: Users,
    slug: 'community',
    title: 'Community & Resources',
    body: 'Reintegration is more than an address. We connect people to job training, peer groups, and local resources so they rebuild not just a home, but a place to belong.',
    details: [
      'Job training and skills referrals',
      'Peer support groups and mentorship',
      'Navigation to local resources and services',
      'A community that stays after the crisis passes',
    ],
  },
]

export const DONATION_TIERS: { amount: number; impact: string }[] = [
  { amount: 25, impact: 'covers a week of rides to work and appointments for one person' },
  { amount: 60, impact: 'stocks a move-in kit for someone starting over in a new apartment' },
  { amount: 150, impact: 'funds a month of transit passes for someone starting a job' },
  { amount: 400, impact: 'helps cover a security deposit for a family moving into housing' },
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
    category: 'Client Story',
    title: 'A ride to the interview that changed everything',
    blurb: 'James had the skills and the references. What he did not have was a way to get across town by 9am. Here is what one ride set in motion.',
    imageAlt: 'A volunteer driver dropping someone off downtown',
    imageHint: 'A volunteer driver in a car dropping a person off outside an office building, warm morning light, hopeful documentary photography',
    slug: 'a-ride-that-changed-everything',
    feature: true,
  },
  {
    category: 'Housing',
    title: 'From a shelter cot to a set of keys',
    blurb: 'Nine months, a dozen agencies, and one coordinator who never dropped the thread. How Maria found a door of her own.',
    imageAlt: 'A person holding keys in front of an apartment door',
    imageHint: 'A person holding apartment keys in front of a front door, smiling, natural light, candid documentary style',
    slug: 'from-shelter-to-keys',
  },
  {
    category: 'Volunteers',
    title: 'The drivers who show up at 6am',
    blurb: 'Before most of us are awake, a handful of volunteers are already on the road. We rode along for a morning.',
    imageAlt: 'A volunteer driver at dawn with a coffee',
    imageHint: 'A volunteer driver at dawn beside a car with a coffee, early morning light, warm and candid',
    slug: 'volunteer-drivers-who-show-up',
  },
]

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
