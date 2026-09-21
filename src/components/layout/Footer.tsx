import { LifeBuoy } from 'lucide-react'
import { NAV_LINKS } from '../../lib/content'

// The three official program names, matching PROGRAMS in content.ts.
const PROGRAM_LINKS = [
  'Housing Support Program',
  'Transportation Support Program',
  'Community Support and Resource Navigation',
]

const INVOLVE_LINKS = ['Volunteer', 'Become a Driver', 'Give Monthly', 'Partner With Us']

function Footer() {
  return (
    <footer className="bg-[var(--foreground)] text-[hsl(42,40%,92%)]">
      <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + mission */}
          <div>
            {/* Primary mark: the circular badge. It carries its own gold rim
                and light interior, so it reads on the near-black footer
                without any filter. */}
            <img
              src="/newlogo.png"
              alt="Housing Support Rides"
              className="mx-auto h-28 w-auto sm:mx-0 mb-8"
            />
            <p className="mt-4 font-serif text-lg italic text-white/80">Housing. Rides. Belonging.</p>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              A nonprofit charitable organization connecting neighbors facing
              homelessness, housing instability, and transportation barriers with
              safe housing, reliable rides, and community resources. Saint Paul,
              Minnesota — since 2023.
            </p>
          </div>

          {/* Programs */}
          <nav aria-label="Programs">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
              Programs
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {PROGRAM_LINKS.map((label) => (
                <li key={label}>
                  <a href="/#our-work" className="text-white/75 transition-colors hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Get involved */}
          <nav aria-label="Get involved">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
              Get Involved
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {INVOLVE_LINKS.map((label) => (
                <li key={label}>
                  <a href="/#get-involved" className="text-white/75 transition-colors hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
              Contact
            </h3>
            <address className="mt-4 space-y-3 text-sm not-italic text-white/75">
              <p>
                917 Edmund Ave
                <br />
                Saint Paul, MN 55104
              </p>
              <p>
                <a href="tel:+17635017764" className="transition-colors hover:text-white">
                  (763) 501-7764
                </a>
              </p>
              <p>
                <a
                  href="mailto:hsr@housingsupportrides.org"
                  className="transition-colors hover:text-white"
                >
                  hsr@housingsupportrides.org
                </a>
              </p>
            </address>
            {/* Secondary nav for small screens / SEO */}
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-white/80">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/12 pt-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          {/* The original maroon lockup, kept as a colophon mark beside the
              copyright. It's maroon (#7F1416) on a near-black footer, which
              would barely read at this size — the filter flattens it to white
              and the low opacity keeps it secondary to the badge above.
              alt="" because the copyright line already names the org; without
              it a screen reader announces "Housing Support Rides" twice. */}
          <div className="flex items-center gap-3.5">
            <img
              src="/logo.svg"
              alt=""
              aria-hidden="true"
              className="h-9 w-auto shrink-0 opacity-50 [filter:brightness(0)_invert(1)]"
            />
            <p>
              © 2026 Housing Support Rides, Inc. · NPI 1801751094 ·{' '}
              <a href="#" className="hover:text-white/85">
                Privacy Policy
              </a>
            </p>
          </div>
          <a
            href="/contact"
            className="inline-flex items-center gap-1.5 font-medium text-[var(--rb-orange)] hover:brightness-110"
          >
            <LifeBuoy className="h-4 w-4" />
            Need a ride or support? Get help
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
