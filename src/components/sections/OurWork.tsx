import { motion } from 'motion/react'
import Eyebrow from '../common/Eyebrow'
import FadeUp from '../common/FadeUp'
import { PROGRAMS, MISSION } from '../../lib/content'

function OurWork() {
  return (
    <section id="our-work" className="bg-[var(--background)] py-24">
      <div className="mx-auto max-w-[1200px] px-5 md:px-16">
        <FadeUp className="max-w-2xl">
          <Eyebrow>What We Do</Eyebrow>
          <h2 className="mt-3 font-serif font-semibold" style={{ fontSize: 'clamp(32px, 4vw, 44px)' }}>
            How We Help
          </h2>
          <p className="mt-5 text-[var(--muted-foreground)]" style={{ lineHeight: 1.78 }}>
            {MISSION.purpose}
          </p>
        </FadeUp>

        {/* Stacked one per row. The program bodies are full verbatim paragraphs,
            so side-by-side columns squeezed them; a row gives each one its own
            band, with the icon in a fixed left column and the text capped at a
            readable measure rather than running the full 1200px. */}
        <div className="mt-12 flex flex-col gap-6">
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
                className="group flex flex-col gap-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-[0_1px_2px_rgba(40,18,20,0.05)] transition-shadow duration-300 hover:shadow-[0_18px_40px_-16px_rgba(40,18,20,0.28)] sm:flex-row sm:gap-8 md:p-10"
              >
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--primary)]">
                  <Icon className="h-7 w-7" strokeWidth={1.6} aria-hidden="true" />
                </span>

                <div className="max-w-[68ch]">
                  <h3 className="font-sans text-xl font-semibold text-[var(--foreground)]">
                    {program.title}
                  </h3>
                  <p className="mt-3 text-[var(--muted-foreground)]" style={{ lineHeight: 1.7 }}>
                    {program.body}
                  </p>
                  <a
                    href={`/what-we-do#${program.slug}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] transition-transform group-hover:gap-2.5"
                  >
                    Learn more <span aria-hidden="true">→</span>
                  </a>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default OurWork
