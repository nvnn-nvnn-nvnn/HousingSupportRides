import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check } from 'lucide-react'
import FadeUp from '../common/FadeUp'

function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <section className="bg-[var(--primary)] py-20 text-[var(--primary-foreground)]">
      <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
        <FadeUp>
          <h2 className="font-serif font-semibold" style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.15 }}>
            Two emails a month. Both worth opening.
          </h2>
          <p className="mt-4 text-white/80">
            Neighbor stories, volunteer needs, and the occasional call to show up somewhere.
          </p>
        </FadeUp>

        <FadeUp delay={0.1} className="mt-8">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.p
                key="thanks"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 font-medium"
              >
                <Check className="h-5 w-5" aria-hidden="true" />
                Thanks — check your inbox to confirm.
              </motion.p>
            ) : (
              <motion.form
                key="form"
                exit={{ opacity: 0 }}
                onSubmit={(e) => {
                  e.preventDefault()
                  // TODO: wire to a real newsletter provider
                  if (email) setSubmitted(true)
                }}
                className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full flex-1 rounded-full border-2 border-transparent bg-[var(--background)] px-5 py-3.5 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent-warm)] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[var(--accent-warm)] px-7 py-3.5 font-semibold text-white transition-all duration-200 hover:brightness-95 active:brightness-90"
                >
                  Subscribe
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </FadeUp>
      </div>
    </section>
  )
}

export default Newsletter
