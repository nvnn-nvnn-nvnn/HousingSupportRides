import { motion } from 'motion/react'
import Eyebrow from '../common/Eyebrow'
import FadeUp from '../common/FadeUp'
import Button from '../ui/Button'
import { INVOLVEMENT } from '../../lib/content'

function GetInvolved() {
  return (
    <section id="get-involved" className="bg-[var(--accent-soft)] py-24">
      <div className="mx-auto max-w-[1200px] px-5 md:px-16">
        <FadeUp className="max-w-2xl">
          <Eyebrow>Join Us</Eyebrow>
          <h2 className="mt-3 font-serif font-semibold" style={{ fontSize: 'clamp(32px, 4vw, 44px)' }}>
            Three Ways to Help
          </h2>
        </FadeUp>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {INVOLVEMENT.map((route, i) => {
            const Icon = route.icon
            return (
              <motion.div
                key={route.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-start rounded-xl border border-[var(--border)] bg-[var(--background)] p-8"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--primary)]">
                  <Icon className="h-7 w-7" strokeWidth={1.6} aria-hidden="true" />
                </span>
                <h3 className="mt-6 font-sans text-xl font-semibold text-[var(--foreground)]">
                  {route.title}
                </h3>
                <p className="mt-3 flex-1 text-[var(--muted-foreground)]" style={{ lineHeight: 1.7 }}>
                  {route.body}
                </p>
                <div className="mt-6">
                  <Button href={route.href} variant="outline" size="sm">
                    {route.cta}
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default GetInvolved
