import type { Ingredient, Recipe, WeekPlan } from './types'
import { BREAKFAST_ID, SNACK_E, SNACK_G } from './seed'

// ---------------------------------------------------------------------------
// §6.3 grocery — one weekly shop, generated with the plan.
// List = Σ(ingredients × portions across S1–S4) + 7× breakfast + 14× snacks,
// aggregated per ingredient, rounded to sensible pack sizes. Three sections:
//   Fresh            (use ≤2 days: S4+S1 proteins, all veg/fruit/dairy) — quantities
//   Freeze on arrival (S2+S3 proteins) — quantities
//   Pantry check     (rice, pasta, oil, spices, honey…) — checklist, no quantities
// ---------------------------------------------------------------------------

export interface GroceryItem {
  key: string // stable checkbox key: "ing:<id>", "ing:<id>:freeze", "extra:<slug>"
  label: string
  /** e.g. "760 g" or "2 × 450 g" — Fresh/Freeze sections only */
  qty?: string
  /** e.g. "need ~1610 g" when packs hide the raw total */
  sub?: string
  grams?: number
  packs?: number
}

export interface GroceryList {
  fresh: GroceryItem[]
  freeze: GroceryItem[]
  pantry: GroceryItem[]
}

// Aromatics & staples used by recipes but not part of the §10 macro table
// (they carry no macros, so they are deliberately not RecipeIngredients).
const FRESH_EXTRAS: Record<string, string[]> = {
  r1: ['Lemons', 'Garlic'],
  r4: ['Garlic'],
  r5: ['Garlic'],
  r6: ['Garlic'],
  r7: ['Lemons', 'Dill or parsley'],
  r8: ['Lemons', 'Garlic'],
  [SNACK_G]: ['Cherry tomatoes'], // to taste — not part of G's macro math (§4)
}

const PANTRY_EXTRAS: Record<string, string[]> = {
  [BREAKFAST_ID]: ['Granulated sweetener', 'Cinnamon (optional)'],
  r1: ['Oregano / thyme', 'Salt & pepper'],
  r2: ['Saffron', 'Salt & pepper'],
  r3: ['Salt & pepper'],
  r4: [],
  r5: ['Chilli powder', 'Cumin', 'Paprika'],
  r6: ['Oregano'],
  r7: ['Salt & pepper'],
  r8: ['Smoked paprika'],
  [SNACK_E]: ['Protein bars — check stock'],
}

/** Round a needed amount up to something you can actually buy. */
export function roundToPack(grams: number, packSizeG?: number): { qty: string; sub?: string; grams: number; packs?: number } {
  if (packSizeG && packSizeG > 0) {
    const packs = Math.max(1, Math.ceil(grams / packSizeG))
    return {
      qty: `${packs} × ${packSizeG} g`,
      sub: `need ~${Math.ceil(grams)} g`,
      grams,
      packs,
    }
  }
  const rounded = Math.ceil(grams / 10) * 10
  return { qty: `${rounded} g`, grams }
}

const slug = (s: string) =>
  'extra:' +
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

/** Sessions whose protein is used fresh (cooked ≤1 day after the Saturday shop). */
const FRESH_SESSIONS = new Set(['S4', 'S1'])

export function buildGroceryList(plan: WeekPlan, recipes: Recipe[], ingredients: Ingredient[]): GroceryList {
  const recipeById = new Map(recipes.map((r) => [r.id, r]))
  const ingById = new Map(ingredients.map((i) => [i.id, i]))

  // grams needed per ingredient, proteins split fresh vs freeze-on-arrival
  const freshG = new Map<string, number>()
  const freezeG = new Map<string, number>()
  const pantryIds = new Set<string>()
  const usedRecipeIds = new Set<string>()

  const add = (recipeId: string, servings: number, freezeProteins: boolean) => {
    const recipe = recipeById.get(recipeId)
    if (!recipe) return
    usedRecipeIds.add(recipeId)
    for (const ri of recipe.ingredients) {
      const ing = ingById.get(ri.ingredientId)
      if (!ing) continue
      const grams = ri.grams * servings
      if (ing.category === 'protein') {
        const target = freezeProteins ? freezeG : freshG
        target.set(ing.id, (target.get(ing.id) ?? 0) + grams)
      } else if (ing.category === 'veg' || ing.category === 'fruit' || ing.category === 'dairy') {
        freshG.set(ing.id, (freshG.get(ing.id) ?? 0) + grams)
      } else {
        // carb / fat / pantry → checklist, not quantities (§6.3)
        pantryIds.add(ing.id)
      }
    }
  }

  for (const session of plan.sessions) {
    add(session.recipeId, session.portions, !FRESH_SESSIONS.has(session.id))
  }
  // Breakfast ×7 and each snack occurrence come straight from the slots.
  for (const slot of plan.slots) {
    if (slot.slot === 'B' || slot.slot === 'S1' || slot.slot === 'S2') add(slot.recipeId, 1, false)
  }

  const toItems = (m: Map<string, number>, keySuffix = ''): GroceryItem[] =>
    [...m.entries()]
      .map(([id, grams]) => {
        const ing = ingById.get(id)!
        const r = roundToPack(grams, ing.packSizeG)
        return { key: `ing:${id}${keySuffix}`, label: ing.name, ...r }
      })
      .sort((a, b) => a.label.localeCompare(b.label))

  const fresh = toItems(freshG)
  const freeze = toItems(freezeG, ':freeze')

  const pantry: GroceryItem[] = [...pantryIds]
    .map((id) => ({ key: `ing:${id}`, label: ingById.get(id)!.name }))
    .sort((a, b) => a.label.localeCompare(b.label))

  const extraNames = (map: Record<string, string[]>) => {
    const names = new Set<string>()
    for (const rid of usedRecipeIds) for (const n of map[rid] ?? []) names.add(n)
    return [...names].sort()
  }
  for (const name of extraNames(FRESH_EXTRAS)) fresh.push({ key: slug(name), label: name })
  for (const name of extraNames(PANTRY_EXTRAS)) pantry.push({ key: slug(name), label: name })

  return { fresh, freeze, pantry }
}

/** Keep checked state for items that survived a swap/regeneration (§6.2 rule 6). */
export function reconcileChecked(oldChecked: string[] | undefined, list: GroceryList): string[] {
  const keys = new Set([...list.fresh, ...list.freeze, ...list.pantry].map((i) => i.key))
  return (oldChecked ?? []).filter((k) => keys.has(k))
}
