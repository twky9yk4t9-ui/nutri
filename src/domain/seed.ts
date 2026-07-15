import type { AppState, Ingredient, Recipe, Settings } from './types'

// ---------------------------------------------------------------------------
// §10 seeded ingredient nutrition table (per 100 g, EU-label style).
// Owner task: re-verify against local labels on arrival in Dublin, edit here.
// Canonical substitute (v1.1 one-tap feature, documented only in v1):
//   Skyr → 0%-fat Greek yoghurt: { kcal: 57, p: 10.0, c: 4.0, f: 0.3 }
//
// Category drives the grocery section (§6.3): veg/fruit/dairy → Fresh with
// quantities; protein → Fresh or Freeze-on-arrival depending on cook session;
// carb/fat/pantry → Pantry check (name only). Hence deliberate choices:
// potato and the canned tomatoes/beans are 'veg' (bought weekly, quantities
// matter); dry grains, oil, honey, soy, pesto, nuts etc. are check-only.
// ---------------------------------------------------------------------------

const ING = (
  id: string,
  name: string,
  kcal: number,
  p: number,
  c: number,
  f: number,
  category: Ingredient['category'],
  priceEurPerKg: number, // Dublin avg €/kg (liquids per litre), §6.3/§10
  opts: { packSizeG?: number; freezable?: boolean } = {},
): Ingredient => ({
  id,
  name,
  per100g: { kcal, p, c, f },
  category,
  packSizeG: opts.packSizeG,
  freezable: opts.freezable ?? false,
  priceEurPerKg,
})

