import { motion } from 'motion/react'
import { useCountUp } from '../../hooks/useCountUp'
import { IMPACT_STATS } from '../../lib/content'

function Counter({ value, label, index }: { value: number; label: string; index: number }) {
  const { ref, value: current } = useCountUp(value)

  return (
    <div className="px-4 py-6 text-center md:px-8">
      <span
        ref={ref}
        className="block font-serif font-semibold tabular-nums text-[var(--primary)]"
        style={{ fontSize: 'clamp(44px, 6vw, 84px)', lineHeight: 1 }}
      >
        {current.toLocaleString('en-US')}
      </span>

      {/* Thin teal rule that scales in from the left */}
      <motion.span
        className="mx-auto mt-4 block h-[2px] w-16 origin-left bg-[var(--primary)]"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, delay: 0.3 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      />

      <span className="mt-4 block text-sm text-[var(--muted-foreground)]">{label}</span>
    </div>
  )
}

function ImpactCounters() {
  return (
    <section id="impact" className="bg-[var(--card)] py-20">
      <div className="mx-auto max-w-[1200px] px-5 md:px-16">
        <div className="grid grid-cols-2 gap-y-8 divide-[var(--border)] md:grid-cols-4 md:divide-x">
          {IMPACT_STATS.map((stat, i) => (
            <Counter key={stat.label} value={stat.value} label={stat.label} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ImpactCounters
