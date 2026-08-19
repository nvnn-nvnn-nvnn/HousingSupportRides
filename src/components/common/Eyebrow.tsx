import { cn } from '../../lib/utils'

interface EyebrowProps {
  children: React.ReactNode
  className?: string
}

/** Small uppercase teal label that sits above section headings. */
function Eyebrow({ children, className }: EyebrowProps) {
  return <p className={cn('eyebrow', className)}>{children}</p>
}

export default Eyebrow
