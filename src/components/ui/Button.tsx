import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'outline' | 'outline-light' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-sans font-medium ' +
  'transition-all duration-200 cursor-pointer whitespace-nowrap ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-[var(--primary)] focus-visible:ring-offset-[var(--background)] ' +
  'disabled:opacity-60 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  // Warm orange donate / primary action
  primary:
    'bg-[var(--accent-warm)] text-white shadow-sm hover:brightness-95 hover:shadow-md active:brightness-90',
  // Teal outline on ivory
  outline:
    'border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent-soft)]',
  // Light outline for use on the teal donate band
  'outline-light':
    'border-2 border-white/70 text-white hover:bg-white/10',
  // Text-style link button
  ghost: 'text-[var(--primary)] hover:opacity-70 px-0',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-[15px]',
  lg: 'px-7 py-3.5 text-base',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined }
type ButtonAsAnchor = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & { href: string }

type ButtonProps = ButtonAsButton | ButtonAsAnchor

/**
 * Shared button. Renders an <a> when `href` is present (used for anchor-scroll
 * nav and CTAs), otherwise a <button>. Variants map to the design's orange
 * primary, teal outline, and light-on-teal styles.
 */
function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  const classes = cn(base, variants[variant], variant !== 'ghost' && sizes[size], className)

  if ('href' in props && props.href !== undefined) {
    return (
      <a className={classes} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    )
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  )
}

export default Button
