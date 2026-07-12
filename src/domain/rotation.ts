import type { CookSession, Ingredient, PlanSlot, Recipe, SessionId, SlotRef, WeekPlan } from './types'
import { addDays, cycleDates, weekIndex } from './dates'
import {
  BREAKFAST_ID,
  LOW_FAT_SNACK_IDS,
  SALMON_RECIPE_ID,
  SKYR_SNACK_IDS,
  SNACK_A,
  SNACK_C,
  SNACK_D,
  SNACK_F,
  SNACK_G,
} from './seed'

// ---------------------------------------------------------------------------
// §6.1 cook cycle — fixed shape, laid over a Sat→Fri cycle (day 0 = Saturday):
//   S4 cooks Sat (d0), 4 portions → Sat & Sun L+D   (max age 1 day)
//   S1 cooks Sun (d1), 4 portions → Mon & Tue L+D   (max age 2 days)
//   S2 cooks Tue (d3), 2 portions → Wed L+D         (quick recipe only)
//   S3 cooks Wed (d4), 4 portions → Thu & Fri L+D   (max age 2 days)
// ---------------------------------------------------------------------------

interface SessionShape {
  id: SessionId
  day: CookSession['day']
  cookOffset: number
  coverOffsets: number[]
  portions: 2 | 4
}

export const SESSION_SHAPES: SessionShape[] = [
  { id: 'S4', day: 'Sat', cookOffset: 0, coverOffsets: [0, 1], portions: 4 },
  { id: 'S1', day: 'Sun', cookOffset: 1, coverOffsets: [2, 3], portions: 4 },
  { id: 'S2', day: 'Tue', cookOffset: 3, coverOffsets: [4], portions: 2 },
  { id: 'S3', day: 'Wed', cookOffset: 4, coverOffsets: [5, 6], portions: 4 },
]

export function sessionCookDate(plan: WeekPlan, sessionId: SessionId): string {
  const shape = SESSION_SHAPES.find((s) => s.id === sessionId)!
  return addDays(plan.weekStartISO, shape.cookOffset)
}

function coversFor(satISO: string, shape: SessionShape): SlotRef[] {
  return shape.coverOffsets.flatMap((off) => {
    const date = addDays(satISO, off)
    return [
      { date, slot: 'L' as const },
      { date, slot: 'D' as const },
    ]
  })
}

// ---------------------------------------------------------------------------
// §6.2 rotation — deterministic. weekIndex(cycle Saturday) rotates ties so
// consecutive weeks vary without randomness.
// ---------------------------------------------------------------------------

const isQuick = (r: Recipe) => r.tags.includes('quick')
const isKeeper = (r: Recipe) => r.tags.includes('keeper')

/** Stable pick: order candidates by score desc (id asc within), rotate within the top-score group. */
function pickScored(cands: Recipe[], score: (r: Recipe) => number, rot: number): Recipe {
  const sorted = [...cands].sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id))
  const top = sorted.filter((r) => score(r) === score(sorted[0]!))
  return top[((rot % top.length) + top.length) % top.length]!
}

/**
 * Pick the 4 recipes of a cycle (§6.2 rules 1–5).
 * Returned keyed by session id.
 */
export function proposeSessions(
  satISO: string,
  mains: Recipe[],
  prevPlan?: WeekPlan,
): Record<SessionId, string> {
  const wi = weekIndex(satISO)
  const prevIds = new Set(prevPlan?.sessions.map((s) => s.recipeId) ?? [])
  const prevPenalty = (r: Recipe) => (prevIds.has(r.id) ? -3 : 0)

  // Rule 1: S2 (Tuesday, post-gym) must be `quick`.
  const quick = mains.filter(isQuick)
  const s2Pool = quick.filter((r) => !prevIds.has(r.id))
  const s2 = pickScored(s2Pool.length ? s2Pool : quick, () => 0, wi)

  // Rules 2, 3, 5: no intra-week repeats; last week deprioritised (soft);
  // keepers preferred for S1/S3 (their portions live longest).
  const pool = new Set(mains.filter((r) => r.id !== s2.id))
  const keeperScore = (r: Recipe) => (isKeeper(r) ? 2 : 0) + prevPenalty(r)

  const s1 = pickScored([...pool], keeperScore, wi)
  pool.delete(s1)
  const s3 = pickScored([...pool], keeperScore, wi + 1)
  pool.delete(s3)
  // S4 is eaten within a day — keeper not needed; just avoid last week's picks.
  const s4 = pickScored([...pool], prevPenalty, wi)

  // Rule 4 (salmon ≤ once/week) holds because recipes never repeat in a week.
  return { S1: s1.id, S2: s2.id, S3: s3.id, S4: s4.id }
}

