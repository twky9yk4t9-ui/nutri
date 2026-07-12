import { describe, expect, it } from 'vitest'
import { SEED_INGREDIENTS, SEED_RECIPES } from './seed'
import { computedPerServing, ingredientMap } from './macros'

// §12: verify every seeded meal's computed macros match §5's `verified`
// numbers within ±1 kcal (±1 g for macros) — guards against seed typos.
// Snack E has no tracked ingredients (a bought bar) and is skipped.

describe('seeded recipe macros reproduce the verified numbers (§3–§5 vs §10)', () => {
  const ings = ingredientMap(SEED_INGREDIENTS)
  const verifiable = SEED_RECIPES.filter((r) => r.ingredients.length > 0)

  it('covers breakfast, 7 snacks (E is a bought bar) and all 8 mains', () => {
    expect(verifiable).toHaveLength(16)
  })

  for (const recipe of verifiable) {
    it(`${recipe.id} · ${recipe.name}`, () => {
      const computed = computedPerServing(recipe, ings)
      expect(Math.abs(computed.kcal - recipe.verified.kcal)).toBeLessThanOrEqual(1)
      expect(Math.abs(computed.p - recipe.verified.p)).toBeLessThanOrEqual(1)
      expect(Math.abs(computed.c - recipe.verified.c)).toBeLessThanOrEqual(1)
      expect(Math.abs(computed.f - recipe.verified.f)).toBeLessThanOrEqual(1)
    })
  }

  it('every recipe ingredient id exists in the ingredient table', () => {
    for (const recipe of SEED_RECIPES) {
      for (const ri of recipe.ingredients) {
        expect(ings.has(ri.ingredientId), `${recipe.id} → ${ri.ingredientId}`).toBe(true)
      }
    }
  })
})