export const SEED_INGREDIENTS: Ingredient[] = [
  ING('chicken_breast', 'Chicken breast', 106, 22.0, 0, 2.0, 'protein', 8.0, { freezable: true }),
  ING('beef_mince_5', 'Beef mince 5%', 124, 20.5, 0, 4.5, 'protein', 9.5, { freezable: true }),
  ING('turkey_mince_5', 'Turkey mince 5%', 148, 21.0, 0, 7.0, 'protein', 8.5, { freezable: true }),
  ING('salmon', 'Salmon fillet', 201, 20.4, 0, 13.1, 'protein', 17.0, { freezable: true }),
  ING('cod', 'Cod / white fish', 82, 18.0, 0, 0.7, 'protein', 9.0, { freezable: true }),
  ING('rice_dry', 'Basmati rice (dry)', 351, 8.0, 77.5, 0.6, 'carb', 2.2),
  ING('pasta_dry', 'Pasta (dry)', 353, 12.5, 71.0, 1.5, 'carb', 1.5),
  ING('orzo_dry', 'Orzo (dry)', 353, 12.5, 71.0, 1.5, 'carb', 1.8),
  ING('noodles_dry', 'Egg noodles (dry)', 348, 12.0, 67.0, 2.0, 'carb', 3.5),
  ING('couscous_dry', 'Couscous (dry)', 358, 12.8, 72.5, 0.6, 'carb', 2.5),
  ING('potato', 'Potatoes', 77, 2.0, 17.0, 0.1, 'veg', 1.2),
  ING('broccoli', 'Broccoli', 34, 2.8, 4.0, 0.4, 'veg', 2.5),
  ING('courgette', 'Courgette', 17, 1.2, 2.2, 0.3, 'veg', 2.5),
  ING('spinach', 'Spinach', 23, 2.9, 1.4, 0.4, 'veg', 5.0),
  ING('peppers_mix', 'Mixed peppers / stir-fry veg', 30, 1.0, 5.0, 0.3, 'veg', 3.5),
  ING('green_beans', 'Green beans', 31, 1.8, 4.7, 0.2, 'veg', 4.5),
  ING('passata', 'Passata', 30, 1.3, 4.5, 0.2, 'veg', 1.2, { packSizeG: 500 }),
  ING('chopped_tomatoes', 'Chopped tomatoes (can)', 25, 1.2, 3.5, 0.2, 'veg', 1.2, { packSizeG: 400 }),
  ING('onion', 'Onion', 38, 1.0, 8.0, 0.1, 'veg', 1.2),
  ING('kidney_beans_drained', 'Kidney beans (drained)', 90, 7.0, 12.0, 0.5, 'veg', 2.0, { packSizeG: 240 }),
  ING('lentils_cooked', 'Lentils, cooked (pouch/can)', 116, 9.0, 20.0, 0.4, 'veg', 2.5, { packSizeG: 400 }),
  ING('pesto', 'Pesto', 450, 4.5, 6.0, 45.0, 'fat', 6.0),
  ING('olive_oil', 'Olive oil', 900, 0, 0, 100, 'pantry', 8.0),
  ING('honey', 'Honey', 320, 0, 80.0, 0, 'pantry', 7.0),
  ING('soy_sauce', 'Soy sauce', 60, 6.0, 8.0, 0, 'pantry', 6.0),
  ING('skyr', 'Skyr, plain', 63, 10.6, 4.0, 0.2, 'dairy', 4.6, { packSizeG: 450 }),
  ING('weetabix', 'Weetabix', 362, 12.0, 69.0, 2.0, 'carb', 5.0),
  ING('oat_milk_unsweetened', 'Oat milk, unsweetened', 42, 0.8, 6.6, 1.3, 'dairy', 1.6, { packSizeG: 1000 }),
  ING('banana', 'Banana', 89, 1.1, 20.5, 0.3, 'fruit', 1.5),
  ING('apple', 'Apple', 52, 0.3, 12.0, 0.2, 'fruit', 2.5),
  ING('chia', 'Chia seeds', 486, 16.5, 8.0, 30.7, 'fat', 10.0),
  ING('dark_chocolate_85', 'Dark chocolate 85%', 590, 9.5, 22.0, 46.0, 'pantry', 12.0),
  ING('nuts_mixed', 'Mixed nuts', 620, 21.0, 9.0, 54.0, 'fat', 11.0),
  ING('oats', 'Oats', 372, 13.5, 60.0, 7.0, 'carb', 1.6),
  ING('whey_protein', 'Whey protein', 375, 75.0, 8.0, 6.0, 'pantry', 25.0),
  ING('tuna_drained', 'Tinned tuna in water (drained)', 116, 26.0, 0, 1.0, 'pantry', 8.5),
  ING('rice_cakes', 'Rice cakes', 387, 8.0, 81.0, 3.0, 'carb', 6.0),
  ING('cottage_cheese', 'Cottage cheese', 98, 11.0, 3.5, 4.5, 'dairy', 4.5, { packSizeG: 300 }),
  ING('cherry_tomatoes', 'Cherry tomatoes', 18, 0.9, 2.7, 0.2, 'veg', 4.0),
]

// ---------------------------------------------------------------------------
// Recipes. All `verified` numbers are the spec's (§3–§5), reproduced from the
// ingredient table within ±1 kcal / ±1 g — guarded by macros.test.ts.
// ---------------------------------------------------------------------------

type RI = Recipe['ingredients'][number]
const ri = (ingredientId: string, grams: number, state: RI['state'] = 'as-sold'): RI => ({
  ingredientId,
  grams,
  state,
})

export const BREAKFAST_ID = 'breakfast'
export const SNACK_A = 'snack_a'
export const SNACK_B = 'snack_b'
export const SNACK_C = 'snack_c'
export const SNACK_D = 'snack_d'
export const SNACK_E = 'snack_e'
export const SNACK_F = 'snack_f'
export const SNACK_G = 'snack_g'
export const SNACK_H = 'snack_h'

/** Skyr-based templates (§4): at most ONE of these scheduled per day. */
export const SKYR_SNACK_IDS = [SNACK_A, SNACK_B, SNACK_D]

/** Low-fat set (§6.2 rule 4): salmon-day snacks are drawn from these. */
export const LOW_FAT_SNACK_IDS = [SNACK_B, SNACK_D, SNACK_F, SNACK_G]

export const SALMON_RECIPE_ID = 'r7'