// ---------------------------------------------------------------------------
// Snack pick & daily assignment (§4, §6.2).
// ---------------------------------------------------------------------------

export function salmonDatesOf(satISO: string, sessionRecipes: Record<SessionId, string>): Set<string> {
  const dates = new Set<string>()
  for (const shape of SESSION_SHAPES) {
    if (sessionRecipes[shape.id] === SALMON_RECIPE_ID) {
      for (const off of shape.coverOffsets) dates.add(addDays(satISO, off))
    }
  }
  return dates
}

/** §4: the two daily snacks must together carry at least this much protein. */
export const MIN_DAILY_SNACK_PROTEIN = 20

export type ProteinOf = (recipeId: string) => number

const isSkyr = (id: string) => SKYR_SNACK_IDS.includes(id)

/**
 * All valid day-pairs from a candidate set (§4 rules): at most ONE Skyr-based
 * template per day (the same Skyr template twice also counts as two), and
 * combined protein ≥ MIN_DAILY_SNACK_PROTEIN. A non-Skyr template may fill
 * both slots. Distinct-template pairs are ordered first for variety.
 */
export function validSnackPairs(candidates: string[], proteinOf: ProteinOf): [string, string][] {
  const pairs: [string, string][] = []
  for (const a of candidates) {
    for (const b of candidates) {
      if ((isSkyr(a) ? 1 : 0) + (isSkyr(b) ? 1 : 0) > 1) continue
      if (proteinOf(a) + proteinOf(b) < MIN_DAILY_SNACK_PROTEIN) continue
      pairs.push([a, b])
    }
  }
  return [...pairs.filter(([a, b]) => a !== b), ...pairs.filter(([a, b]) => a === b)]
}

/** Default weekly snack proposal; user confirms/edits on plan generation. */
export function proposeSnackPick(salmonInPlan: boolean): string[] {
  // Salmon days draw from the low-fat set {B′, D′, F, G} with max one Skyr —
  // so a salmon week needs F or G on hand.
  return salmonInPlan ? [SNACK_D, SNACK_F, SNACK_A] : [SNACK_A, SNACK_D, SNACK_C]
}

/** Returns an error message, or null if the pick is valid. */
export function validateSnackPick(pick: string[], salmonInPlan: boolean, proteinOf: ProteinOf): string | null {
  if (pick.length < 2 || pick.length > 3) return 'Pick 2–3 snack templates for the week.'
  if (validSnackPairs(pick, proteinOf).length === 0)
    return 'No valid day from this pick — max one Skyr snack (A′/B′/D′) per day, ≥20 g combined snack protein.'
  if (salmonInPlan && validSnackPairs(pick.filter((id) => LOW_FAT_SNACK_IDS.includes(id)), proteinOf).length === 0)
    return 'Salmon week: include F or G — salmon-day snacks come from the low-fat set (B′/D′/F/G), max one Skyr.'
  return null
}

/**
 * Assign the two daily snack slots from the weekly pick (§4): rotate through
 * the valid day-pairs. Salmon-covered days rotate through the valid pairs of
 * the picked low-fat templates {B′, D′, F, G} (§6.2 rule 4).
 */
