// All date handling is device-local (spec §12). Never use Date.toISOString for
// calendar dates — it shifts to UTC and breaks late-evening/early-morning logging.

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, m! - 1, d!) // local midnight
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function addDays(iso: string, n: number): string {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

/** 0=Sun … 6=Sat */
export function dayOfWeek(iso: string): number {
  return parseISODate(iso).getDay()
}

/** The Saturday starting the Sat→Fri cook cycle that contains `iso`. */
export function cycleSaturdayFor(iso: string): string {
  const back = (dayOfWeek(iso) - 6 + 7) % 7
  return addDays(iso, -back)
}

/** Monday of the Mon–Sun calendar week containing `iso` (weeks start Monday, spec §1). */
export function mondayOf(iso: string): string {
  const back = (dayOfWeek(iso) - 1 + 7) % 7
  return addDays(iso, -back)
}

// 2000-01-01 was a Saturday.
const EPOCH_SATURDAY = new Date(2000, 0, 1).getTime()

/** Whole weeks since a fixed epoch Saturday — deterministic rotation seed. */
export function weekIndex(satISO: string): number {
  const ms = parseISODate(satISO).getTime() - EPOCH_SATURDAY
  return Math.round(ms / (7 * 24 * 3600 * 1000))
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

export function dayName(iso: string): (typeof DAY_NAMES)[number] {
  return DAY_NAMES[dayOfWeek(iso)]!
}

/** "Sat 11 Jul" */
export function fmtShort(iso: string): string {
  const d = parseISODate(iso)
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`
}

/** "11 Jul" */
export function fmtDayMonth(iso: string): string {
  const d = parseISODate(iso)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`
}

/** All 7 dates of the cycle starting at satISO (Sat→Fri). */
export function cycleDates(satISO: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(satISO, i))
}
