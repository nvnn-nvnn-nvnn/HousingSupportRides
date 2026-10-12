import type { ReactNode } from 'react'

/**
 * Givebutter's donation widgets are real custom elements (Web Components),
 * registered by the script tag in BaseLayout.astro. See:
 * https://docs.givebutter.com/widgets/getting-started
 *
 * IMPORTANT: React 19 treats any tag with a hyphen as a genuine custom
 * element and passes props through as raw DOM attributes — it does NOT do
 * the usual `className` → `class` translation. Use `class`, not `className`,
 * when styling these tags in TSX.
 */
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      /**
       * The inline giving form. `id` is the WIDGET ID from the dashboard
       * (not the campaign code) — the widget resolves its own embed URL from
       * it. `amount` and `frequency` are appended to that embed URL, which is
       * what lets our tier picker drive the real donation. Verified against
       * the widget bundle: these are the element's reactive attributes.
       */
      'givebutter-widget': {
        id?: string
        amount?: string
        frequency?: string
        fund?: string
        promo?: string
        align?: string
        class?: string
        children?: ReactNode
      }
      /**
       * Needs BOTH `account` and `campaign`, and without `hide-button` it
       * draws Givebutter's own button UI. For a custom-styled trigger use a
       * plain <button data-gb-account data-gb-campaign> instead — see
       * DonateBlock.tsx and how-to/givebutter.md.
       */
      'givebutter-button': {
        account?: string
        campaign?: string
        label?: string
        'hide-button'?: string
        class?: string
        children?: ReactNode
      }
      'givebutter-giving-form': { campaign?: string; class?: string; children?: ReactNode }
      'givebutter-goal-bar': { campaign?: string; class?: string; children?: ReactNode }
      'givebutter-signup-form': { account?: string; class?: string; children?: ReactNode }
    }
  }
}
