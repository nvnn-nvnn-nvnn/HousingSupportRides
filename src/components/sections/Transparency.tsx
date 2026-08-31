import { motion } from 'motion/react'
import { Download } from 'lucide-react'
import Eyebrow from '../common/Eyebrow'
import FadeUp from '../common/FadeUp'
import { BUDGET_SEGMENTS, DOCUMENTS } from '../../lib/content'

function Transparency() {
  return (
    <section id="transparency" className="bg-[var(--background)] py-24">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-14 px-5 md:px-16 lg:grid-cols-2 lg:gap-20">
        {/* Left — heading, bar, paragraph */}
        <FadeUp>
          <Eyebrow>Accountability</Eyebrow>
          <h2 className="mt-3 font-serif font-semibold" style={{ fontSize: 'clamp(32px, 4vw, 44px)' }}>
            Where the Money Goes
          </h2>

          {/* Stacked bar */}
          <div className="mt-8 flex h-5 w-full overflow-hidden rounded-full">
            {BUDGET_SEGMENTS.map((seg, i) => (
              <motion.div
                key={seg.label}
                initial={{ width: 0 }}
                whileInView={{ width: `${seg.pct}%` }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: seg.color }}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Legend */}
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {BUDGET_SEGMENTS.map((seg) => (
              <li key={seg.label} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: seg.color }}
                  aria-hidden="true"
                />
                <span className="text-[var(--foreground)]">
                  {seg.label} <span className="font-semibold">{seg.pct}%</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-6 max-w-lg text-[var(--muted-foreground)]" style={{ lineHeight: 1.78 }}>
            We publish our financials in full because we ask you to trust us with money.
            Eighty-nine cents of every dollar goes directly to programs — housing,
            rides, support, and resources. The rest keeps the lights on and the
            grants coming.
          </p>
        </FadeUp>

        {/* Right — document links */}
        <FadeUp delay={0.1}>
          <ul className="lg:mt-14">
            {DOCUMENTS.map((doc) => (
              <li key={doc}>
                <a
                  href="#"
                  className="group flex items-center justify-between gap-4 border-t border-[var(--border)] py-5 last:border-b"
                >
                  <span className="font-sans text-lg text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
                    {doc}
                  </span>
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--card)] text-[var(--primary)] transition-colors group-hover:bg-[var(--accent-soft)]">
                    <Download className="h-5 w-5" aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </FadeUp>
      </div>
    </section>
  )
}

export default Transparency
