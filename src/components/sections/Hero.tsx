import { motion } from 'motion/react'
import { Pause, Play } from 'lucide-react'
import Button from '../ui/Button'
import MediaPlaceholder from '../common/MediaPlaceholder'
import { HERO_IMAGES } from '../../lib/content'
import { useSlideshow } from '../../hooks/useSlideshow'
import { cn } from '../../lib/utils'

/** How long each photo stays up before crossfading to the next. */
const SLIDE_MS = 6000
/** Default crop: biased toward the upper-middle on phones, where the faces are. */
const DEFAULT_FOCAL = 'object-[50%_32%] sm:object-center'

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
  const count = HERO_IMAGES.length
  // waitForLoad: slides 2+ aren't mounted until the first photo has loaded,
  // so they don't compete with it for bandwidth (it's the page's LCP image).
  const { index, setIndex, playing, togglePlaying, setHeld, ready: restReady } = useSlideshow(count, {
    intervalMs: SLIDE_MS,
    waitForLoad: true,
  })

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-black"
      aria-roledescription={count > 1 ? 'carousel' : undefined}
      aria-label={count > 1 ? 'Photos from our community' : undefined}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
    >
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
        {/* Slides — all stacked in the same box, crossfading by opacity. They
            MUST stay the first children so both scrims below sit on top of
            every slide; otherwise each new photo fades in over the darkening
            and the headline loses its background.
            Phones get the 1080px file, everything wider the 1920px one. */}
        {HERO_IMAGES.length === 0 ? (
          <MediaPlaceholder
            className={DEFAULT_FOCAL}
            alt="Housing Support Rides"
            hint="A volunteer driver opening a car door for a smiling person outside an apartment, warm morning light, hopeful documentary photography"
          />
        ) : (
          HERO_IMAGES.map((img, i) =>
            i === 0 || restReady ? (
              <img
                key={img.src}
                src={`${img.src}-1920.jpg`}
                srcSet={`${img.src}-1080.jpg 1080w, ${img.src}-1920.jpg 1920w`}
                sizes="100vw"
                alt={img.alt}
                aria-hidden={i !== index}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'low'}
                decoding="async"
                className={cn(
                  'absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-in-out motion-reduce:transition-none',
                  img.focal ?? DEFAULT_FOCAL,
                  i === index ? 'opacity-100' : 'opacity-0',
                )}
              />
            ) : null,
          )
        )}

        {/* Two-part scrim, tuned to keep the photo visible. The flat tint is
            deliberately light — it covers the WHOLE frame only so white text
            never sits on raw highlights. The gradient does the real work,
            concentrating darkness at the bottom where the text actually lives.
            Lands ~20% at the top (photo reads clearly) and ~82% at the very
            bottom (headline stays legible).
            ⚠️ Tune the GRADIENT, not the flat tint — raising the flat value
            dulls the whole photo, which is what made the first pass too dark. */}
        <div className="absolute inset-0 bg-black/10" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(10,6,6,0.64) 0%, rgba(10,6,6,0.10) 60%, rgba(10,6,6,0) 100%)',
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
              style={{ fontSize: 'clamp(26px, 5.2vw, 44px)', lineHeight: 1.15, textShadow }}
            >
              Everyone deserves a way back home.
            </motion.h1>

            {/* Was --primary-on-dark (a light red) — too low-contrast over a busy
                photo. Near-white carries the same emphasis and stays legible. */}
            <motion.p
              variants={item}
              className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90 md:mt-4 md:text-xs"
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

        {/* Slide controls — top-right, clear of the headline and the
            full-width phone button. The Pause button is what makes an
            auto-advancing carousel pass WCAG 2.2.2: hover-to-pause alone
            doesn't exist on a phone. */}
        {count > 1 && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/35 px-2 py-1 backdrop-blur-sm md:right-6 md:top-6">
            {HERO_IMAGES.map((img, i) => (
              <button
                key={img.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1} of ${count}`}
                aria-current={i === index ? 'true' : undefined}
                className="group grid h-7 w-5 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <span
                  className={cn(
                    'block h-2 rounded-full transition-all duration-300',
                    i === index ? 'w-4 bg-white' : 'w-2 bg-white/50 group-hover:bg-white/80',
                  )}
                />
              </button>
            ))}
            <button
              type="button"
              // Also clears the hover hold — the pointer is over the hero when
              // this is clicked, so otherwise Play would appear to do nothing.
              onClick={togglePlaying}
              aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
              className="ml-1 grid h-7 w-7 place-items-center rounded-full text-white/90 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              {playing ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          </div>
        )}
      </motion.div>
    </section>
  )
}

export default Hero
