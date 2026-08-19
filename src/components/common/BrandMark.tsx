interface BrandMarkProps {
  className?: string
}

/** Simple river-bend mark — two flowing curves. Inherits color via stroke. */
function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Housing Support Rides"
      className={className}
    >
      <path
        d="M3 9c6 0 6 6 12 6s7-6 14-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M3 18c6 0 6 6 12 6s7-6 14-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}

export default BrandMark
