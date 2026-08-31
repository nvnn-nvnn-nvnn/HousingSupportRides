import { motion } from 'motion/react'
import Button from '../ui/Button'
import MediaPlaceholder from '../common/MediaPlaceholder'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
}

function Hero() {
  return (
    <section id="top" className="relative min-h-[86vh] overflow-hidden">
      {/* Desktop image — full-bleed to the right viewport edge */}
      <div className="absolute inset-y-0 right-0 hidden md:block md:w-1/2">
        <motion.div
          className="h-full w-full"
          initial={{ clipPath: 'inset(0 0 0 100%)' }}
          animate={{ clipPath: 'inset(0 0 0 0%)' }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <MediaPlaceholder
            alt="A volunteer driver helping a neighbor into a car"
            hint="A volunteer driver opening a car door for a smiling person outside an apartment, warm morning light, hopeful documentary photography"
            className="h-full"
          />
        </motion.div>
      </div>

      {/* Mobile image — background layer behind text with ivory scrim */}
      <div className="absolute inset-0 md:hidden">
        <MediaPlaceholder
          alt="A volunteer driver helping a neighbor into a car"
          hint="A volunteer helping a neighbor, warm morning light"
          chip={false}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(251,248,242,0.97), rgba(251,248,242,0.62))',
          }}
        />
      </div>

      {/* Text */}
      <div className="relative mx-auto flex min-h-[86vh] max-w-[1200px] items-center px-5 md:px-16">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full max-w-[560px] py-24 md:w-1/2 md:max-w-none md:pr-10 md:py-20"
        >
          <motion.p variants={item} className="eyebrow">
            Housing · Rides · Reintegration since 2023
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-5 font-serif font-semibold text-[var(--foreground)]"
            style={{ fontSize: 'clamp(38px, 5vw, 68px)', lineHeight: 1.1 }}
          >
            Everyone deserves <br className="hidden md:block" />
            a way back <br className="hidden md:block" />
            home.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-lg text-[var(--muted-foreground)]"
            style={{ fontSize: 17, lineHeight: 1.78 }}
          >
            Housing Support Rides helps people rebuilding their lives find stable
            housing, reliable transportation, and a community that has their
            back — one neighbor at a time.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
            <Button href="#donate" size="lg">
              Donate
            </Button>
            <Button href="#impact" variants={item} size="lg">
              See Our Impact
            </Button>
          </motion.div>

          <motion.p
            variants={item}
            className="mt-8 text-sm text-[var(--muted-foreground)]"
          >
            Charity Navigator 4-Star · 89 cents of every dollar goes to programs
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