const breakfast: Recipe = {
  id: BREAKFAST_ID,
  name: 'Weetabix–Skyr bowl',
  slotType: 'breakfast',
  // Cholesterol revision (2026-07): chocolate 10→5 g, +5 g oats.
  ingredients: [
    ri('weetabix', 56), // 3 biscuits
    ri('skyr', 200),
    ri('oat_milk_unsweetened', 180),
    ri('banana', 120, 'peeled'),
    ri('chia', 10),
    ri('oats', 5),
    ri('dark_chocolate_85', 5),
    ri('honey', 5),
  ],
  steps: [
    { text: 'Crumble the Weetabix into a bowl. Add Skyr and oat milk, stir, rest 2 min to soften.' },
    {
      text: 'Top with sliced banana, chia, oats, chopped chocolate and honey. Sweetener to taste (~2 g, calibrate per brand); cinnamon optional.',
    },
  ],
  tags: [],
  reheatNote: 'Eat fresh — no reheat.',
  verified: { kcal: 624, p: 33, c: 92, f: 10 },
}

const snacks: Recipe[] = [
  {
    id: SNACK_A,
    name: 'A′ · Skyr power bowl',
    slotType: 'snack',
    ingredients: [ri('skyr', 200), ri('apple', 100), ri('nuts_mixed', 10), ri('honey', 5)],
    steps: [
      {
        text: 'Skyr into a bowl; top with 100 g chopped fruit (apple default — banana works, +~37 kcal), 10 g mixed nuts, 5 g honey.',
      },
    ],
    tags: [],
    reheatNote: 'Assemble fresh — 2 min.',
    verified: { kcal: 256, p: 24, c: 25, f: 6 },
  },
  {
    id: SNACK_B,
    name: 'B′ · Mini Weetabix bowl',
    slotType: 'snack',
    ingredients: [ri('weetabix', 37), ri('skyr', 150), ri('oat_milk_unsweetened', 120)],
    steps: [{ text: 'Crumble 2 Weetabix, add Skyr and oat milk, sweetener to taste. Rest 1–2 min.' }],
    tags: [],
    reheatNote: 'Assemble fresh — 2 min.',
    verified: { kcal: 279, p: 21, c: 40, f: 3 },
  },
  {
    id: SNACK_C,
    name: 'C · Fruit + nuts',
    slotType: 'snack',
    ingredients: [ri('banana', 120, 'peeled'), ri('nuts_mixed', 25)],
    steps: [{ text: 'One banana (120 g peeled) + 25 g mixed nuts.' }],
    tags: [],
    reheatNote: 'Portable, shelf-stable.',
    verified: { kcal: 262, p: 7, c: 27, f: 14 },
  },
  {
    id: SNACK_D,
    name: 'D′ · Skyr jar',
    slotType: 'snack',
    ingredients: [ri('skyr', 200), ri('apple', 100), ri('oats', 15), ri('honey', 5)],
    steps: [
      {
        text: 'Layer Skyr, 100 g chopped fruit (apple default — banana works, +~37 kcal), 15 g oats and 5 g honey in a jar.',
      },
    ],
    tags: [],
    reheatNote: 'Portable — take in a cold bag.',
    verified: { kcal: 250, p: 24, c: 33, f: 2 },
  },
  {
    id: SNACK_E,
    name: 'E · Emergency protein bar',
    slotType: 'snack',
    ingredients: [], // one bar, 15–25 g protein — no tracked ingredients, no grocery quantities
    steps: [{ text: 'One bar with 15–25 g protein. Emergency option — keep a couple in your bag.' }],
    tags: [],
    reheatNote: 'Shelf-stable backup.',
    verified: { kcal: 220, p: 20, c: 0, f: 0 },
  },
  {
    id: SNACK_F,
    name: 'F · Whey-banana shake',
    slotType: 'snack',
    ingredients: [ri('whey_protein', 30), ri('banana', 120, 'peeled'), ri('oats', 10)],
    steps: [
      { text: 'Shake or blend 30 g whey with 250–300 ml cold water (splash of oat milk optional); banana + oats alongside, or blend everything.' },
    ],
    tags: [],
    reheatNote: 'Portable — shaker + banana travel fine.',
    verified: { kcal: 257, p: 25, c: 33, f: 3 },
  },
  {
    id: SNACK_G,
    name: 'G · Tuna pot',
    slotType: 'snack',
    ingredients: [ri('tuna_drained', 100, 'drained'), ri('rice_cakes', 35)],
    steps: [
      { text: 'Drain one tin of tuna in water (100 g drained) onto rice cakes; cherry tomatoes to taste, salt and pepper.' },
    ],
    tags: [],
    reheatNote: 'Portable, shelf-stable until opened.',
    verified: { kcal: 251, p: 29, c: 28, f: 2 },
  },
  {
    id: SNACK_H,
    name: 'H · Cottage cheese bowl',
    slotType: 'snack',
    ingredients: [ri('cottage_cheese', 200), ri('apple', 100)],
    steps: [
      { text: 'Cottage cheese into a bowl; top with 100 g chopped fruit (apple default — banana works, +~37 kcal).' },
    ],
    tags: [],
    reheatNote: 'Fridge — assemble fresh.',
    verified: { kcal: 248, p: 22, c: 19, f: 9 },
  },
]

