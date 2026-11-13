import { Car, Handshake, Heart, Key, Pause, Play } from 'lucide-react'
import { GIVEBUTTER_ACCOUNT_ID, GIVEBUTTER_CAMPAIGN_CODE, SUPPORT_IMAGES } from '../../lib/content'
import { useSlideshow } from '../../hooks/useSlideshow'
import { cn } from '../../lib/utils'

/* Imports for the commented-out amount picker below. Restore these together
   with the markup if it ever comes back.
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { DONATION_TIERS } from '../../lib/content'
*/

/** Both values are required to open checkout — see the comment on the CTA. */
const givebutterReady = Boolean(GIVEBUTTER_ACCOUNT_ID && GIVEBUTTER_CAMPAIGN_CODE)

// Shared look for the CTA, applied to whichever element renders as the button
// (our own styled <button> once configured, a disabled one until then).
// Full width on phones (an easy thumb target), natural width from `sm:` up.
const ctaClass =
  'mt-8 flex w-full items-center justify-center gap-2 rounded-full px-7 py-4 text-base font-semibold shadow-sm transition-all duration-200 sm:inline-flex sm:w-auto sm:px-12'

/** Where a gift goes — the three programs, in words from PROGRAMS. No figures:
 *  dollar-impact claims stay out until they're real (see DONATION_TIERS). */
const GIFT_USES = [
  { icon: Key, text: 'Safe, stable housing for people rebuilding their lives' },
  { icon: Car, text: 'Rides to medical, work, and housing appointments' },
  { icon: Handshake, text: 'Connections to the community resources people qualify for' },
] as const

/** Slightly faster than the hero: these are supporting photos, not the headline. */
const SUPPORT_SLIDE_MS = 5000

/**
 * The left half of the section: a crossfading slideshow of SUPPORT_IMAGES with
 * a slow zoom ("Ken Burns") on the photo that's showing. Stacks above the text
 * on phones and tablets; sits beside it from `lg:` (1024px) up.
 * See how-to/support-section.md.
 */
