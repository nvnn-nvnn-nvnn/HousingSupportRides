import { motion } from 'motion/react'
import Button from '../ui/Button'
import MediaPlaceholder from '../common/MediaPlaceholder'
import { HERO_IMAGE, PROGRAM_DESCRIPTION } from '../../lib/content'

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
    <section id="top" className="relative overflow-hidden bg-black">
      {/* Full-width community photo, 4:3 to match the source — so on phones the
          whole frame shows, nobody cropped.

          ⚠️ The max-height is what keeps this sane on a desktop. Width-driven
          4:3 means a 1920px monitor gets a 1440px-tall hero: the visitor has to
          scroll past a wall of photo before reaching any content. The cap takes
          over once 4:3 would exceed it (roughly 1150px wide and up), and
          object-cover trims top and bottom instead. min() so a 4K display
          doesn't go back to enormous. */}
      <motion.div
        className="relative max-h-[min(86vh,900px)] w-full"
        style={{ aspectRatio: '4 / 3' }}
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <MediaPlaceholder
          src={HERO_IMAGE}
          eager
          alt="A large group of Housing Support Rides clients, volunteers, and staff gathered outdoors, several holding recovery milestone certificates"
          hint="A volunteer driver opening a car door for a smiling person outside an apartment, warm morning light, hopeful documentary photography"
        />

        {/* Scrim so the overlaid text reads clearly, without hiding the photo */}
        <div
          className="absolute inset-x-0 bottom-0 h-3/4"
          style={{
            background:
              'linear-gradient(to top, rgba(10,6,6,0.92), rgba(10,6,6,0.5) 55%, transparent 100%)',
          }}
        />

        {/* Text — overlaid on the lower part of the photo, given more room
            to breathe. Sizing/spacing scale down on mobile and up at md+. */}
        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[1200px] px-5 pb-6 pt-6 md:px-16 md:pb-16 md:pt-8">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl">
            <motion.h1
              variants={item}
              className="font-serif font-semibold text-white"
              style={{ fontSize: 'clamp(22px, 6vw, 56px)', lineHeight: 1.15 }}
            >
              Everyone deserves a way back home.
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--primary-on-dark)] md:mt-3 md:text-[11px] md:tracking-[0.16em]"
            >
              Housing · Transportation · Community Resources since 2023
            </motion.p>

            <motion.p
              variants={item}
              className="mt-2 max-w-lg text-sm text-white/85 md:mt-4 md:text-base"
              style={{ lineHeight: 1.6 }}
            >
              {PROGRAM_DESCRIPTION.intro}
            </motion.p>

            <motion.div variants={item} className="mt-3 flex flex-wrap gap-2.5 md:mt-6 md:gap-3">
              <Button href="#donate" size="sm" className="md:px-7 md:py-3.5 md:text-base">
                Donate
              </Button>
              {/* PLACEHOLDER — points at the ImpactCounters section, which is
                  commented out in App.tsx. Restore both together.
              <Button
                href="#impact"
                variant="outline-light"
                size="sm"
                className="md:px-7 md:py-3.5 md:text-base"
              >
                See Our Impact
              </Button> */}
            </motion.div>

            <motion.p variants={item} className="mt-2 text-xs text-white/65 md:mt-5 md:text-sm">
              A nonprofit charitable organization serving Saint Paul, Minnesota
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
