import type { Ingredient, Macros, Recipe } from './types'

export const ZERO_MACROS: Macros = { kcal: 0, p: 0, c: 0, f: 0 }

export function addMacros(a: Macros, b: Macros): Macros {
  return { kcal: a.kcal + b.kcal, p: a.p + b.p, c: a.c + b.c, f: a.f + b.f }
}

export function scaleMacros(m: Macros, k: number): Macros {
  return { kcal: m.kcal * k, p: m.p * k, c: m.c * k, f: m.f * k }
}

export function roundMacros(m: Macros): Macros {
  return { kcal: Math.round(m.kcal), p: Math.round(m.p), c: Math.round(m.c), f: Math.round(m.f) }
}

export function ingredientMap(ingredients: Ingredient[]): Map<string, Ingredient> {
  return new Map(ingredients.map((i) => [i.id, i]))
}

/**
 * Compute one serving's macros from the ingredient table. Used by the seed
 * guard tests (§12) — the UI displays each recipe's `verified` numbers.
 */
export function computedPerServing(recipe: Recipe, ingredients: Map<string, Ingredient>): Macros {
  let total = ZERO_MACROS
  for (const ri of recipe.ingredients) {
    const ing = ingredients.get(ri.ingredientId)
    if (!ing) throw new Error(`Unknown ingredient "${ri.ingredientId}" in recipe "${recipe.id}"`)
    total = addMacros(total, scaleMacros(ing.per100g, ri.grams / 100))
  }
  return total
}

/** Planned macros for a set of slots (sum of each slot recipe's verified numbers). */
export function plannedMacros(recipeIds: string[], recipes: Map<string, Recipe>): Macros {
  let total = ZERO_MACROS
  for (const id of recipeIds) {
    const r = recipes.get(id)
    if (r) total = addMacros(total, r.verified)
  }
  return total
}

export function recipeMap(recipes: Recipe[]): Map<string, Recipe> {
  return new Map(recipes.map((r) => [r.id, r]))
}
