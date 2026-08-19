import Eyebrow from '../common/Eyebrow'
import FadeUp from '../common/FadeUp'
import { PARTNERS } from '../../lib/content'

function Partners() {
  return (
    <section className="bg-[var(--card)] py-16">
      <div className="mx-auto max-w-[1200px] px-5 md:px-16">
        <FadeUp className="text-center">
          <Eyebrow>With Support From</Eyebrow>
        </FadeUp>
        <FadeUp
          as="div"
          delay={0.1}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
        >
          {PARTNERS.map((partner) => (
            <span
              key={partner}
              className="font-serif text-lg text-[var(--muted-foreground)]"
            >
              {partner}
            </span>
          ))}
        </FadeUp>
      </div>
    </section>
  )
}

export default Partners
