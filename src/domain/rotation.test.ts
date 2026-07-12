import { describe, expect, it } from 'vitest'
import {
  LOW_FAT_SNACK_IDS,
  SEED_INGREDIENTS,
  SEED_RECIPES,
  SKYR_SNACK_IDS,
  SNACK_A,
  SNACK_B,
  SNACK_C,
  SNACK_D,
  SNACK_E,
  SNACK_F,
  SNACK_G,
  SNACK_H,
} from './seed'
import { ingredientMap } from './macros'
import {
  assignSnacks,
  generateCycle,
  proposeSessions,
  swapSession,
  validateSnackPick,
} from './rotation'
import { addDays, cycleDates } from './dates'

// §12 (c): rotation constraints — quick-on-Tuesday, no intra-week repeat, salmon rule.

const MAINS = SEED_RECIPES.filter((r) => r.slotType === 'main')
const INGS = ingredientMap(SEED_INGREDIENTS)
const byId = new Map(SEED_RECIPES.map((r) => [r.id, r]))
const P = (id: string) => byId.get(id)!.verified.p
const SAT = '2026-07-11' // a Saturday
const SATURDAYS = ['2026-07-11', '2026-07-18', '2026-07-25', '2026-08-01', '2026-08-08']

describe('proposeSessions (§6.2)', () => {
  it('S2 (Tuesday) is always a quick recipe, across many weeks', () => {
    let prev: ReturnType<typeof generateCycle> | undefined
    for (const sat of SATURDAYS) {
      const picks = proposeSessions(sat, MAINS, prev)
      expect(byId.get(picks.S2)!.tags).toContain('quick')
      prev = generateCycle(sat, SEED_RECIPES, INGS, prev)
    }
  })

  it('never repeats a recipe within the same week', () => {
    for (const sat of SATURDAYS) {
      const picks = proposeSessions(sat, MAINS)
      expect(new Set(Object.values(picks)).size).toBe(4)
    }
  })

  it('prefers keeper recipes for S1 and S3 when available', () => {
    for (const sat of SATURDAYS) {
      const picks = proposeSessions(sat, MAINS)
      expect(byId.get(picks.S1)!.tags).toContain('keeper')
      expect(byId.get(picks.S3)!.tags).toContain('keeper')
    }
  })

  it('avoids last week’s recipes entirely when alternatives exist (soft rule)', () => {
    const week1 = generateCycle(SAT, SEED_RECIPES, INGS, undefined, {
      sessionOverrides: { S1: 'r1', S2: 'r4', S3: 'r2', S4: 'r5' },
    })
    const picks2 = proposeSessions(addDays(SAT, 7), MAINS, week1)
    const week1Ids = new Set(week1.sessions.map((s) => s.recipeId))
    for (const id of Object.values(picks2)) expect(week1Ids.has(id)).toBe(false)
  })

  it('allows a repeat from last week when forced (both quick recipes used)', () => {
    const week1 = generateCycle(SAT, SEED_RECIPES, INGS, undefined, {
      sessionOverrides: { S2: 'r4', S4: 'r8' },
    })
    const picks2 = proposeSessions(addDays(SAT, 7), MAINS, week1)
    expect(['r4', 'r8']).toContain(picks2.S2) // reused, but still quick
    expect(byId.get(picks2.S2)!.tags).toContain('quick')
  })

  it('salmon appears at most once per week', () => {
    let prev: ReturnType<typeof generateCycle> | undefined
    for (const sat of SATURDAYS) {
      const plan = generateCycle(sat, SEED_RECIPES, INGS, prev)
      const salmonSessions = plan.sessions.filter((s) => s.recipeId === 'r7')
      expect(salmonSessions.length).toBeLessThanOrEqual(1)
      prev = plan
    }
  })
})

