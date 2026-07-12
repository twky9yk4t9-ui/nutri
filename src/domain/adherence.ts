import type { PlanSlot, SessionId, WeekPlan } from './types'
import { addDays, cycleDates, mondayOf } from './dates'
import { SESSION_SHAPES } from './rotation'

// §7: adherence = % of slots marked `eaten` over the period. Slots on days
// after `today` are excluded from the denominator — a mid-cycle percentage
// shouldn't be dragged down by meals that haven't happened yet.

export interface Adherence {
  eaten: number
  total: number
  pct: number | null // null when no slots counted
}

export function slotsByDate(weeks: WeekPlan[]): Map<string, PlanSlot[]> {
  const map = new Map<string, PlanSlot[]>()
  for (const plan of weeks) {
    for (const slot of plan.slots) {
      const list = map.get(slot.date) ?? []
      list.push(slot)
      map.set(slot.date, list)
    }
  }
  return map
}

export function adherenceForDates(weeks: WeekPlan[], dates: string[], todayISO: string): Adherence {
  const byDate = slotsByDate(weeks)
  let eaten = 0
  let total = 0
  for (const date of dates) {
    if (date > todayISO) continue
    for (const slot of byDate.get(date) ?? []) {
      total += 1
      if (slot.status === 'eaten') eaten += 1
    }
  }
  return { eaten, total, pct: total === 0 ? null : Math.round((eaten / total) * 100) }
}

/** Adherence over one Sat→Fri cycle (Week screen, 35 slots). */
export function cycleAdherence(plan: WeekPlan, todayISO: string): Adherence {
  return adherenceForDates([plan], cycleDates(plan.weekStartISO), todayISO)
}

/** Adherence over one Mon–Sun calendar week (Trends; weeks start Monday, §1). */
export function calendarWeekAdherence(weeks: WeekPlan[], mondayISO: string, todayISO: string): Adherence {
  const dates = Array.from({ length: 7 }, (_, i) => addDays(mondayISO, i))
  return adherenceForDates(weeks, dates, todayISO)
}

export function sessionsDone(plan: WeekPlan): { done: number; total: number } {
  return { done: plan.sessions.filter((s) => s.done).length, total: plan.sessions.length }
}

/** Cook-session completion inside a Mon–Sun window (sessions dated by cook day). */
export function sessionsInCalendarWeek(weeks: WeekPlan[], mondayISO: string): { done: number; total: number } {
  const end = addDays(mondayISO, 6)
  let done = 0
  let total = 0
  for (const plan of weeks) {
    for (const session of plan.sessions) {
      const shape = SESSION_SHAPES.find((s) => s.id === session.id as SessionId)!
      const cookDate = addDays(plan.weekStartISO, shape.cookOffset)
      if (cookDate >= mondayISO && cookDate <= end) {
        total += 1
        if (session.done) done += 1
      }
    }
  }
  return { done, total }
}

export interface WeekBar {
  mondayISO: string
  adherence: Adherence
  sessions: { done: number; total: number }
}

/** Last `n` Mon–Sun weeks ending with the week containing `todayISO` (Trends bars). */
export function lastNWeeks(weeks: WeekPlan[], n: number, todayISO: string): WeekBar[] {
  const currentMonday = mondayOf(todayISO)
  const out: WeekBar[] = []
  for (let i = n - 1; i >= 0; i--) {
    const monday = addDays(currentMonday, -7 * i)
    out.push({
      mondayISO: monday,
      adherence: calendarWeekAdherence(weeks, monday, todayISO),
      sessions: sessionsInCalendarWeek(weeks, monday),
    })
  }
  return out
}
