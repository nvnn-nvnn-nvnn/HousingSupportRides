import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import Button from '../ui/Button'
import { NAV_LINKS } from '../../lib/content'
import { cn } from '../../lib/utils'

function Wordmark() {
  return (
    <a href="/" className="flex items-center" aria-label="Housing Support Rides home">
      {/* Circular badge, so it needs more height than the old horizontal
          wordmark did to read at all. Header is 76px — don't exceed h-14. */}
      <img src="/newlogo.png" alt="Housing Support Rides" className="h-12 w-auto md:h-14" />
    </a>
  )
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the mobile overlay is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 h-[76px] w-full transition-shadow',
          scrolled
            ? 'border-b border-[var(--border)] bg-[#e5e5e5]/80 backdrop-blur-md'
            : 'border-b border-transparent bg-[#e5e5e5]',
        )}
      >
        <nav className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-5 md:px-16">
          <Wordmark />

          {/* Center links — desktop only */}
          <ul className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[15px] font-medium text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Button href="/#donate" size="sm" className="px-4 sm:px-5">
              Donate
            </Button>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--foreground)] hover:bg-black/5 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile full-screen overlay menu — sibling of <header> so it isn't
          trapped by the header's backdrop-filter containing block. */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#e5e5e5] px-5 lg:hidden"
          >
            <div className="flex h-[76px] shrink-0 items-center justify-between">
              <Wordmark />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--foreground)] hover:bg-black/5"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <ul className="mt-6 flex flex-col gap-2">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 + i * 0.05 }}
                >
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-[var(--border)] py-4 font-serif text-2xl text-[var(--foreground)]"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className="mt-8 pb-8">
              <Button href="/#donate" size="lg" className="w-full" onClick={() => setOpen(false)}>
                Donate
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
