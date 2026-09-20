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
      'givebutter-widget': { id?: string; class?: string; children?: ReactNode }
      'givebutter-button': { campaign?: string; class?: string; children?: ReactNode }
      'givebutter-giving-form': { campaign?: string; class?: string; children?: ReactNode }
      'givebutter-goal-bar': { campaign?: string; class?: string; children?: ReactNode }
      'givebutter-signup-form': { account?: string; class?: string; children?: ReactNode }
    }
  }
}
