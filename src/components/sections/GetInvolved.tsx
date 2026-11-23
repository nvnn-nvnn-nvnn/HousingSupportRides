import { motion } from 'motion/react'
import Eyebrow from '../common/Eyebrow'
import FadeUp from '../common/FadeUp'
import Button from '../ui/Button'
import { INVOLVEMENT } from '../../lib/content'

/**
 * "Three Ways to Help": photo cards. Each card is a photo (3:2) with the
 * icon badge overlapping its bottom edge, then title, body and button.
 * Photos: `image` on each INVOLVEMENT entry (public/img/cards/).
 */
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
                className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] transition-shadow duration-300 hover:shadow-[0_18px_40px_-16px_rgba(40,18,20,0.28)]"
              >
                <div className="relative">
                  <div className="aspect-[3/2] overflow-hidden">
                    <img
                      src={`${route.image}-960.jpg`}
                      srcSet={`${route.image}-640.jpg 640w, ${route.image}-960.jpg 960w`}
                      sizes="(min-width: 768px) 360px, 100vw"
                      alt={route.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
                    />
                  </div>
                  <span className="absolute -bottom-7 left-8 inline-flex h-14 w-14 items-center justify-center rounded-full border-4 border-[var(--background)] bg-[var(--accent-soft)] text-[var(--primary)]">
                    <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col items-start px-8 pb-8 pt-11">
                  <h3 className="font-sans text-xl font-semibold text-[var(--foreground)]">{route.title}</h3>
                  <p className="mt-3 flex-1 text-[var(--muted-foreground)]" style={{ lineHeight: 1.7 }}>
                    {route.body}
                  </p>
                  <div className="mt-6">
                    <Button href={route.href} variant="outline" size="sm">
                      {route.cta}
                    </Button>
                  </div>
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
