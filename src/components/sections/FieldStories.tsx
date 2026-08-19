import { motion } from 'motion/react'
import Eyebrow from '../common/Eyebrow'
import FadeUp from '../common/FadeUp'
import MediaPlaceholder from '../common/MediaPlaceholder'
import { FIELD_STORIES } from '../../lib/content'
import { cn } from '../../lib/utils'

type Story = (typeof FIELD_STORIES)[number]

function StoryCard({ story, index }: { story: Story; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative overflow-hidden rounded-xl',
        story.feature
          ? 'min-h-[420px] md:col-span-2 lg:row-span-2 lg:min-h-[540px]'
          : 'min-h-[260px]',
      )}
    >
      {/* Image (placeholder) — scales up on hover */}
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
        <MediaPlaceholder alt={story.imageAlt} hint={story.imageHint} chip={false} className="h-full" />
      </div>

      {/* Teal duotone wash — lifts on hover */}
      <div
        className="absolute inset-0 mix-blend-multiply opacity-30 transition-opacity duration-500 group-hover:opacity-0"
        style={{ background: 'var(--primary)' }}
      />

      {/* Caption gradient + text */}
      <div
        className="absolute inset-x-0 bottom-0 p-6"
        style={{ background: 'linear-gradient(to top, rgba(26,47,51,0.92), transparent)' }}
      >
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
          {story.category}
        </span>
        <h3 className="mt-2 font-serif font-semibold text-white" style={{ fontSize: story.feature ? 30 : 24 }}>
          {story.title}
        </h3>
        <p className="mt-2 max-w-md text-sm text-white/80">{story.blurb}</p>
        <a
          href={`/journal/${story.slug}`}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-white transition-all group-hover:gap-2.5"
        >
          Read the story <span aria-hidden="true">→</span>
        </a>
      </div>
    </motion.article>
  )
}

function FieldStories() {
  return (
    <section id="field-stories" className="bg-[var(--background)] py-24">
      <div className="mx-auto max-w-[1200px] px-5 md:px-16">
        <FadeUp className="max-w-2xl">
          <Eyebrow>From the Field</Eyebrow>
          <h2 className="mt-3 font-serif font-semibold" style={{ fontSize: 'clamp(32px, 4vw, 44px)' }}>
            What It Looks Like on the Ground
          </h2>
        </FadeUp>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
          {FIELD_STORIES.map((story, i) => (
            <StoryCard key={story.title} story={story} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FieldStories
