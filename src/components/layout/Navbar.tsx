import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import BrandMark from '../common/BrandMark'
import Button from '../ui/Button'
import { NAV_LINKS } from '../../lib/content'
import { cn } from '../../lib/utils'

function Wordmark() {
  return (
    <a href="/" className="flex items-center gap-2.5" aria-label="Housing Support Rides home">
      <BrandMark className="h-8 w-8 text-[var(--primary)]" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-lg font-semibold tracking-tight text-[var(--foreground)]">
          Housing Support
        </span>
        <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
          Rides
        </span>
      </span>
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
    <header
      className={cn(
        'sticky top-0 z-40 h-[76px] w-full transition-shadow',
        scrolled
          ? 'border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md'
          : 'border-b border-transparent bg-[var(--background)]',
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
                className="text-[15px] text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Button href="/#donate" size="sm" className="px-5">
            Donate
          </Button>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--foreground)] hover:bg-[var(--card)] lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-[var(--background)] px-5 lg:hidden"
          >
            <div className="flex h-[76px] items-center justify-between">
              <Wordmark />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--foreground)] hover:bg-[var(--card)]"
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

            <div className="mt-8">
              <Button href="/#donate" size="lg" className="w-full" onClick={() => setOpen(false)}>
                Donate
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
