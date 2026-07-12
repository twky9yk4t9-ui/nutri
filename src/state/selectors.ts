import type { AppState, CookSession, PlanSlot, SlotKey, WeekPlan } from '../domain/types'
import { addDays, cycleSaturdayFor } from '../domain/dates'
import { SESSION_SHAPES } from '../domain/rotation'

export const SLOT_ORDER: SlotKey[] = ['B', 'S1', 'L', 'S2', 'D']

export const SLOT_LABELS: Record<SlotKey, string> = {
  B: 'Breakfast',
  S1: 'Snack 1',
  L: 'Lunch',
  S2: 'Snack 2',
  D: 'Dinner',
}

/** The plan whose Sat→Fri cycle contains `date`, if generated. */
export function planFor(state: AppState, date: string): WeekPlan | undefined {
  const sat = cycleSaturdayFor(date)
  return state.weeks.find((w) => w.weekStartISO === sat)
}

export function planByStart(state: AppState, weekStartISO: string): WeekPlan | undefined {
  return state.weeks.find((w) => w.weekStartISO === weekStartISO)
}

/** The 5 slots of a date in display order (B, S1, L, S2, D). */
export function slotsOn(plan: WeekPlan | undefined, date: string): PlanSlot[] {
  if (!plan) return []
  return plan.slots
    .filter((s) => s.date === date)
    .sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot))
}

export function sessionCookingOn(plan: WeekPlan | undefined, date: string): CookSession | undefined {
  if (!plan) return undefined
  return plan.sessions.find((s) => {
    const shape = SESSION_SHAPES.find((sh) => sh.id === s.id)!
    return addDays(plan.weekStartISO, shape.cookOffset) === date
  })
}

/** Defrost (and other) tasks due on a date. */
export function tasksOn(plan: WeekPlan | undefined, date: string): string[] {
  if (!plan) return []
  return plan.slots.filter((s) => s.date === date).flatMap((s) => s.tasks ?? [])
}

/**
 * The plan whose grocery list is "current": the cycle covering today, or the
 * next upcoming plan (e.g. generated Friday evening for tomorrow's shop).
 */
export function groceryPlan(state: AppState, todayIso: string): WeekPlan | undefined {
  return (
    planFor(state, todayIso) ??
    state.weeks
      .filter((w) => w.weekStartISO > todayIso)
      .sort((a, b) => a.weekStartISO.localeCompare(b.weekStartISO))[0]
  )
}

/**
 * Which cycle should "Generate" target: the current cycle's Saturday if it has
 * no plan yet, otherwise the next Saturday (§6.2 — generation is manual in v1).
 */
export function generateTarget(state: AppState, todayIso: string): { satISO: string; replaces: boolean } {
  const currentSat = cycleSaturdayFor(todayIso)
  if (!planByStart(state, currentSat)) return { satISO: currentSat, replaces: false }
  const nextSat = addDays(currentSat, 7)
  return { satISO: nextSat, replaces: Boolean(planByStart(state, nextSat)) }
}