describe('generateCycle plan shape (§6.1)', () => {
  const plan = generateCycle(SAT, SEED_RECIPES, INGS)

  it('has 35 slots over the 7 cycle dates Sat→Fri', () => {
    expect(plan.slots).toHaveLength(35)
    expect(new Set(plan.slots.map((s) => s.date))).toEqual(new Set(cycleDates(SAT)))
  })

  it('sessions cover the right days with the right portions', () => {
    const s4 = plan.sessions.find((s) => s.id === 'S4')!
    const s1 = plan.sessions.find((s) => s.id === 'S1')!
    const s2 = plan.sessions.find((s) => s.id === 'S2')!
    const s3 = plan.sessions.find((s) => s.id === 'S3')!
    expect(s4.portions).toBe(4)
    expect(s2.portions).toBe(2)
    expect(s4.covers.map((c) => c.date)).toEqual([SAT, SAT, addDays(SAT, 1), addDays(SAT, 1)])
    expect(s1.covers.map((c) => c.date)).toEqual([addDays(SAT, 2), addDays(SAT, 2), addDays(SAT, 3), addDays(SAT, 3)])
    expect(s2.covers.map((c) => c.date)).toEqual([addDays(SAT, 4), addDays(SAT, 4)])
    expect(s3.covers.map((c) => c.date)).toEqual([addDays(SAT, 5), addDays(SAT, 5), addDays(SAT, 6), addDays(SAT, 6)])
  })

  it('every lunch and dinner slot carries its covering session’s recipe', () => {
    const bySession = new Map(plan.sessions.flatMap((s) => s.covers.map((c) => [`${c.date}|${c.slot}`, s.recipeId])))
    for (const slot of plan.slots) {
      if (slot.slot === 'L' || slot.slot === 'D') {
        expect(slot.recipeId).toBe(bySession.get(`${slot.date}|${slot.slot}`))
      }
    }
  })

  it('injects defrost tasks on Monday and Tuesday evenings (§6.3)', () => {
    const monD = plan.slots.find((s) => s.date === addDays(SAT, 2) && s.slot === 'D')!
    const tueD = plan.slots.find((s) => s.date === addDays(SAT, 3) && s.slot === 'D')!
    expect(monD.tasks?.[0]).toMatch(/Defrost: move .* to the fridge for Tuesday/)
    expect(tueD.tasks?.[0]).toMatch(/Defrost: move .* to the fridge for Wednesday/)
    const otherTasks = plan.slots.filter((s) => s.tasks && s.tasks.length > 0)
    expect(otherTasks).toHaveLength(2)
  })

  it('names the actual session proteins in the defrost tasks', () => {
    const withKnown = generateCycle(SAT, SEED_RECIPES, INGS, undefined, {
      sessionOverrides: { S2: 'r4', S3: 'r5' },
    })
    const monD = withKnown.slots.find((s) => s.date === addDays(SAT, 2) && s.slot === 'D')!
    const tueD = withKnown.slots.find((s) => s.date === addDays(SAT, 3) && s.slot === 'D')!
    expect(monD.tasks?.[0]).toContain('chicken breast')
    expect(tueD.tasks?.[0]).toContain('beef mince')
  })
})

describe('snack rules (§4, §6.2)', () => {
  it('validateSnackPick enforces size, the max-one-Skyr cap and the 20 g protein floor', () => {
    expect(validateSnackPick([SNACK_A], false, P)).toMatch(/2–3/)
    expect(validateSnackPick([SNACK_A, SNACK_B, SNACK_C, SNACK_D], false, P)).toMatch(/2–3/)
    // two Skyr templates alone can never share a day under the cap
    expect(validateSnackPick([SNACK_A, SNACK_B], false, P)).toMatch(/max one Skyr/)
    // no Skyr requirement any more: C+E = 27 g combined protein is fine
    expect(validateSnackPick([SNACK_C, SNACK_E], false, P)).toBeNull()
    expect(validateSnackPick([SNACK_A, SNACK_C], false, P)).toBeNull()
    expect(validateSnackPick([SNACK_F, SNACK_G], false, P)).toBeNull()
  })

  it('salmon weeks need F or G — low-fat days cannot be two Skyr snacks', () => {
    expect(validateSnackPick([SNACK_D, SNACK_C], true, P)).toMatch(/Salmon week/) // low-fat subset {D′} → D′+D′ breaks the cap
    expect(validateSnackPick([SNACK_B, SNACK_A, SNACK_C], true, P)).toMatch(/Salmon week/) // low-fat subset {B′} alone
    expect(validateSnackPick([SNACK_D, SNACK_F], true, P)).toBeNull()
    expect(validateSnackPick([SNACK_G, SNACK_C], true, P)).toBeNull() // G+G on salmon days is allowed
  })

  it('never schedules two Skyr snacks on one day and always reaches 20 g combined snack protein', () => {
    const dates = cycleDates(SAT)
    const picks = [
      [SNACK_A, SNACK_C],
      [SNACK_C, SNACK_D, SNACK_E],
      [SNACK_A, SNACK_B, SNACK_F], // two Skyr templates in the pick — never two on one day
      [SNACK_F, SNACK_G],
      [SNACK_C, SNACK_E],
      [SNACK_D, SNACK_F, SNACK_H],
    ]
    for (const pick of picks) {
      const assigned = assignSnacks(pick, dates, new Set(), P)
      for (const date of dates) {
        const [s1, s2] = assigned.get(date)!
        expect(pick).toContain(s1)
        expect(pick).toContain(s2)
        expect([s1, s2].filter((id) => SKYR_SNACK_IDS.includes(id)).length).toBeLessThanOrEqual(1)
        expect(P(s1) + P(s2)).toBeGreaterThanOrEqual(20)
      }
    }
  })

  it('schedules exactly two snacks per day from the weekly pick', () => {
    const plan = generateCycle(SAT, SEED_RECIPES, INGS, undefined, { snackPick: [SNACK_A, SNACK_D, SNACK_C] })
    for (const date of cycleDates(SAT)) {
      const snacks = plan.slots.filter((s) => s.date === date && (s.slot === 'S1' || s.slot === 'S2'))
      expect(snacks).toHaveLength(2)
      for (const s of snacks) expect(plan.snackTemplateIds).toContain(s.recipeId)
    }
  })

  it('salmon days draw both snacks from the low-fat set {B′, D′, F, G} (§6.2 rule 4)', () => {
    const plan = generateCycle(SAT, SEED_RECIPES, INGS, undefined, { sessionOverrides: { S4: 'r7' } })
    const salmonDates = [SAT, addDays(SAT, 1)]
    for (const date of salmonDates) {
      const snacks = plan.slots.filter((s) => s.date === date && (s.slot === 'S1' || s.slot === 'S2'))
      expect(snacks).toHaveLength(2)
      for (const s of snacks) expect(LOW_FAT_SNACK_IDS).toContain(s.recipeId)
      expect(snacks.filter((s) => SKYR_SNACK_IDS.includes(s.recipeId)).length).toBeLessThanOrEqual(1)
    }
  })

  it('extends the pick with F when salmon is chosen but the pick lacks F/G', () => {
    const plan = generateCycle(SAT, SEED_RECIPES, INGS, undefined, {
      sessionOverrides: { S4: 'r7' },
      snackPick: [SNACK_A, SNACK_C],
    })
    expect(plan.snackTemplateIds).toContain(SNACK_F)
    for (const date of [SAT, addDays(SAT, 1)]) {
      const snacks = plan.slots.filter((s) => s.date === date && (s.slot === 'S1' || s.slot === 'S2'))
      for (const s of snacks) expect(s.recipeId).toBe(SNACK_F) // only picked low-fat option → F+F
    }
  })
})

