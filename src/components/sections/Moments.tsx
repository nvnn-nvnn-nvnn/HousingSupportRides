import { motion } from 'motion/react'
import Eyebrow from '../common/Eyebrow'
import FadeUp from '../common/FadeUp'
import Button from '../ui/Button'
import { MOMENTS } from '../../lib/content'

/**
 * "Out in the Community": a photo mosaic of things we've actually done.
 *
 * Layout (desktop): one big tile on the left spanning two rows, four small
 * tiles in a 2×2 on the right. Phones: big tile full width, then a 2-column
 * grid. Captions sit on a gradient at the bottom of each tile and are always
 * visible. Hover only zooms the photo, so nothing is hidden on touch screens.
 *
 * Data: MOMENTS in src/lib/content.ts. See how-to/moments-section.md.
 */
function Moments() {
  const tiles = MOMENTS.slice(0, 5)
  if (tiles.length === 0) return null

  return (
    <section id="moments" className="bg-[var(--card)] py-24">
      <div className="mx-auto max-w-[1200px] px-5 md:px-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <FadeUp className="max-w-2xl">
            <Eyebrow>Out in the Community</Eyebrow>
            <h2 className="mt-3 font-serif font-semibold" style={{ fontSize: 'clamp(32px, 4vw, 44px)' }}>
              What We've Been Up To
            </h2>
            <p className="mt-4 text-[var(--muted-foreground)]" style={{ lineHeight: 1.78 }}>
              Recovery happens in community. Here's some of what our members and volunteers have done together.
            </p>
          </FadeUp>
          <FadeUp delay={0.1} className="shrink-0">
            <Button href="/gallery" variant="outline">
              See the full gallery <span aria-hidden="true">→</span>
            </Button>
          </FadeUp>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2 md:gap-4">
          {tiles.map((m, i) => {
            const big = i === 0
            return (
              <motion.figure
                key={m.src}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={
                  'group relative overflow-hidden rounded-2xl bg-[var(--accent-soft)] ' +
                  (big ? 'col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto' : 'aspect-square md:aspect-[4/3]')
                }
              >
                <img
                  src={`${m.src}-900.jpg`}
                  srcSet={
                    big
                      ? `${m.src}-900.jpg 900w, ${m.src}-1400.jpg 1400w`
                      : `${m.src}-600.jpg 600w, ${m.src}-900.jpg 900w`
                  }
                  sizes={big ? '(min-width: 768px) 560px, 100vw' : '(min-width: 768px) 270px, 50vw'}
                  alt={m.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
                />
                <figcaption
                  className={
                    'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent text-white ' +
                    (big ? 'p-5 pt-16 text-lg font-semibold md:p-7 md:text-2xl' : 'p-3 pt-10 text-sm font-medium md:p-4')
                  }
                >
                  <span className={big ? 'font-serif' : ''}>{m.caption}</span>
                </figcaption>
              </motion.figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Moments