function SupportSlideshow() {
  const count = SUPPORT_IMAGES.length
  const { index, setIndex, playing, togglePlaying, setHeld, reduced } = useSlideshow(count, {
    intervalMs: SUPPORT_SLIDE_MS,
  })
  if (count === 0) return null

  return (
    <div
      className="relative"
      aria-roledescription={count > 1 ? 'carousel' : undefined}
      aria-label="Photos of our community at work"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
    >
      {/* Decorative offset frame behind the photo. Hidden on phones, where
          the -inset would push past the 20px side gutter. */}
      <div
        aria-hidden="true"
        className="absolute -inset-4 hidden rounded-[28px] border border-white/15 sm:block lg:-left-6 lg:-top-6 lg:bottom-6 lg:right-6"
      />

      {/* 4:3 at every size, so the 4:3 photo files are never cropped. */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black/30 shadow-2xl ring-1 ring-white/10">
        {SUPPORT_IMAGES.map((img, i) => (
          <img
            key={img.src}
            src={`${img.src}-1200.jpg`}
            srcSet={`${img.src}-800.jpg 800w, ${img.src}-1200.jpg 1200w`}
            // ~540px wide beside the text on desktop; full width when stacked.
            sizes="(min-width: 1024px) 540px, 100vw"
            alt={img.alt}
            aria-hidden={i !== index}
            loading="lazy"
            decoding="async"
            className={cn(
              'absolute inset-0 h-full w-full object-cover ease-out',
              !reduced && 'transition-[opacity,transform]',
              i === index ? 'scale-100 opacity-100' : 'opacity-0',
              i !== index && !reduced && 'scale-110',
            )}
            // Two durations, in the same order as transition-property above:
            // a 1s crossfade, and a zoom from 110% → 100% that lasts a little
            // longer than the slide, so the photo is still drifting when the
            // next one fades in.
            style={reduced ? undefined : { transitionDuration: `1000ms, ${SUPPORT_SLIDE_MS + 1500}ms` }}
          />
        ))}

        {/* Darkens the bottom edge so the white controls stay visible on
            bright photos. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />

        {count > 1 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/35 px-2 py-1 backdrop-blur-sm">
            {SUPPORT_IMAGES.map((img, i) => (
              <button
                key={img.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1} of ${count}`}
                aria-current={i === index ? 'true' : undefined}
                className="group grid h-7 w-5 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <span
                  className={cn(
                    'block h-2 rounded-full transition-all duration-300',
                    i === index ? 'w-4 bg-white' : 'w-2 bg-white/50 group-hover:bg-white/80',
                  )}
                />
              </button>
            ))}
            <button
              type="button"
              onClick={togglePlaying}
              aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
              className="ml-1 grid h-7 w-7 place-items-center rounded-full text-white/90 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              {playing ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function DonateBlock() {
  return (
    <section id="donate" className="overflow-hidden bg-[var(--primary)] py-16 text-[var(--primary-foreground)] md:py-24">
      {/* One column (photos on top) until lg:, then photos left / text right. */}
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 md:px-16 lg:grid-cols-2 lg:gap-16">
        <SupportSlideshow />

        <div>
          {/* Color set inline on purpose: `.eyebrow` in global.css is unlayered
              CSS, so it beats any Tailwind text-* class and painted this label
              maroon on maroon (invisible) until 2026-11-12. */}
          <p className="eyebrow" style={{ color: 'var(--accent-soft)' }}>
            Give
          </p>
          <h2
            className="mt-3 font-serif font-semibold"
            style={{ fontSize: 'clamp(32px, 4vw, 44px)', lineHeight: 1.1, color: '#fff' }}
          >
            Support Us
          </h2>
          <p className="mt-5 max-w-prose text-white/85" style={{ lineHeight: 1.7 }}>
            Your gift goes directly to housing, rides, and support for neighbors
            rebuilding their lives in Saint Paul. Give once or monthly — whatever
            works for you.
          </p>

          <ul className="mt-7 grid gap-4">
            {GIFT_USES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-[18px] w-[18px] text-white" aria-hidden="true" />
                </span>
                <span className="text-white/90" style={{ lineHeight: 1.5 }}>
                  {text}
                </span>
              </li>
            ))}
          </ul>

        {/*
          REMOVED 2026-10-12 — the amount picker (One-time/Monthly toggle, the
          $25/$60/$150/$400 tier grid, the custom-amount input, and the live
          "Your $60 …" impact sentence).

          Why: Givebutter's checkout collects the amount and frequency itself,
          so this was a second, parallel set of the same controls. Worse, it was
          purely cosmetic — `givebutter-button` accepts no `amount` or
          `frequency` attribute (only `givebutter-widget`, the inline form,
          does), so choosing $150 Monthly here changed the button label and
          nothing else. The donor then picked the amount again in the modal.

          To bring it back meaningfully you'd need the inline
          `<givebutter-widget id amount frequency>` form rather than the modal
          button, which requires a WIDGET ID from the Givebutter dashboard —
          see how-to/givebutter.md. Restore the imports at the top of this file
          along with this markup.

        <div className="mt-10 flex justify-center">
          <ToggleGroup.Root
            type="single"
            value={frequency}
            onValueChange={(v) => v && setFrequency(v as Frequency)}
            aria-label="Donation frequency"
            className="inline-flex rounded-full border border-white/25 p-1"
          >
            {(['once', 'monthly'] as const).map((f) => (
              <ToggleGroup.Item
                key={f}
                value={f}
                className={cn(
                  'rounded-full px-6 py-2 text-sm font-medium capitalize transition-colors',
                  frequency === f
                    ? 'bg-[var(--background)] text-[var(--primary)]'
                    : 'text-white/80 hover:text-white',
                )}
              >
                {f === 'once' ? 'One-time' : 'Monthly'}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DONATION_TIERS.map((t) => {
            const isActive = !usingCustom && selected === t.amount
            return (
              <button
                key={t.amount}
                type="button"
                onClick={() => {
                  setSelected(t.amount)
                  setCustom('')
                }}
                className={cn(
                  'rounded-lg border-2 py-4 font-serif text-2xl font-semibold transition-all duration-200',
                  isActive
                    ? 'border-[var(--background)] bg-[var(--background)] text-[var(--primary)]'
                    : 'border-white/30 text-white hover:border-white/70',
                )}
              >
                ${t.amount}
              </button>
            )
          })}
        </div>

        <div className="mt-3">
          <label htmlFor="custom-amount" className="sr-only">
            Custom amount
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-white/70">
              $
            </span>
            <input
              id="custom-amount"
              type="number"
              min={1}
              inputMode="numeric"
              placeholder="Other amount"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="w-full rounded-lg border-2 border-white/30 bg-transparent py-3.5 pl-9 pr-4 font-sans text-lg text-white placeholder:text-white/50 focus:border-[var(--background)] focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-5 min-h-[3.25rem] text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={usingCustom ? `custom-${amount}` : selected}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
              className="text-white/85"
              style={{ lineHeight: 1.6 }}
            >
              Your ${amount.toLocaleString('en-US')} {impact}
            </motion.p>
          </AnimatePresence>
        </div>
        */}

        {/* CTA.
            A PLAIN <button> carrying data-gb-account / data-gb-campaign, which
            is Givebutter's documented hook for a custom-styled trigger: their
            script scans for `[data-gb-account][data-gb-campaign]`, attaches a
            click handler, and spawns its own hidden
            <givebutter-button hide-button="true"> elsewhere to host the modal.

            ⚠️ Do NOT replace this with <givebutter-button> directly.
              1. It needs BOTH `account` and `campaign`. With only `campaign` it
                 renders nothing at all — the markup looks correct in
                 view-source and the button is simply invisible.
              2. Without `hide-button` it draws Givebutter's own button UI,
                 discarding our styling and icon.
            See how-to/givebutter.md. */}
        {givebutterReady ? (
          <button
            type="button"
            data-gb-account={GIVEBUTTER_ACCOUNT_ID}
            data-gb-campaign={GIVEBUTTER_CAMPAIGN_CODE}
            className={cn(
              ctaClass,
              'cursor-pointer bg-[var(--accent-warm)] text-white hover:brightness-95 hover:shadow-md active:brightness-90',
            )}
          >
            <Heart className="h-5 w-5" fill="currentColor" aria-hidden="true" />
            Donate
          </button>
        ) : (
          <button
            type="button"
            disabled
            title="Connect Givebutter in src/lib/content.ts to enable donations"
            className={cn(ctaClass, 'cursor-not-allowed bg-white/20 text-white/70')}
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
            Donate
          </button>
        )}

        {/* TODO: confirm 501(c)(3) status and add the real EIN before accepting
            donations. Do NOT claim tax-deductibility until verified. */}
        <p className="mt-6 text-xs leading-relaxed text-white/60">
          Housing Support Rides, Inc. is a nonprofit organization based in Saint
          Paul, Minnesota.
        </p>
        </div>
      </div>
    </section>
  )
}

export default DonateBlock
