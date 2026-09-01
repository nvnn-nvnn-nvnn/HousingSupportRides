import { LifeBuoy } from 'lucide-react'
import { NAV_LINKS } from '../../lib/content'

const PROGRAM_LINKS = [
  'Housing Placement',
  'Rides & Transportation',
  'Support & Case Management',
  'Community & Resources',
]

const INVOLVE_LINKS = ['Volunteer', 'Become a Driver', 'Give Monthly', 'Partner With Us']

function Footer() {
  return (
    <footer className="bg-[var(--foreground)] text-[hsl(42,40%,92%)]">
      <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + mission */}
          <div>
           
            <img
              src="/logo.svg"
              alt="Housing Support Rides"
              // className="h-12 w-auto [filter:brightness(0)_invert(1)]"
              className="mx-auto h-24 w-auto sm:mx-0 mb-8"
            />
            <p className="mt-4 font-serif text-lg italic text-white/80">Housing. Rides. Belonging.</p>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Non-emergency medical transport and reintegration support in Saint
              Paul, Minnesota — since 2023.
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
                  href="mailto:hello@housingsupportrides.org"
                  className="transition-colors hover:text-white"
                >
                  hello@housingsupportrides.org
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
          <p>
            © 2026 Housing Support Rides, Inc. · NPI 1801751094 ·{' '}
            <a href="#" className="hover:text-white/85">
              Privacy Policy
            </a>
          </p>
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
