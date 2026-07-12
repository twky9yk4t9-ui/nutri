// One consistent inline-SVG icon set (SF-Symbols-like): 24px grid, 1.9 stroke,
// round caps/joins, optically centred. Never emoji. Color via currentColor.

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

/* ---- navigation ---- */

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
    <path d="M18.5 6.5h-4M18.5 6.5v4" />
  </svg>
)

export const IconSettings = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7" />
  </svg>
)

/* ---- actions & affordances ---- */

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

export const IconPlus = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconInfo = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <circle cx="12" cy="12" r="8.7" />
    <path d="M12 11v5.2" />
    <path d="M12 7.6h.01" />
  </svg>
)

/* ---- domain states ---- */

export const IconSnow = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M12 3v18M12 3l-2.5 2.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5" />
    <path d="M4.2 7.5 19.8 16.5M4.2 7.5l.9 3.4M4.2 7.5l3.4-.9M19.8 16.5l-.9-3.4M19.8 16.5l-3.4.9" />
    <path d="M19.8 7.5 4.2 16.5M19.8 7.5l-3.4-.9M19.8 7.5l-.9 3.4M4.2 16.5l3.4.9M4.2 16.5l.9-3.4" />
  </svg>
)

export const IconScale = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <rect x="3.5" y="4" width="17" height="16" rx="3" />
    <path d="M8 9.5a4.6 4.6 0 0 1 8 0" />
    <path d="M12 9.2 13.6 7" />
  </svg>
)

export const IconFlask = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M9.5 3.5h5M10.5 3.5v5L5.6 17a2.4 2.4 0 0 0 2.2 3.5h8.4a2.4 2.4 0 0 0 2.2-3.5l-4.9-8.5v-5" />
    <path d="M7.6 14.5h8.8" />
  </svg>
)

/* ---- food glyphs (recipe rows) ---- */

export const IconBird = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M6 20c5.5 0 10.5-2.6 10.5-8.2V9.4a3.7 3.7 0 0 0-7.4 0c0 1.8-1.6 3-3.6 4.4L4 14.9l2.6 1c-.4 1.6-.6 2.7-.6 4.1Z" />
    <path d="M15.7 8.2 18.8 9l-3 1.6" />
    <path d="M12.4 8.4h.01" />
  </svg>
)

export const IconCow = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M7.5 6.5C6 5.5 4.6 5.4 3.2 5.9c.6 1.5 1.6 2.4 3.1 2.8M16.5 6.5c1.5-1 2.9-1.1 4.3-.6-.6 1.5-1.6 2.4-3.1 2.8" />
    <path d="M7 8.5C7 6.6 9.2 5 12 5s5 1.6 5 3.5c0 1.4-.6 2.6-1.5 3.7.9.8 1.5 2 1.5 3.3 0 2.5-2.2 4.5-5 4.5s-5-2-5-4.5c0-1.3.6-2.5 1.5-3.3C7.6 11.1 7 9.9 7 8.5Z" />
    <path d="M10 15.7h.01M14 15.7h.01" />
  </svg>
)

export const IconFish = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M3.5 12c2.4-3.6 5.8-5.5 9.4-5.5 3.2 0 5.9 1.9 7.6 5.5-1.7 3.6-4.4 5.5-7.6 5.5-3.6 0-7-1.9-9.4-5.5Z" />
    <path d="M20.5 12 22 9.2M20.5 12 22 14.8" />
    <path d="M7.6 10.7h.01" />
  </svg>
)

export const IconBowl = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M4 11.5h16a8 8 0 0 1-16 0Z" />
    <path d="M9.5 7.5c.9-1 .9-2 0-3M14 8c.9-1 .9-2 0-3" />
  </svg>
)

export const IconApple = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M12 7.6c-.7-.8-1.9-1.3-3.1-1.1-2.4.4-3.9 2.8-3.4 5.8.5 3.3 2.7 6.6 4.8 6.6.7 0 1.1-.3 1.7-.3s1 .3 1.7.3c2.1 0 4.3-3.3 4.8-6.6.5-3-1-5.4-3.4-5.8-1.2-.2-2.4.3-3.1 1.1Z" />
    <path d="M12 7.6c0-1.8.9-3 2.6-3.6" />
  </svg>
)

/* ---- tag & section glyphs ---- */

export const IconBolt = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M13.2 2.8 5.5 13.4h5l-1 7.8 7.9-10.8h-5l.8-7.6Z" />
  </svg>
)

export const IconClock = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <circle cx="12" cy="12" r="8.7" />
    <path d="M12 7.2V12l3.2 2" />
  </svg>
)

export const IconPot = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M5 9.5h14v5.5a4.5 4.5 0 0 1-4.5 4.5h-5A4.5 4.5 0 0 1 5 15V9.5Z" />
    <path d="M2.5 11.5 5 10.2M21.5 11.5 19 10.2M8.5 6.7c.8-.9.8-1.8 0-2.7M12.5 7c.8-.9.8-1.8 0-2.7M16 6.7c.8-.9.8-1.8 0-2.7" />
  </svg>
)

export const IconLeaf = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M19.5 4.5c.6 7.6-2.8 14-9.3 14-2.9 0-5-1.8-5.6-4.3C4 9.3 9.7 4.9 19.5 4.5Z" />
    <path d="M5.5 19.5c2.4-4.9 5.8-8.4 10-10.5" />
  </svg>
)

export const IconBox = ({ size }: IconProps) => (
  <svg {...svgProps(size)}>
    <rect x="3.5" y="4" width="17" height="4.5" rx="1.2" />
    <path d="M5 8.5v9c0 1.4 1.1 2.5 2.5 2.5h9c1.4 0 2.5-1.1 2.5-2.5v-9" />
    <path d="M10 12.5h4" />
  </svg>
)
