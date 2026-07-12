// Minimal inline icon set — no icon library (offline, tiny bundle).

interface IconProps {
  size?: number
}

const svgProps = (size = 22) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

export const IconToday = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9 19 19M19 5l-2.1 2.1M7.1 16.9 5 19" />
  </svg>
)

export const IconWeek = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
    <path d="M3.5 9.5h17M8.8 4.5V2.8M15.2 4.5V2.8M8.8 13h.01M12 13h.01M15.2 13h.01M8.8 16.5h.01M12 16.5h.01" />
  </svg>
)

export const IconRecipes = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M4 19.2V6.3c0-1 .8-1.8 1.8-1.8H20v13.7" />
    <path d="M4 19.2c0-1 .8-1.8 1.8-1.8H20M20 17.4v3.8H5.8c-1 0-1.8-.8-1.8-1.8" />
    <path d="M9 8.5h7M9 12h5" />
  </svg>
)

export const IconGrocery = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M3 4h2.2l2.2 11.5h11.2L21 7.5H6" />
    <circle cx="9.5" cy="19.5" r="1.4" />
    <circle cx="16.9" cy="19.5" r="1.4" />
  </svg>
)

export const IconTrends = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M3.5 20.5h17" />
    <path d="M4.5 15.5 9 10.5l3.5 3 6-7" />
    <path d="M18.5 6.5h-4M18.5 6.5v4" transform="translate(0 0)" />
  </svg>
)

export const IconSettings = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7" />
  </svg>
)

export const IconCheck = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

export const IconSwap = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M4 8h13M14 4.5 17.5 8 14 11.5" />
    <path d="M20 16H7M10 12.5 6.5 16l3.5 3.5" />
  </svg>
)

export const IconChevronLeft = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M14.5 5.5 8 12l6.5 6.5" />
  </svg>
)

export const IconChevronRight = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M9.5 5.5 16 12l-6.5 6.5" />
  </svg>
)

export const IconSnow = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M12 3v18M12 3l-2.5 2.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5" />
    <path d="M4.2 7.5 19.8 16.5M4.2 7.5l.9 3.4M4.2 7.5l3.4-.9M19.8 16.5l-.9-3.4M19.8 16.5l-3.4.9" />
    <path d="M19.8 7.5 4.2 16.5M19.8 7.5l-3.4-.9M19.8 7.5l-.9 3.4M4.2 16.5l3.4.9M4.2 16.5l.9-3.4" />
  </svg>
)
