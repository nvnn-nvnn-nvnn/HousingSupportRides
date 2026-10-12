import { Heart } from 'lucide-react'
import { GIVEBUTTER_ACCOUNT_ID, GIVEBUTTER_CAMPAIGN_CODE } from '../../lib/content'
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
const ctaClass =
  'mt-8 flex w-full items-center justify-center gap-2 rounded-full px-7 py-4 text-base font-semibold shadow-sm transition-all duration-200'

function DonateBlock() {
  return (
    <section id="donate" className="bg-[var(--primary)] py-24 text-[var(--primary-foreground)]">
      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <div className="text-center">
          <p className="eyebrow text-[var(--accent-soft)]">Give</p>
          <h2
            className="mt-3 font-serif font-semibold"
            style={{ fontSize: 'clamp(32px, 4vw, 44px)', lineHeight: 1.1, color: '#fff' }}
          >
            Support Us
          </h2>
          <p className="mx-auto mt-5 max-w-prose text-white/85" style={{ lineHeight: 1.7 }}>
            Your gift goes directly to housing, rides, and support for neighbors
            rebuilding their lives in Saint Paul. Give once or monthly — whatever
            works for you.
          </p>
        </div>

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
        <p className="mt-6 text-center text-xs leading-relaxed text-white/60">
          Housing Support Rides, Inc. is a nonprofit organization based in Saint
          Paul, Minnesota.
        </p>
      </div>
    </section>
  )
}

export default DonateBlock