const mains: Recipe[] = [
  {
    id: 'r1',
    name: 'Lemon-herb chicken, rice & broccoli',
    slotType: 'main',
    ingredients: [ri('chicken_breast', 160, 'raw'), ri('rice_dry', 105), ri('broccoli', 150, 'raw'), ri('olive_oil', 22)],
    steps: [
      { text: 'Rice on to boil (see water table).' },
      {
        text: 'Season chicken, pan-sear in half the oil 4–5 min/side to 74 °C core; rest, slice.',
        overridesByServings: {
          '3-4': 'Season chicken; sear in two batches — or bake all pieces at 200 °C for 20–22 min. Rest, slice.',
        },
      },
      { text: 'Steam or boil broccoli 5 min.' },
      { text: 'Whisk remaining oil + lemon (juice + zest of ½) + garlic + oregano/thyme; dress everything.' },
    ],
    tags: ['keeper'],
    reheatNote: 'Microwave 2:30 covered, splash of water on the rice.',
    verified: { kcal: 787, p: 48, c: 87, f: 26 },
  },
  {
    id: 'r2',
    name: 'Saffron chicken, courgette & rice',
    slotType: 'main',
    ingredients: [
      ri('chicken_breast', 160, 'raw'),
      ri('rice_dry', 105),
      ri('courgette', 200, 'raw'),
      ri('onion', 40, 'raw'),
      ri('olive_oil', 22),
    ],
    steps: [
      { text: 'Bloom 1 pinch of saffron in 2 tbsp hot water.' },
      {
        text: 'Soften onion in the oil, add diced chicken 5–6 min, add courgette half-moons 4 min.',
        overridesByServings: {
          '3-4': 'Use your widest pan. Soften onion in the oil, add diced chicken 5–6 min (in two batches if crowded); add courgette in two additions so it fries, not steams.',
        },
      },
      { text: 'Stir cooked rice + saffron water through; season with salt and pepper.' },
    ],
    tags: ['keeper'],
    reheatNote: 'Microwave 2:30 covered — excellent; flavour improves.',
    verified: { kcal: 785, p: 46, c: 89, f: 27 },
  },
  {
    id: 'r3',
    name: 'Chicken pesto tomato pasta',
    slotType: 'main',
    ingredients: [
      ri('chicken_breast', 150, 'raw'),
      ri('pasta_dry', 100),
      ri('pesto', 30),
      ri('passata', 100),
      ri('spinach', 50, 'raw'),
      ri('olive_oil', 10),
    ],
    steps: [
      { text: 'Pasta into salted boiling water (see water table).' },
      {
        text: 'Sear diced chicken in the oil.',
        overridesByServings: { '3-4': 'Sear diced chicken in the oil, working in two batches.' },
      },
      { text: 'Add passata, simmer 3 min; off the heat stir in pesto + spinach (off-heat keeps the colour at any scale).' },
      {
        text: 'Toss with the pasta + a splash of pasta water.',
        overridesByServings: { '4': 'Toss with the pasta + a splash of pasta water — use a 28 cm+ pan.' },
      },
    ],
    tags: [],
    reheatNote: 'Microwave 2:00 with a spoon of water; pesto dulls slightly — acceptable.',
    verified: { kcal: 778, p: 50, c: 78, f: 28 },
  },
  {
    id: 'r4',
    name: 'Honey-soy chicken noodles',
    slotType: 'main',
    ingredients: [
      ri('chicken_breast', 155, 'raw'),
      ri('noodles_dry', 100),
      ri('peppers_mix', 200, 'raw'),
      ri('honey', 18),
      ri('soy_sauce', 20),
      ri('olive_oil', 15), // sesame or neutral oil
    ],
    steps: [
      { text: 'One pan + kettle. Noodles soak/boil per pack.' },
      {
        text: 'Stir-fry chicken strips on high heat 4 min (sesame or neutral oil), add veg 3 min.',
        overridesByServings: {
          '3-4': 'Stir-fry chicken strips on high heat in two batches, then add veg 3 min.',
        },
      },
      { text: 'Honey + soy + garlic in, 1 min.' },
      { text: 'Toss noodles through; reserve ⅓ of the sauce to add at reheat.' },
    ],
    tags: ['quick'],
    reheatNote: 'Add reserved sauce + 1 tbsp water, microwave 2:00, stir halfway (prevents clumping).',
    verified: { kcal: 777, p: 49, c: 93, f: 21 },
  },
  {
    id: 'r5',
    name: 'Lean beef & lentil chilli with rice',
    slotType: 'main',
    // Cholesterol revision (2026-07): beef 160→110 g, +120 g cooked lentils.
    // Rice −10 g (the sanctioned lever) still left kcal ~+42 over the ±30
    // band, so kidney beans trimmed 80→40 g (total legumes still ×2 the
    // original). 792 kcal / 46 P vs the 786 / 49 target.
    ingredients: [
      ri('beef_mince_5', 110, 'raw'),
      ri('lentils_cooked', 120, 'cooked'),
      ri('rice_dry', 90),
      ri('kidney_beans_drained', 40, 'drained'),
      ri('chopped_tomatoes', 150),
      ri('onion', 50, 'raw'),
      ri('olive_oil', 12),
    ],
    steps: [
      { text: 'Brown onion in the oil, then the mince, hard.' },
      {
        text: 'Chilli powder, cumin, paprika, garlic — 1 min. Tomatoes + beans + lentils + simmer water (see water table), simmer 15–20 min.',
        overridesByServings: {
          '4': 'Chilli powder, cumin, paprika, garlic — 1 min. Tomatoes + beans + lentils + simmer water (see water table), simmer 20–25 min (same pot, +5 min at 4 servings).',
        },
      },
      { text: 'Rice separately (see water table).' },
    ],
    tags: ['keeper', 'bigpot'],
    reheatNote: 'Microwave 2:30; improves by day 2.',
    verified: { kcal: 792, p: 46, c: 108, f: 19 },
  },
  {
    id: 'r6',
    name: 'Turkey, tomato & spinach orzo',
    slotType: 'main',
    // Cholesterol revision (2026-07): beef → turkey mince, same grams. Turkey
    // 5% runs 24 kcal/100 g hotter than the beef it replaces, so kcal rose
    // (not fell) out of the ±30 band — oil trimmed 16→12 g brings it back to
    // exactly the original 779 kcal / 49 P.
    ingredients: [
      ri('turkey_mince_5', 150, 'raw'),
      ri('orzo_dry', 105),
      ri('passata', 150),
      ri('spinach', 80, 'raw'),
      ri('onion', 40, 'raw'),
      ri('olive_oil', 12),
    ],
    steps: [
      { text: 'Brown onion + mince in the oil with garlic and oregano.' },
      {
        // §5.1 has no orzo-absorption column; the spec says "not linear". These
        // amounts are advisory — orzo should just stay covered while it simmers.
        text: 'Passata + 250 ml water, orzo straight in, simmer 10–12 min stirring.',
        overridesByServings: {
          '2': 'Passata + ~450 ml water, orzo straight in, simmer 10–12 min stirring.',
          '3': 'Passata + ~600 ml water, orzo straight in, simmer 11–13 min stirring.',
          '4': 'Passata + ~750 ml water (orzo just covered), one pot, simmer 12–14 min stirring.',
        },
      },
      { text: 'Spinach in off the heat.' },
    ],
    tags: ['keeper', 'bigpot'],
    reheatNote: 'Microwave 2:00 + splash of water — orzo reabsorbs beautifully.',
    verified: { kcal: 779, p: 49, c: 86, f: 25 },
  },
  {
    id: SALMON_RECIPE_ID,
    name: 'Salmon, potatoes & greens',
    slotType: 'main',
    ingredients: [
      ri('salmon', 185, 'raw'),
      ri('potato', 430, 'raw'),
      ri('green_beans', 150, 'raw'),
      ri('olive_oil', 3),
    ],
    steps: [
      { text: 'Potato chunks, skin on, boil 12–15 min (or roast 200 °C 30 min with the oil).' },
      {
        text: 'Salmon in a 200 °C oven 12–14 min.',
        overridesByServings: { '3-4': 'All fillets on one tray, 200 °C, 12–14 min — same time.' },
      },
      { text: 'Greens steamed 5 min. Lemon + dill/parsley over. Fat comes from the fish — do not add more oil.' },
    ],
    tags: [],
    reheatNote: 'Microwave 1:30 medium power only — UCD microwave approved by owner.',
    verified: { kcal: 776, p: 49, c: 80, f: 28 },
  },
  {
    id: 'r8',
    name: 'Lemon-paprika cod, couscous & veg',
    slotType: 'main',
    ingredients: [
      ri('cod', 190, 'raw'), // frozen OK, defrosted
      ri('couscous_dry', 105),
      ri('peppers_mix', 200, 'raw'), // peppers/courgette mix
      ri('olive_oil', 22),
    ],
    steps: [
      { text: 'One pan + kettle. Couscous + equal volume boiling water, cover 5 min.' },
      {
        text: 'Fry veg 4 min, push aside; fish in smoked paprika + the oil, 3–4 min/side.',
        overridesByServings: { '3-4': 'Fry veg 4 min, set aside; cook the fish in two batches, 3–4 min/side.' },
      },
      { text: 'Lemon over everything, fluff couscous through.' },
    ],
    tags: ['quick'],
    reheatNote: 'Microwave 1:30 medium; mild smell — approved for UCD.',
    verified: { kcal: 790, p: 50, c: 86, f: 25 },
  },
]