export function assignSnacks(
  pick: string[],
  dates: string[],
  salmonDates: Set<string>,
  proteinOf: ProteinOf,
): Map<string, [string, string]> {
  const normalPairs = validSnackPairs(pick, proteinOf)
  const lowFatPairs = validSnackPairs(
    pick.filter((id) => LOW_FAT_SNACK_IDS.includes(id)),
    proteinOf,
  )
  if (normalPairs.length === 0) throw new Error('Snack pick allows no valid day (validate the pick first).')
  const out = new Map<string, [string, string]>()
  dates.forEach((date, i) => {
    const pool = salmonDates.has(date) && lowFatPairs.length > 0 ? lowFatPairs : normalPairs
    out.set(date, pool[i % pool.length]!)
  })
  return out
}

// ---------------------------------------------------------------------------
// Plan generation & session swap.
// ---------------------------------------------------------------------------

function proteinNameOf(recipeId: string, recipes: Map<string, Recipe>, ingredients: Map<string, Ingredient>): string {
  const recipe = recipes.get(recipeId)
  const prot = recipe?.ingredients.find((ri) => ingredients.get(ri.ingredientId)?.category === 'protein')
  return prot ? ingredients.get(prot.ingredientId)!.name : 'protein'
}

/**
 * §6.3: defrost tasks injected into the daily plan. S2 and S3 proteins are
 * frozen on arrival (Sat); move them to the fridge the evening before cooking.
 */
function defrostTasks(
  satISO: string,
  sessionRecipes: Record<SessionId, string>,
  recipes: Map<string, Recipe>,
  ingredients: Map<string, Ingredient>,
): Map<string, string[]> {
  const tasks = new Map<string, string[]>()
  const s2Protein = proteinNameOf(sessionRecipes.S2, recipes, ingredients)
  const s3Protein = proteinNameOf(sessionRecipes.S3, recipes, ingredients)
  // Monday evening (d2) → Tuesday's cook; Tuesday evening (d3) → Wednesday's cook.
  tasks.set(addDays(satISO, 2), [`Defrost: move ${s2Protein.toLowerCase()} to the fridge for Tuesday's cook (S2)`])
  tasks.set(addDays(satISO, 3), [`Defrost: move ${s3Protein.toLowerCase()} to the fridge for Wednesday's cook (S3)`])
  return tasks
}

export interface GenerateOptions {
  sessionOverrides?: Partial<Record<SessionId, string>>
  snackPick?: string[]
}

/** Build a complete WeekPlan for the cycle starting satISO. Pure — caller stores it. */
export function generateCycle(
  satISO: string,
  allRecipes: Recipe[],
  ingredients: Map<string, Ingredient>,
  prevPlan?: WeekPlan,
  options: GenerateOptions = {},
): WeekPlan {
  const mains = allRecipes.filter((r) => r.slotType === 'main')
  const recipeById = new Map(allRecipes.map((r) => [r.id, r]))

  const proposed = proposeSessions(satISO, mains, prevPlan)
  const sessionRecipes: Record<SessionId, string> = { ...proposed, ...options.sessionOverrides }

  const salmonDates = salmonDatesOf(satISO, sessionRecipes)
  const proteinOf: ProteinOf = (id) => recipeById.get(id)?.verified.p ?? 0
  let pick = options.snackPick ?? proposeSnackPick(salmonDates.size > 0)
  // Safety net (§6.2 rule 4): salmon days need a low-fat non-Skyr option (F/G),
  // since at most one of B′/D′ may appear on any day.
  if (salmonDates.size > 0 && !pick.includes(SNACK_F) && !pick.includes(SNACK_G)) {
    pick = pick.length >= 3 ? [...pick.slice(0, 2), SNACK_F] : [...pick, SNACK_F]
  }
  if (validateSnackPick(pick, salmonDates.size > 0, proteinOf) !== null) {
    pick = proposeSnackPick(salmonDates.size > 0) // last-resort fallback for invalid input picks
  }

  const dates = cycleDates(satISO)
  const snackByDate = assignSnacks(pick, dates, salmonDates, proteinOf)
  const tasks = defrostTasks(satISO, sessionRecipes, recipeById, ingredients)

  const sessions: CookSession[] = SESSION_SHAPES.map((shape) => ({
    id: shape.id,
    day: shape.day,
    portions: shape.portions,
    recipeId: sessionRecipes[shape.id],
    covers: coversFor(satISO, shape),
    done: false,
  }))

  const mainByDateSlot = new Map<string, string>()
  for (const s of sessions) {
    for (const ref of s.covers) mainByDateSlot.set(`${ref.date}|${ref.slot}`, s.recipeId)
  }

  const slots: PlanSlot[] = []
  for (const date of dates) {
    const [snack1, snack2] = snackByDate.get(date)!
    const dayTasks = tasks.get(date)
    slots.push(
      { date, slot: 'B', recipeId: BREAKFAST_ID, status: 'planned' },
      { date, slot: 'S1', recipeId: snack1, status: 'planned' },
      { date, slot: 'L', recipeId: mainByDateSlot.get(`${date}|L`)!, status: 'planned' },
      { date, slot: 'S2', recipeId: snack2, status: 'planned' },
      { date, slot: 'D', recipeId: mainByDateSlot.get(`${date}|D`)!, status: 'planned', ...(dayTasks ? { tasks: dayTasks } : {}) },
    )
  }

  return { weekStartISO: satISO, sessions, snackTemplateIds: pick, slots, groceryChecked: [] }
}

