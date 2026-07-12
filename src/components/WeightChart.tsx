import type { WeightEntry } from '../domain/types'
import { addDays, fmtDayMonth, mondayOf, parseISODate, todayISO } from '../domain/dates'
import { rolling7, weeklyAverages } from '../domain/weights'

// §7/§9.5: weight chart — raw points + 7-day rolling average + weekly (Mon–Sun)
// averages. Display only: no interpretation, no suggestions (§1 hard rule).

const W = 520
const H = 220
const L = 38
const R = 10
const T = 12
const B = 26
const DAY_MS = 24 * 3600 * 1000

export function WeightChart({ weights }: { weights: WeightEntry[] }) {
  if (weights.length === 0) {
    return <p className="dim small">No entries yet — add your first morning weight on Today.</p>
  }

  // Show the last 12 weeks; fall back to everything while data is sparse.
  const from = addDays(todayISO(), -83)
  let entries = weights.filter((w) => w.dateISO >= from)
  if (entries.length < 2) entries = weights

  const rollingAll = rolling7(weights)
  const rolling = rollingAll.filter((r) => entries.some((e) => e.dateISO === r.dateISO))
  const firstDate = entries[0]!.dateISO
  const weekly = weeklyAverages(weights).filter((w) => addDays(w.mondayISO, 6) >= firstDate)

  const minX = parseISODate(firstDate).getTime()
  const maxX = Math.max(parseISODate(entries[entries.length - 1]!.dateISO).getTime(), minX + DAY_MS)
  const kgs = [...entries.map((e) => e.kg), ...rolling.map((r) => r.kg), ...weekly.map((w) => w.kg)]
  let minY = Math.min(...kgs)
  let maxY = Math.max(...kgs)
  const padY = Math.max(0.4, (maxY - minY) * 0.15)
  minY -= padY
  maxY += padY

  const x = (iso: string) => L + ((parseISODate(iso).getTime() - minX) / (maxX - minX)) * (W - L - R)
  const y = (kg: number) => T + ((maxY - kg) / (maxY - minY)) * (H - T - B)

  // y ticks on tidy steps
  const range = maxY - minY
  const step = range <= 2.5 ? 0.5 : range <= 6 ? 1 : 2
  const yTicks: number[] = []
  for (let v = Math.ceil(minY / step) * step; v <= maxY; v += step) yTicks.push(Math.round(v * 10) / 10)

  // x ticks on Mondays (thin out if many)
  const mondays: string[] = []
  for (let m = mondayOf(firstDate); parseISODate(m).getTime() <= maxX; m = addDays(m, 7)) mondays.push(m)
  const every = mondays.length > 7 ? 2 : 1
  const xTicks = mondays.filter((_, i) => i % every === 0)

  const clampX = (v: number) => Math.max(L, Math.min(W - R, v))

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="Weight chart">
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth={1} />
            <text x={L - 5} y={y(v) + 3.5} textAnchor="end" fontSize={10} fill="var(--faint)">
              {v.toFixed(1)}
            </text>
          </g>
        ))}
        {xTicks.map((m) => {
          const px = clampX(x(m))
          return (
            <text key={m} x={px} y={H - 8} textAnchor="middle" fontSize={10} fill="var(--faint)">
              {fmtDayMonth(m)}
            </text>
          )
        })}
        {/* weekly Mon–Sun averages as horizontal segments */}
        {weekly.map((w) => (
          <line
            key={w.mondayISO}
            x1={clampX(x(w.mondayISO))}
            x2={clampX(x(addDays(w.mondayISO, 6)))}
            y1={y(w.kg)}
            y2={y(w.kg)}
            stroke="var(--cyan)"
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.85}
          />
        ))}
        {/* 7-day rolling average */}
        {rolling.length > 1 && (
          <polyline
            points={rolling.map((r) => `${x(r.dateISO)},${y(r.kg)}`).join(' ')}
            fill="none"
            stroke="var(--purple)"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        )}
        {/* raw points */}
        {entries.map((e) => (
          <circle key={e.dateISO} cx={x(e.dateISO)} cy={y(e.kg)} r={3} fill="var(--text)" opacity={0.85} />
        ))}
      </svg>
      <div className="row tiny dim" style={{ gap: 12, justifyContent: 'center', marginTop: 6 }}>
        <span>● daily</span>
        <span style={{ color: 'var(--purple)' }}>— 7-day rolling</span>
        <span style={{ color: 'var(--cyan)' }}>— weekly avg</span>
      </div>
    </>
  )
}