export const SEED_RECIPES: Recipe[] = [breakfast, ...snacks, ...mains]

// §3 emergency breakfast — informational only (never auto-rotated, never in
// grocery; bread/eggs are not part of the §10 table, macros are approximate).
export const EMERGENCY_BREAKFAST = {
  title: 'Emergency breakfast',
  note: 'Only when an ingredient is missing — never auto-rotated.',
  body: '90 g sourdough/wholegrain bread, toasted · 3 eggs, scrambled · 150 g fruit · 100 g Skyr if available.',
  macros: '~640 kcal · ~34 g protein',
}

export const DEFAULT_SETTINGS: Settings = {
  targets: { kcal: 2700, p: 150, fMin: 70, fMax: 80, cMin: 330, cMax: 350 },
  shopDay: 'Sat',
  planGenDay: 'Sat',
  language: 'en',
}

// v2: snack canon revision — F/G/H templates + their §10 ingredients added.
// v3: static Dublin price estimates — priceEurPerKg on every ingredient.
// v4: cholesterol recipe revision (R5/R6/breakfast + turkey/lentils) refreshed
//     into stored state, and the daily supplements checklist (supplementsLog).
export const STATE_VERSION = 4

export function buildSeedState(): AppState {
  return {
    version: STATE_VERSION,
    ingredients: SEED_INGREDIENTS,
    recipes: SEED_RECIPES,
    weeks: [],
    weights: [],
    supplementsLog: {},
    settings: DEFAULT_SETTINGS,
    flags: {},
  }
}
