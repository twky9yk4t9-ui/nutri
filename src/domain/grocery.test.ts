import { describe, expect, it } from 'vitest'
import { SEED_INGREDIENTS, SEED_RECIPES, SNACK_A, SNACK_C, SNACK_D, SNACK_E } from './seed'
import { ingredientMap } from './macros'
import { generateCycle, swapSession } from './rotation'
import { buildGroceryList, reconcileChecked, roundToPack, type GroceryItem } from './grocery'

// §12 (b): grocery aggregation — Σ(ingredients × portions across S1–S4)
// + 7× breakfast + 14× snacks, per-ingredient, three sections, pack rounding.

const INGS = ingredientMap(SEED_INGREDIENTS)
const SAT = '2026-07-11'

// Fixed fixture: S4=R1 ×4, S1=R2 ×4, S2=R4 ×2, S3=R5 ×4, snacks {A′, D′, C}.
// Deterministic snack assignment gives A′×4, D′×3, C×7 across the 14 slots
// (valid day-pairs under the Skyr cap always pair a Skyr snack with C).
const plan = generateCycle(SAT, SEED_RECIPES, INGS, undefined, {
  sessionOverrides: { S4: 'r1', S1: 'r2', S2: 'r4', S3: 'r5' },
  snackPick: [SNACK_A, SNACK_D, SNACK_C],
})
const list = buildGroceryList(plan, SEED_RECIPES, SEED_INGREDIENTS)

const find = (section: GroceryItem[], key: string) => section.find((i) => i.key === key)

describe('buildGroceryList aggregation', () => {
  it('aggregates fresh proteins from S4+S1 (chicken 160g × 8 portions)', () => {
    const chicken = find(list.fresh, 'ing:chicken_breast')!
    expect(chicken.grams).toBe(160 * 4 + 160 * 4)
    expect(chicken.qty).toBe('1280 g')
  })

  it('routes S2+S3 proteins to freeze-on-arrival with their own quantities', () => {
    expect(find(list.freeze, 'ing:chicken_breast:freeze')!.grams).toBe(155 * 2)
    expect(find(list.freeze, 'ing:beef_mince_5:freeze')!.grams).toBe(160 * 4)
    expect(list.freeze).toHaveLength(2)
  })

  it('aggregates dairy across breakfast ×7 and snack occurrences (skyr, packs)', () => {
    // breakfast 200×7 + A′ 200×4 + D′ 200×3 = 2800 g → 7 × 450 g tubs
    const skyr = find(list.fresh, 'ing:skyr')!
    expect(skyr.grams).toBe(2800)
    expect(skyr.qty).toBe('7 × 450 g')
    expect(skyr.sub).toBe('need ~2800 g')
  })

  it('aggregates fruit and veg with quantities (banana, kidney beans in cans)', () => {
    // banana: breakfast 120×7 + C 120×7 = 1680 g
    expect(find(list.fresh, 'ing:banana')!.grams).toBe(1680)
    // apple: A′ 100×4 + D′ 100×3 = 700 g
    expect(find(list.fresh, 'ing:apple')!.grams).toBe(700)
    // kidney beans (R5 ×4): 320 g → 2 × 240 g cans
    expect(find(list.fresh, 'ing:kidney_beans_drained')!.qty).toBe('2 × 240 g')
    // chopped tomatoes (R5 ×4): 600 g → 2 × 400 g cans
    expect(find(list.fresh, 'ing:chopped_tomatoes')!.qty).toBe('2 × 400 g')
    // onion: R2 40×4 + R5 50×4 = 360 g
    expect(find(list.fresh, 'ing:onion')!.grams).toBe(360)
  })

  it('puts carb/fat/pantry staples in the pantry checklist without quantities (§6.3)', () => {
    for (const key of ['ing:rice_dry', 'ing:noodles_dry', 'ing:olive_oil', 'ing:honey', 'ing:weetabix', 'ing:oats', 'ing:nuts_mixed']) {
      const item = find(list.pantry, key)
      expect(item, key).toBeDefined()
      expect(item!.qty).toBeUndefined()
    }
    // R3's pesto is not in this plan → not on the list
    expect(find(list.pantry, 'ing:pesto')).toBeUndefined()
  })

  it('adds fresh and pantry extras (aromatics) for the recipes in the plan', () => {
    expect(find(list.fresh, 'extra:lemons')).toBeDefined() // R1
    expect(find(list.fresh, 'extra:garlic')).toBeDefined() // R1/R4/R5
    expect(find(list.pantry, 'extra:saffron')).toBeDefined() // R2
    expect(find(list.pantry, 'extra:granulated-sweetener')).toBeDefined() // breakfast
  })

  it('protein bars (E) add a stock-check line but no quantities', () => {
    const planE = generateCycle(SAT, SEED_RECIPES, INGS, undefined, {
      sessionOverrides: { S4: 'r1', S1: 'r2', S2: 'r4', S3: 'r5' },
      snackPick: [SNACK_A, SNACK_E],
    })
    const listE = buildGroceryList(planE, SEED_RECIPES, SEED_INGREDIENTS)
    expect(find(listE.pantry, 'extra:protein-bars-check-stock')).toBeDefined()
    // E contributes no ingredient grams anywhere
    const allKeys = [...listE.fresh, ...listE.freeze].map((i) => i.key)
    expect(allKeys.every((k) => !k.includes('snack'))).toBe(true)
  })
})

describe('roundToPack', () => {
  it('rounds up to whole packs when a pack size exists', () => {
    expect(roundToPack(750, 400)).toMatchObject({ qty: '2 × 400 g', sub: 'need ~750 g', packs: 2 })
    expect(roundToPack(400, 400).packs).toBe(1)
    expect(roundToPack(401, 400).packs).toBe(2)
  })

  it('rounds up to 10 g otherwise', () => {
    expect(roundToPack(1234).qty).toBe('1240 g')
    expect(roundToPack(1230).qty).toBe('1230 g')
  })
})

describe('swap keeps checked items checked (§6.2 rule 6)', () => {
  it('reconciles: surviving keys stay, vanished keys drop', () => {
    // Swap S2 R4→R8: freeze chicken (only from R4) disappears, freeze cod appears.
    const swapped = swapSession(plan, SEED_RECIPES, INGS, 'S2', 'r8')
    const newList = buildGroceryList(swapped, SEED_RECIPES, SEED_INGREDIENTS)
    expect(find(newList.freeze, 'ing:cod:freeze')!.grams).toBe(190 * 2)
    expect(find(newList.freeze, 'ing:chicken_breast:freeze')).toBeUndefined()

    const checked = ['ing:skyr', 'ing:chicken_breast:freeze', 'ing:banana', 'extra:not-a-real-key']
    expect(reconcileChecked(checked, newList)).toEqual(['ing:skyr', 'ing:banana'])
  })
})