describe('swapSession (§6.2 rule 6)', () => {
  const plan = generateCycle(SAT, SEED_RECIPES, INGS, undefined, {
    sessionOverrides: { S1: 'r1', S2: 'r4', S3: 'r2', S4: 'r5' },
    snackPick: [SNACK_A, SNACK_D, SNACK_C],
  })

  it('replaces the recipe on the session and all its covered slots', () => {
    const swapped = swapSession(plan, SEED_RECIPES, INGS, 'S3', 'r6')
    expect(swapped.sessions.find((s) => s.id === 'S3')!.recipeId).toBe('r6')
    const covered = swapped.slots.filter(
      (s) => (s.date === addDays(SAT, 5) || s.date === addDays(SAT, 6)) && (s.slot === 'L' || s.slot === 'D'),
    )
    expect(covered).toHaveLength(4)
    for (const s of covered) expect(s.recipeId).toBe('r6')
  })

  it('preserves slot statuses across a swap', () => {
    const eaten = {
      ...plan,
      slots: plan.slots.map((s) => (s.date === addDays(SAT, 5) && s.slot === 'L' ? { ...s, status: 'eaten' as const } : s)),
    }
    const swapped = swapSession(eaten, SEED_RECIPES, INGS, 'S3', 'r6')
    const slot = swapped.slots.find((s) => s.date === addDays(SAT, 5) && s.slot === 'L')!
    expect(slot.status).toBe('eaten')
    expect(slot.recipeId).toBe('r6')
  })

  it('rejects non-quick recipes for S2 and intra-week repeats', () => {
    expect(() => swapSession(plan, SEED_RECIPES, INGS, 'S2', 'r5')).toThrow(/quick/)
    expect(() => swapSession(plan, SEED_RECIPES, INGS, 'S4', 'r1')).toThrow(/repeats/)
  })

  it('swapping salmon in re-assigns that session’s days to the low-fat set', () => {
    const swapped = swapSession(plan, SEED_RECIPES, INGS, 'S4', 'r7')
    // pick [A′,D′,C] has no F/G → F is added so salmon days can satisfy the Skyr cap
    expect(swapped.snackTemplateIds).toContain(SNACK_F)
    for (const date of [SAT, addDays(SAT, 1)]) {
      const snacks = swapped.slots.filter((s) => s.date === date && (s.slot === 'S1' || s.slot === 'S2'))
      expect(snacks).toHaveLength(2)
      for (const s of snacks) expect(LOW_FAT_SNACK_IDS).toContain(s.recipeId)
      expect(snacks.filter((s) => SKYR_SNACK_IDS.includes(s.recipeId)).length).toBeLessThanOrEqual(1)
    }
    // other days keep a valid assignment under the new rules
    const wed = swapped.slots.filter((s) => s.date === addDays(SAT, 4) && (s.slot === 'S1' || s.slot === 'S2'))
    expect(wed.filter((s) => SKYR_SNACK_IDS.includes(s.recipeId)).length).toBeLessThanOrEqual(1)
    expect(wed.reduce((sum, s) => sum + P(s.recipeId), 0)).toBeGreaterThanOrEqual(20)
  })

  it('refreshes defrost tasks when S2/S3 recipes change', () => {
    const swapped = swapSession(plan, SEED_RECIPES, INGS, 'S3', 'r6') // r2 (chicken) → r6 (beef)
    const tueD = swapped.slots.find((s) => s.date === addDays(SAT, 3) && s.slot === 'D')!
    expect(tueD.tasks?.[0]).toContain('beef mince')
  })
})
