import { motion } from 'motion/react'
import Button from '../ui/Button'
import MediaPlaceholder from '../common/MediaPlaceholder'
import { HERO_IMAGE } from '../../lib/content'

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

/** Keeps white text legible over the photo's bright patches (sky, certificates). */
const textShadow = '0 2px 14px rgba(0,0,0,0.55)'

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-black">
      {/* Taller on phones (4:5), wider on tablet+ (4:3). A 4:3 frame on a 390px
          phone is only ~290px tall — a squashed letterbox that wastes the photo
          and crams the text. The taller mobile crop gives both room.

          ⚠️ The max-height is what keeps this sane on a desktop. Width-driven
          4:3 means a 1920px monitor gets a 1440px-tall hero: the visitor has to
          scroll past a wall of photo before reaching any content. The cap takes
          over once 4:3 would exceed it (roughly 1150px wide and up), and
          object-cover trims top and bottom instead. min() so a 4K display
          doesn't go back to enormous. */}
      <motion.div
        className="relative aspect-[4/5] max-h-[min(86vh,900px)] w-full sm:aspect-[4/3]"
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* object-position biases toward the upper-middle on phones, where the
            faces are — the default centre crop cut heads off in the 4:5 frame. */}
        <MediaPlaceholder
          src={HERO_IMAGE}
          eager
          className="object-[50%_32%] sm:object-center"
          alt="A large group of Housing Support Rides clients, volunteers, and staff gathered outdoors, several holding recovery milestone certificates"
          hint="A volunteer driver opening a car door for a smiling person outside an apartment, warm morning light, hopeful documentary photography"
        />

        {/* Two-part scrim, tuned to keep the photo visible. The flat tint is
            deliberately light — it covers the WHOLE frame only so white text
            never sits on raw highlights. The gradient does the real work,
            concentrating darkness at the bottom where the text actually lives.
            Lands ~20% at the top (photo reads clearly) and ~82% at the very
            bottom (headline stays legible).
            ⚠️ Tune the GRADIENT, not the flat tint — raising the flat value
            dulls the whole photo, which is what made the first pass too dark. */}
        <div className="absolute inset-0 bg-black/20" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(10,6,6,0.78) 0%, rgba(10,6,6,0.15) 60%, rgba(10,6,6,0) 100%)',
          }}
        />

        {/* Text — headline, tagline, one button. The org description that used
            to sit here moved to OurWork: a paragraph of body copy over a photo
            is hard to read and buries the call to action. */}
        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[1200px] px-5 pb-8 md:px-16 md:pb-16">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl">
            <motion.h1
              variants={item}
              className="font-serif font-bold text-white"
              style={{ fontSize: 'clamp(32px, 7.5vw, 64px)', lineHeight: 1.08, textShadow }}
            >
              Everyone deserves a way back home.
            </motion.h1>

            {/* Was --primary-on-dark (a light red) — too low-contrast over a busy
                photo. Near-white carries the same emphasis and stays legible. */}
            <motion.p
              variants={item}
              className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/90 md:mt-5 md:text-sm"
              style={{ textShadow }}
            >
              Support · Transportation · Housing · Resources
            </motion.p>

            <motion.div variants={item} className="mt-7 md:mt-8">
              {/* Learn More, not Donate (2026-09-22): a first-time visitor who
                  doesn't yet know what HSR does isn't ready to give. This sends
                  them to the programs page; DonateBlock still carries the ask
                  further down the landing page.
                  Full-width on phones so it's an easy thumb target, auto width
                  once there's room beside it. */}
              <Button href="/what-we-do" size="lg" className="w-full text-center sm:w-auto">
                Learn More
              </Button>
            </motion.div>

            <motion.p
              variants={item}
              className="mt-5 text-xs text-white/75 md:text-sm"
              style={{ textShadow }}
            >
              A nonprofit charitable organization serving Saint Paul, Minnesota
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
