import type { Macros, Recipe, RecipeStep } from './types'
import { roundMacros, scaleMacros } from './macros'

export type Servings = 1 | 2 | 3 | 4

/**
 * Resolve a step's text for a serving count. Override keys are a single
 * count ("2") or an inclusive range ("3-4"); exact single-key matches win
 * over ranges. Falls back to the base text.
 */
export function resolveStepText(step: RecipeStep, servings: number): { text: string; overridden: boolean } {
  const overrides = step.overridesByServings
  if (overrides) {
    const exact = overrides[String(servings)]
    if (exact !== undefined) return { text: exact, overridden: true }
    for (const [key, text] of Object.entries(overrides)) {
      const m = key.match(/^(\d+)\s*-\s*(\d+)$/)
      if (m && servings >= Number(m[1]) && servings <= Number(m[2])) {
        return { text, overridden: true }
      }
    }
  }
  return { text: step.text, overridden: false }
}

export interface ScaledRecipe {
  servings: number
  ingredients: { ingredientId: string; grams: number; state: string }[]
  perServing: Macros
  batch: Macros
  steps: { text: string; overridden: boolean }[]
}

/** Scale a canonical 1-serving recipe to 1–4 servings (§9 Recipes screen). */
export function scaleRecipe(recipe: Recipe, servings: number): ScaledRecipe {
  return {
    servings,
    ingredients: recipe.ingredients.map((ri) => ({
      ingredientId: ri.ingredientId,
      grams: ri.grams * servings,
      state: ri.state,
    })),
    perServing: recipe.verified,
    batch: roundMacros(scaleMacros(recipe.verified, servings)),
    steps: recipe.steps.map((s) => resolveStepText(s, servings)),
  }
}

// ---------------------------------------------------------------------------
// §5.1 water & scaling tables (non-linear).
// ---------------------------------------------------------------------------

const PASTA_BOIL_L = [1.5, 2.0, 2.5, 3.0] as const
const RICE_RATIO = [1.6, 1.6, 1.5, 1.5] as const
const CHILLI_ADD_ML = [50, 75, 100, 120] as const

export type WaterKind = 'pasta-boil' | 'rice-absorb' | 'chilli-add'

/** Which §5.1 columns apply to which seeded recipe. R6 carries its own water amounts in step overrides. */
export const RECIPE_WATER: Record<string, WaterKind[]> = {
  r1: ['rice-absorb'],
  r2: ['rice-absorb'],
  r3: ['pasta-boil'],
  r5: ['rice-absorb', 'chilli-add'],
}

export interface WaterInfo {
  kind: WaterKind
  label: string
  detail: string
}

export function waterFor(recipe: Recipe, servings: number): WaterInfo[] {
  const kinds = RECIPE_WATER[recipe.id] ?? []
  const idx = Math.min(Math.max(servings, 1), 4) - 1
  return kinds.map((kind) => {
    if (kind === 'pasta-boil') {
      return { kind, label: 'Boil water', detail: `${PASTA_BOIL_L[idx]!.toFixed(1)} L, salted` }
    }
    if (kind === 'rice-absorb') {
      const ratio = RICE_RATIO[idx]!
      const riceG = recipe.ingredients.find((i) => i.ingredientId === 'rice_dry')?.grams ?? 0
      const ml = Math.round(riceG * servings * ratio)
      return { kind, label: 'Rice water', detail: `1 : ${ratio} by weight${ml ? ` (≈ ${ml} ml)` : ''}` }
    }
    return { kind, label: 'Chilli simmer add', detail: `${CHILLI_ADD_ML[idx]} ml` }
  })
}

/** §5.1 global note, shown when scaling beyond 1 serving. */
export const SEASONING_NOTE = 'Seasoning scales at ~0.8× per added serving — taste-adjust.'
