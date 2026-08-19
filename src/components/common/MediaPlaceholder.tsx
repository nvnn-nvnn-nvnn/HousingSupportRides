import { ImageIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface MediaPlaceholderProps {
  /** Real alt text — reused verbatim when a real <img> replaces this. */
  alt: string
  /** Art-direction note describing the intended photo. */
  hint?: string
  className?: string
  /** Show the small corner "placeholder" chip (default true). */
  chip?: boolean
}

/**
 * Stand-in for a real photograph. Renders a layered teal "water & light"
 * gradient so layout, aspect ratios, and hover effects all work now.
 *
 * TODO: replace each usage with a real <img> (see `hint` for art direction):
 *   <img src="…" alt={alt} className="h-full w-full object-cover" />
 */
function MediaPlaceholder({ alt, hint, className, chip = true }: MediaPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      title={hint ?? alt}
      className={cn('relative h-full w-full overflow-hidden', className)}
      style={{
        backgroundColor: 'var(--primary)',
        backgroundImage:
          'radial-gradient(120% 85% at 18% 12%, hsla(42, 60%, 92%, 0.55), transparent 55%),' +
          'radial-gradient(90% 75% at 88% 95%, hsla(196, 55%, 14%, 0.65), transparent 60%),' +
          'linear-gradient(158deg, hsl(186, 44%, 46%), hsl(186, 58%, 26%) 58%, hsl(196, 46%, 20%))',
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
