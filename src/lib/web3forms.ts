import { WEB3FORMS_ACCESS_KEY } from './content'

// https://docs.web3forms.com/getting-started/examples/ajax-contact-form-using-javascript
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

const statusClass = {
  idle: 'mt-3 text-sm text-[var(--muted-foreground)]',
  success: 'mt-3 text-sm text-[var(--primary)]',
  error: 'mt-3 text-sm text-red-600',
}

/**
 * Wires a <form> to submit via Web3Forms over fetch (no page reload).
 * `statusEl` gets the outcome message. If WEB3FORMS_ACCESS_KEY isn't set yet
 * (see src/lib/content.ts), submitting shows a friendly notice instead of
 * silently failing or erroring against Web3Forms.
 */
export function initWeb3Form(form: HTMLFormElement, statusEl: HTMLElement) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    if (!WEB3FORMS_ACCESS_KEY) {
      statusEl.textContent =
        "This form isn't connected yet — please email us directly in the meantime."
      statusEl.className = statusClass.idle
      return
    }

    // Honeypot: real users never fill this (it's hidden via CSS); bots often do.
    if ((form.elements.namedItem('botcheck') as HTMLInputElement | null)?.checked) {
      return
    }

    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]')
    const formData = new FormData(form)
    formData.set('access_key', WEB3FORMS_ACCESS_KEY)
    const payload = Object.fromEntries(formData.entries())

    if (submitBtn) submitBtn.disabled = true
    statusEl.textContent = 'Sending…'
    statusEl.className = statusClass.idle

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (res.status === 200 && result.success) {
        form.reset()
        statusEl.textContent = result.message || "Thanks — we'll be in touch soon."
        statusEl.className = statusClass.success
      } else {
        statusEl.textContent = result.message || 'Something went wrong. Please try again.'
        statusEl.className = statusClass.error
      }
    } catch {
      statusEl.textContent = 'Network error — please try again or email us directly.'
      statusEl.className = statusClass.error
    } finally {
      if (submitBtn) submitBtn.disabled = false
    }
  })
}
