import { ImageIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface MediaPlaceholderProps {
  /** Real alt text — used on the <img> or as the placeholder's aria-label. */
  alt: string
  /**
   * Path to a real image (e.g. "/img/hero.jpg" from the public/ folder).
   * When set, a real <img> is rendered; otherwise the gradient placeholder.
   */
  src?: string
  /** Art-direction note describing the intended photo. */
  hint?: string
  className?: string
  /** Show the small corner "placeholder" chip when no image (default true). */
  chip?: boolean
  /** Load the image eagerly (use for above-the-fold images like the hero). */
  eager?: boolean
}

/**
 * Renders a real photo when `src` is provided, or a layered maroon gradient
 * stand-in when it isn't — so layout, aspect ratios, and hover effects work
 * either way. Drop images in public/img/ and pass their path as `src`.
 */
function MediaPlaceholder({ alt, src, hint, className, chip = true, eager }: MediaPlaceholderProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={cn('h-full w-full object-cover', className)}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={alt}
      title={hint ?? alt}
      className={cn('relative h-full w-full overflow-hidden', className)}
      style={{
        backgroundColor: 'var(--primary)',
        backgroundImage:
          'radial-gradient(120% 85% at 18% 12%, hsla(42, 60%, 92%, 0.5), transparent 55%),' +
          'radial-gradient(90% 75% at 88% 95%, hsla(0, 55%, 9%, 0.65), transparent 60%),' +
          'linear-gradient(158deg, hsl(3, 52%, 38%), hsl(359, 73%, 27%) 58%, hsl(0, 60%, 15%))',
      }}
    >
      {chip && (
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/85 backdrop-blur-sm">
          <ImageIcon className="h-3 w-3" aria-hidden="true" />
          Placeholder
        </span>
      )}
    </div>
  )
}

export default MediaPlaceholder
