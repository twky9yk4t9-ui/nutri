import { describe, expect, it } from 'vitest'
import { buildSeedState, STATE_VERSION } from '../domain/seed'
import { reducer } from './store'
import { parseImport } from './persist'

// v4 supplements checklist: per-date toggles, fresh (all-unchecked) every new
// day by construction, and carried through export/import + the v3→v4 migration.

describe('toggleSupplement', () => {
  it('checks and unchecks a single supplement for a single date', () => {
    const s0 = buildSeedState()
    const s1 = reducer(s0, { type: 'toggleSupplement', date: '2026-07-15', key: 'creatine' })
    expect(s1.supplementsLog['2026-07-15']).toEqual({ creatine: true, omega3: false, vitaminD3: false })

    const s2 = reducer(s1, { type: 'toggleSupplement', date: '2026-07-15', key: 'creatine' })
    expect(s2.supplementsLog['2026-07-15']!.creatine).toBe(false)
  })

  it('resets fresh each day: a new date starts all-unchecked regardless of history', () => {
    const s0 = buildSeedState()
    const s1 = reducer(s0, { type: 'toggleSupplement', date: '2026-07-15', key: 'omega3' })
    // the next day has no entry — the UI reads that as all unchecked
    expect(s1.supplementsLog['2026-07-16']).toBeUndefined()
    const s2 = reducer(s1, { type: 'toggleSupplement', date: '2026-07-16', key: 'vitaminD3' })
    expect(s2.supplementsLog['2026-07-16']).toEqual({ creatine: false, omega3: false, vitaminD3: true })
    // and yesterday's log is untouched
    expect(s2.supplementsLog['2026-07-15']).toEqual({ creatine: false, omega3: true, vitaminD3: false })
  })
})

describe('v3 → v4 migration (import path)', () => {
  it('adds supplementsLog and refreshes the revised recipes', () => {
    const legacy = { ...buildSeedState(), version: 3 } as Record<string, unknown>
    delete legacy.supplementsLog
    const migrated = parseImport(JSON.stringify(legacy))
    expect(migrated.version).toBe(STATE_VERSION)
    expect(migrated.supplementsLog).toEqual({})
    expect(migrated.recipes.find((r) => r.id === 'r6')!.name).toContain('Turkey')
  })

  it('round-trips supplementsLog through export/import', () => {
    const s0 = buildSeedState()
    const s1 = reducer(s0, { type: 'toggleSupplement', date: '2026-07-15', key: 'creatine' })
    const back = parseImport(JSON.stringify(s1))
    expect(back.supplementsLog).toEqual(s1.supplementsLog)
  })
})
