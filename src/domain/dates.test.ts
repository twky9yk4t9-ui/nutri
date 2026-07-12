import { describe, expect, it } from 'vitest'
import {
  addDays,
  cycleDates,
  cycleSaturdayFor,
  dayName,
  mondayOf,
  parseISODate,
  toISODate,
  weekIndex,
} from './dates'

describe('local date handling (no UTC drift)', () => {
  it('formats and parses local dates round-trip', () => {
    expect(toISODate(new Date(2026, 6, 11))).toBe('2026-07-11')
    expect(toISODate(parseISODate('2026-07-11'))).toBe('2026-07-11')
    expect(parseISODate('2026-07-11').getHours()).toBe(0) // local midnight, not UTC
  })

  it('addDays crosses month and year boundaries', () => {
    expect(addDays('2026-07-31', 1)).toBe('2026-08-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
  })

  it('addDays is stable across the EU spring DST change (2026-03-29)', () => {
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29')
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30')
    expect(addDays('2026-03-30', -2)).toBe('2026-03-28')
  })
})

describe('cycle and calendar-week anchors', () => {
  it('cycleSaturdayFor returns the Saturday starting the Sat→Fri cycle', () => {
    expect(cycleSaturdayFor('2026-07-11')).toBe('2026-07-11') // Sat → itself
    expect(cycleSaturdayFor('2026-07-12')).toBe('2026-07-11') // Sun
    expect(cycleSaturdayFor('2026-07-17')).toBe('2026-07-11') // Fri, end of cycle
    expect(cycleSaturdayFor('2026-07-18')).toBe('2026-07-18') // next Sat starts a new one
  })

  it('mondayOf returns the Monday of the calendar week (weeks start Monday, §1)', () => {
    expect(mondayOf('2026-07-13')).toBe('2026-07-13') // Mon → itself
    expect(mondayOf('2026-07-12')).toBe('2026-07-06') // Sun belongs to the previous Monday
    expect(mondayOf('2026-07-11')).toBe('2026-07-06') // Sat too
  })

  it('cycleDates yields 7 consecutive dates from the Saturday', () => {
    const dates = cycleDates('2026-07-11')
    expect(dates).toHaveLength(7)
    expect(dates[0]).toBe('2026-07-11')
    expect(dates[6]).toBe('2026-07-17')
    expect(dayName(dates[0]!)).toBe('Sat')
    expect(dayName(dates[6]!)).toBe('Fri')
  })

  it('weekIndex is anchored and increments weekly (deterministic rotation seed)', () => {
    expect(weekIndex('2000-01-01')).toBe(0)
    expect(weekIndex('2026-07-11') - weekIndex('2026-07-04')).toBe(1)
    expect(weekIndex('2026-07-18') - weekIndex('2026-07-11')).toBe(1)
  })
})