/**
 * §6.2 rule 6 — swap a session's recipe (whole session, all portions), before
 * or during the week. Slot statuses are preserved; snack assignments are
 * recomputed (only salmon-affected days actually change); defrost tasks
 * refresh. Grocery is recomputed by the caller via buildGroceryList — checked
 * items are reconciled there.
 */
export function swapSession(
  plan: WeekPlan,
  allRecipes: Recipe[],
  ingredients: Map<string, Ingredient>,
  sessionId: SessionId,
  newRecipeId: string,
): WeekPlan {
  const recipeById = new Map(allRecipes.map((r) => [r.id, r]))
  const newRecipe = recipeById.get(newRecipeId)
  if (!newRecipe || newRecipe.slotType !== 'main') throw new Error(`Not a main recipe: ${newRecipeId}`)
  const session = plan.sessions.find((s) => s.id === sessionId)
  if (!session) throw new Error(`No session ${sessionId}`)
  if (sessionId === 'S2' && !newRecipe.tags.includes('quick'))
    throw new Error('S2 (Tuesday) only takes quick recipes (R4 or R8).')
  if (plan.sessions.some((s) => s.id !== sessionId && s.recipeId === newRecipeId))
    throw new Error('No recipe repeats within the same week.')

  const sessions = plan.sessions.map((s) => (s.id === sessionId ? { ...s, recipeId: newRecipeId } : s))
  const sessionRecipes = Object.fromEntries(sessions.map((s) => [s.id, s.recipeId])) as Record<SessionId, string>

  const satISO = plan.weekStartISO
  const salmonDates = salmonDatesOf(satISO, sessionRecipes)
  const proteinOf: ProteinOf = (id) => recipeById.get(id)?.verified.p ?? 0
  let pick = plan.snackTemplateIds
  if (salmonDates.size > 0 && !pick.includes(SNACK_F) && !pick.includes(SNACK_G)) {
    pick = pick.length >= 3 ? [...pick.slice(0, 2), SNACK_F] : [...pick, SNACK_F]
  }
  const dates = cycleDates(satISO)
  const snackByDate = assignSnacks(pick, dates, salmonDates, proteinOf)
  const tasks = defrostTasks(satISO, sessionRecipes, recipeById, ingredients)

  const covered = new Set(session.covers.map((c) => `${c.date}|${c.slot}`))
  const slots = plan.slots.map((slot) => {
    if (covered.has(`${slot.date}|${slot.slot}`)) return { ...slot, recipeId: newRecipeId }
    if (slot.slot === 'S1') return { ...slot, recipeId: snackByDate.get(slot.date)![0] }
    if (slot.slot === 'S2') return { ...slot, recipeId: snackByDate.get(slot.date)![1] }
    if (slot.slot === 'D') {
      const t = tasks.get(slot.date)
      return t ? { ...slot, tasks: t } : { ...slot, tasks: undefined }
    }
    return slot
  })

  return { ...plan, sessions, snackTemplateIds: pick, slots }
}
