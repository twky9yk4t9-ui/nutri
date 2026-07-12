import { describe, expect, it } from 'vitest'
import type { WeekPlan } from './types'
import { SEED_INGREDIENTS, SEED_RECIPES } from './seed'
import { ingredientMap } from './macros'
import { generateCycle } from './rotation'
import { calendarWeekAdherence, cycleAdherence, lastNWeeks, sessionsInCalendarWeek } from './adherence'
import { rolling7, upsertWeight, weeklyAverages } from './weights'

const INGS = ingredientMap(SEED_INGREDIENTS)
const SAT = '2026-07-11'

function withStatuses(plan: WeekPlan, date: string, statuses: ('planned' | 'eaten' | 'off-plan')[]): WeekPlan {
  const order = ['B', 'S1', 'L', 'S2', 'D'] as const
  return {
    ...plan,
    slots: plan.slots.map((s) =>
      s.date === date ? { ...s, status: statuses[order.indexOf(s.slot)]! } : s,
    ),
  }
}

describe('adherence (§7)', () => {
  const base = generateCycle(SAT, SEED_RECIPES, INGS)

  it('counts eaten slots over days up to today only', () => {
    const plan = withStatuses(base, SAT, ['eaten', 'eaten', 'eaten', 'off-plan', 'planned'])
    const a = cycleAdherence(plan, SAT) // mid-cycle: only Saturday counts
    expect(a).toEqual({ eaten: 3, total: 5, pct: 60 })
  })

  it('covers all 35 slots once the cycle is over', () => {
    const a = cycleAdherence(base, '2026-12-31')
    expect(a.total).toBe(35)
    expect(a.pct).toBe(0)
  })

  it('is null before any countable day', () => {
    const a = cycleAdherence(base, '2026-07-01')
    expect(a).toEqual({ eaten: 0, total: 0, pct: null })
  })

  it('calendar-week adherence uses Mon–Sun windows across cycles', () => {
    // Cycle Jul 11–17; calendar week Mon Jul 13 – Sun Jul 19 overlaps 5 days → 25 slots.
    const a = calendarWeekAdherence([base], '2026-07-13', '2026-12-31')
    expect(a.total).toBe(25)
  })

  it('finds cook sessions inside a calendar week (cook dates, not cover dates)', () => {
    // Cycle Jul 11: cooks Sat 11 (S4), Sun 12 (S1), Tue 14 (S2), Wed 15 (S3).
    const done = { ...base, sessions: base.sessions.map((s) => (s.id === 'S2' ? { ...s, done: true } : s)) }
    const week = sessionsInCalendarWeek([done], '2026-07-13')
    expect(week).toEqual({ done: 1, total: 2 }) // only S2 (Tue 14) and S3 (Wed 15) fall Mon–Sun 13–19
  })

  it('lastNWeeks returns consecutive Mondays ending at the current week', () => {
    const bars = lastNWeeks([base], 3, '2026-07-15')
    expect(bars.map((b) => b.mondayISO)).toEqual(['2026-06-29', '2026-07-06', '2026-07-13'])
  })
})

describe('weights (§7)', () => {
  it('upserts one entry per date, rounded to 1 decimal', () => {
    let w = upsertWeight([], { dateISO: '2026-07-11', kg: 71.44 })
    w = upsertWeight(w, { dateISO: '2026-07-12', kg: 71.2 })
    w = upsertWeight(w, { dateISO: '2026-07-11', kg: 71.8 }) // replaces
    expect(w).toEqual([
      { dateISO: '2026-07-11', kg: 71.8 },
      { dateISO: '2026-07-12', kg: 71.2 },
    ])
  })

  it('rolling 7-day mean uses whatever entries exist in the trailing window', () => {
    const w = [
      { dateISO: '2026-07-01', kg: 80 },
      { dateISO: '2026-07-05', kg: 82 },
      { dateISO: '2026-07-10', kg: 84 },
    ]
    const r = rolling7(w)
    expect(r[0]).toEqual({ dateISO: '2026-07-01', kg: 80 })
    expect(r[1]).toEqual({ dateISO: '2026-07-05', kg: 81 }) // (80+82)/2, Jul 1 within window
    expect(r[2]).toEqual({ dateISO: '2026-07-10', kg: 83 }) // (82+84)/2, Jul 1 outside
  })

  it('weekly averages bucket by Monday-start weeks (§1)', () => {
    const w = [
      { dateISO: '2026-07-12', kg: 72 }, // Sun → week of Mon Jul 6
      { dateISO: '2026-07-13', kg: 70 }, // Mon → week of Jul 13
      { dateISO: '2026-07-14', kg: 71 },
    ]
    expect(weeklyAverages(w)).toEqual([
      { mondayISO: '2026-07-06', kg: 72, count: 1 },
      { mondayISO: '2026-07-13', kg: 70.5, count: 2 },
    ])
  })
})
