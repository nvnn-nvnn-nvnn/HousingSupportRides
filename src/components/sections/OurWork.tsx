import { motion } from 'motion/react'
import Eyebrow from '../common/Eyebrow'
import FadeUp from '../common/FadeUp'
import { PROGRAMS } from '../../lib/content'

function OurWork() {
  return (
    <section id="our-work" className="bg-[var(--background)] py-24">
      <div className="mx-auto max-w-[1200px] px-5 md:px-16">
        <FadeUp className="max-w-2xl">
          <Eyebrow>What We Do</Eyebrow>
          <h2 className="mt-3 font-serif font-semibold" style={{ fontSize: 'clamp(32px, 4vw, 44px)' }}>
            Four Programs, One Watershed
          </h2>
        </FadeUp>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {PROGRAMS.map((program, i) => {
            const Icon = program.icon
            return (
              <motion.article
                key={program.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-[0_1px_2px_rgba(26,47,51,0.04)] transition-shadow duration-300 hover:shadow-[0_18px_40px_-16px_rgba(26,47,51,0.28)]"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--primary)]">
                  <Icon className="h-7 w-7" strokeWidth={1.6} aria-hidden="true" />
                </span>
                <h3 className="mt-6 font-sans text-xl font-semibold text-[var(--foreground)]">
                  {program.title}
                </h3>
                <p className="mt-3 text-[var(--muted-foreground)]" style={{ lineHeight: 1.7 }}>
                  {program.body}
                </p>
                <a
                  href="#get-involved"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] transition-transform group-hover:gap-2.5"
                >
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default OurWork
