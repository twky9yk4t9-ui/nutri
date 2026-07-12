import { describe, expect, it } from 'vitest'
import { SEED_RECIPES } from './seed'
import { resolveStepText, scaleRecipe, waterFor } from './scaling'

// §12 (a): recipe scaling — grams × servings, overrides resolve.

const byId = new Map(SEED_RECIPES.map((r) => [r.id, r]))
const r1 = byId.get('r1')!
const r5 = byId.get('r5')!
const r6 = byId.get('r6')!

describe('scaleRecipe', () => {
  it('multiplies every ingredient by the serving count (1–4)', () => {
    for (const servings of [1, 2, 3, 4]) {
      const scaled = scaleRecipe(r1, servings)
      const chicken = scaled.ingredients.find((i) => i.ingredientId === 'chicken_breast')!
      const rice = scaled.ingredients.find((i) => i.ingredientId === 'rice_dry')!
      expect(chicken.grams).toBe(160 * servings)
      expect(rice.grams).toBe(105 * servings)
    }
  })

  it('scales batch macros from the verified per-serving numbers', () => {
    const scaled = scaleRecipe(r1, 4)
    expect(scaled.batch).toEqual({ kcal: 787 * 4, p: 48 * 4, c: 87 * 4, f: 26 * 4 })
    expect(scaled.perServing).toEqual(r1.verified)
  })

  it('resolves range overrides ("3-4") at 3 and 4 but not below', () => {
    const searStep = r1.steps[1]!
    expect(resolveStepText(searStep, 1).overridden).toBe(false)
    expect(resolveStepText(searStep, 2).overridden).toBe(false)
    expect(resolveStepText(searStep, 3)).toMatchObject({ overridden: true })
    expect(resolveStepText(searStep, 3).text).toContain('two batches')
    expect(resolveStepText(searStep, 4).text).toContain('two batches')
  })

  it('resolves exact single-serving overrides (R6 water amounts)', () => {
    const waterStep = r6.steps[1]!
    expect(resolveStepText(waterStep, 1).text).toContain('250 ml')
    expect(resolveStepText(waterStep, 2).text).toContain('~450 ml')
    expect(resolveStepText(waterStep, 3).text).toContain('~600 ml')
    expect(resolveStepText(waterStep, 4).text).toContain('~750 ml')
  })

  it('exact key wins over a range key', () => {
    const step = { text: 'base', overridesByServings: { '2-4': 'range', '3': 'exact' } }
    expect(resolveStepText(step, 3).text).toBe('exact')
    expect(resolveStepText(step, 2).text).toBe('range')
    expect(resolveStepText(step, 1).text).toBe('base')
  })
})

describe('waterFor (§5.1, non-linear)', () => {
  it('pasta boil water steps 1.5→3.0 L', () => {
    const r3 = byId.get('r3')!
    expect(waterFor(r3, 1)[0]!.detail).toContain('1.5 L')
    expect(waterFor(r3, 4)[0]!.detail).toContain('3.0 L')
  })

  it('rice ratio drops from 1:1.6 to 1:1.5 at 3+ servings, with computed ml', () => {
    const at2 = waterFor(r1, 2).find((w) => w.kind === 'rice-absorb')!
    const at3 = waterFor(r1, 3).find((w) => w.kind === 'rice-absorb')!
    expect(at2.detail).toContain('1 : 1.6')
    expect(at2.detail).toContain(`${Math.round(105 * 2 * 1.6)} ml`)
    expect(at3.detail).toContain('1 : 1.5')
  })

  it('chilli simmer add is 50/75/100/120 ml', () => {
    const add = (s: number) => waterFor(r5, s).find((w) => w.kind === 'chilli-add')!.detail
    expect(add(1)).toBe('50 ml')
    expect(add(2)).toBe('75 ml')
    expect(add(3)).toBe('100 ml')
    expect(add(4)).toBe('120 ml')
  })
})
