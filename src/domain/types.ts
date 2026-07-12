// Data model per spec §8, with three documented additions:
//  - SlotRef: referenced by the spec but never defined there
//  - WeekPlan.groceryChecked: grocery checkbox persistence required by §6.3
//  - AppState.flags: freezer-buffer tip dismissal required by §6.4

export interface Macros {
  kcal: number
  p: number
  c: number
  f: number
}

export type IngredientCategory = 'protein' | 'carb' | 'veg' | 'fruit' | 'dairy' | 'fat' | 'pantry'

export interface Ingredient {
  id: string
  name: string
  per100g: Macros
  category: IngredientCategory
  packSizeG?: number
  freezable: boolean
  /** Dublin average (Tesco/Lidl/Dunnes), €/kg — liquids per litre. Deliberately approximate (§6.3). */
  priceEurPerKg?: number
}

export type IngredientState = 'raw' | 'cooked' | 'drained' | 'as-sold' | 'peeled'

export interface RecipeIngredient {
  ingredientId: string
  grams: number
  state: IngredientState
}

export interface RecipeStep {
  text: string
  overridesByServings?: Record<string, string> // key "2", "3-4", etc.
}

export type RecipeTag = 'quick' | 'keeper' | 'bigpot'

export type SlotType = 'main' | 'snack' | 'breakfast'

export interface Recipe {
  id: string
  name: string
  slotType: SlotType
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  tags: RecipeTag[]
  reheatNote: string
  verified: Macros // per 1 serving
}

export interface SlotRef {
  date: string // local YYYY-MM-DD
  slot: 'L' | 'D'
}

export type SessionId = 'S1' | 'S2' | 'S3' | 'S4'
export type SessionDay = 'Sun' | 'Tue' | 'Wed' | 'Sat'

export interface CookSession {
  id: SessionId
  day: SessionDay
  portions: 2 | 4
  recipeId: string
  covers: SlotRef[]
  done: boolean
}

export type SlotKey = 'B' | 'S1' | 'L' | 'S2' | 'D'
export type SlotStatus = 'planned' | 'eaten' | 'off-plan'

export interface PlanSlot {
  date: string // local YYYY-MM-DD
  slot: SlotKey
  recipeId: string
  status: SlotStatus
  tasks?: string[] // defrost prompts
}

export interface WeekPlan {
  // The Saturday that starts this Sat→Fri cook cycle (shop Sat AM, S4 Sat,
  // S1 Sun, S2 Tue, S3 Wed). Calendar weeks elsewhere (Trends) start Monday.
  weekStartISO: string
  sessions: CookSession[]
  snackTemplateIds: string[]
  slots: PlanSlot[]
  groceryChecked?: string[]
}

export interface WeightEntry {
  dateISO: string
  kg: number
}

export interface Settings {
  targets: { kcal: number; p: number; fMin: number; fMax: number; cMin: number; cMax: number }
  shopDay: string
  planGenDay: string
  language: 'en'
}

export interface AppState {
  version: number
  ingredients: Ingredient[]
  recipes: Recipe[]
  weeks: WeekPlan[]
  weights: WeightEntry[]
  settings: Settings
  flags?: { freezerTipDismissed?: boolean }
}
