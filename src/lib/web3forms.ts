import { WEB3FORMS_ACCESS_KEY } from './content'

// https://docs.web3forms.com/getting-started/examples/ajax-contact-form-using-javascript
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

const statusClass = {
  idle: 'mt-3 text-sm text-[var(--muted-foreground)]',
  /** Only used when no success panel is wired up — see initWeb3Form. */
  success: 'mt-3 text-sm text-[var(--primary)]',
  /** A banner, not a line of text: a failed send is easy to miss otherwise. */
  error: 'mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800',
}

interface InitOptions {
  /**
   * Panel revealed in place of the form on success (see FormResult.astro).
   * Omit it and the outcome falls back to a line of text under the button.
   */
  successEl?: HTMLElement | null
}

/**
 * Wires a <form> to submit via Web3Forms over fetch (no page reload).
 *
 * Outcomes are deliberately asymmetric:
 *   - Success swaps the whole form out for `successEl`, so there's no ambiguity
 *     about whether it sent.
 *   - Failure KEEPS the form and everything typed into it, and shows an error
 *     banner. Clearing a long message on a network blip loses us the enquiry.
 *
 * If WEB3FORMS_ACCESS_KEY isn't set yet (see src/lib/content.ts), submitting
 * shows a friendly notice instead of silently failing or erroring against
 * Web3Forms.
 */
export function initWeb3Form(
  form: HTMLFormElement,
  statusEl: HTMLElement,
  { successEl }: InitOptions = {},
) {
  const setStatus = (text: string, kind: keyof typeof statusClass) => {
    statusEl.textContent = text
    statusEl.className = statusClass[kind]
  }

  const clearStatus = () => setStatus('', 'idle')

  const showSuccessPanel = () => {
    if (!successEl) return false

    clearStatus()
    form.classList.add('hidden')
    successEl.classList.remove('hidden')

    // Focus first (without scrolling), then scroll deliberately — focus() on
    // its own jumps the viewport, which reads as a glitch on a long page.
    successEl.focus({ preventScroll: true })
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    successEl.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })
    return true
  }

  // "Send another" puts the form back, empty and ready.
  successEl?.querySelector('[data-form-reset]')?.addEventListener('click', () => {
    successEl.classList.add('hidden')
    form.classList.remove('hidden')
    clearStatus()
    form.querySelector<HTMLInputElement>('input:not([type="hidden"]):not(.hidden)')?.focus()
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    if (!WEB3FORMS_ACCESS_KEY) {
      setStatus(
        "This form isn't connected yet — please email us directly in the meantime.",
        'idle',
      )
      return
    }

    // Honeypot: real users never fill this (it's hidden via CSS); bots often do.
    // Note this only stops bots that actually render the page — see
    // how-to/form-spam-protection.md for why that isn't the whole story.
    if ((form.elements.namedItem('botcheck') as HTMLInputElement | null)?.checked) {
      return
    }

    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]')
    const formData = new FormData(form)
    formData.set('access_key', WEB3FORMS_ACCESS_KEY)
    const payload = Object.fromEntries(formData.entries())

    if (submitBtn) submitBtn.disabled = true
    setStatus('Sending…', 'idle')

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (res.status === 200 && result.success) {
        form.reset()
        if (!showSuccessPanel()) {
          setStatus(result.message || "Thanks — we'll be in touch soon.", 'success')
        }
      } else {
        // Web3Forms' own message is usually specific ("invalid access key").
        setStatus(result.message || 'Something went wrong. Please try again.', 'error')
      }
    } catch {
      setStatus('Network error — please try again or email us directly.', 'error')
    } finally {
      if (submitBtn) submitBtn.disabled = false
    }
  })
}
