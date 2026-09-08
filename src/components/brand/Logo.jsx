/**
 * MA Städ logo.
 *
 * The mark is an M and an A sharing a stroke, cut by a single droplet in the
 * counter of the A: the only literal reference to cleaning, kept small so the
 * mark still reads as a monogram at favicon size.
 */

export const Logo = ({ size = 36, markOnly = false, className }) => (
  <span
    className={className}
    style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.3 }}
  >
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="MA Städ"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="10" fill="var(--color-brand)" />
      {/* M */}
      <path
        d="M10 33V16.5c0-.6.7-.9 1.1-.4L17 23l5.9-6.9c.4-.5 1.1-.2 1.1.4V33"
        stroke="var(--color-surface)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* A */}
      <path
        d="M28 33l5.2-16.1c.3-.8 1.4-.8 1.6 0L40 33"
        stroke="var(--color-surface)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Droplet sitting in the crossbar position of the A */}
      <path
        d="M34 24.4c1.5 1.6 2.3 2.7 2.3 3.7a2.3 2.3 0 1 1-4.6 0c0-1 .8-2.1 2.3-3.7z"
        fill="var(--color-accent)"
      />
    </svg>

    {!markOnly && (
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: size * 0.62,
          letterSpacing: '-0.01em',
          color: 'var(--color-ink)',
          lineHeight: 1,
        }}
      >
        MA Städ
      </span>
    )}
  </span>
);
