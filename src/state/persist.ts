import type { AppState } from '../domain/types'
import { buildSeedState, SEED_INGREDIENTS, SEED_RECIPES, STATE_VERSION } from '../domain/seed'
import { todayISO } from '../domain/dates'

// Single AppState JSON in localStorage (§8): debounced writes, schema version
// for migrations, one-tap export/import for backup + phone↔laptop moves.

const KEY = 'nutri:v1'

/**
 * v1 → v2: the snack-canon revision added recipes (F/G/H) and ingredients to
 * the seed, which live inside the persisted state — merge in whatever this
 * state is missing (by id; existing entries are left untouched).
 */
function migrateV1toV2(state: AppState): AppState {
  const recipeIds = new Set(state.recipes.map((r) => r.id))
  const ingredientIds = new Set(state.ingredients.map((i) => i.id))
  return {
    ...state,
    version: 2,
    recipes: [...state.recipes, ...SEED_RECIPES.filter((r) => !recipeIds.has(r.id))],
    ingredients: [...state.ingredients, ...SEED_INGREDIENTS.filter((i) => !ingredientIds.has(i.id))],
  }
}

/**
 * v2 → v3: static Dublin price estimates. Stamp priceEurPerKg onto stored
 * ingredients from the seed (by id); ingredients aren't user-editable in v1,
 * so seed prices are authoritative.
 */
function migrateV2toV3(state: AppState): AppState {
  const priceById = new Map(SEED_INGREDIENTS.map((i) => [i.id, i.priceEurPerKg]))
  return {
    ...state,
    version: 3,
    ingredients: state.ingredients.map((i) => ({ ...i, priceEurPerKg: priceById.get(i.id) ?? i.priceEurPerKg })),
  }
}

/**
 * v3 → v4: cholesterol recipe revision + supplements checklist. Recipes and
 * ingredients are not user-editable in v1, so the revised seed versions are
 * authoritative and replace the stored copies wholesale (ids are stable —
 * existing plans keep working). supplementsLog starts empty: every day is
 * unchecked until tapped.
 */
function migrateV3toV4(state: AppState): AppState {
  return {
    ...state,
    version: 4,
    recipes: SEED_RECIPES,
    ingredients: SEED_INGREDIENTS,
    supplementsLog: state.supplementsLog ?? {},
  }
}

function migrate(raw: unknown): AppState {
  let state = raw as AppState
  if (state.version === 1) state = migrateV1toV2(state)
  if (state.version === 2) state = migrateV2toV3(state)
  if (state.version === 3) state = migrateV3toV4(state)
  if (state.version !== STATE_VERSION) {
    throw new Error(`Unknown schema version: ${String(state.version)}`)
  }
  return state
}

function isPlausibleState(s: unknown): s is AppState {
  if (typeof s !== 'object' || s === null) return false
  const st = s as Record<string, unknown>
  return (
    typeof st.version === 'number' &&
    Array.isArray(st.ingredients) &&
    Array.isArray(st.recipes) &&
    Array.isArray(st.weeks) &&
    Array.isArray(st.weights) &&
    typeof st.settings === 'object' &&
    st.settings !== null
  )
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return buildSeedState()
    const parsed: unknown = JSON.parse(raw)
    if (!isPlausibleState(parsed)) return buildSeedState()
    return migrate(parsed)
  } catch {
    // Corrupt storage or unknown version — start from seed rather than crash.
    // (The owner's backup path is the JSON export.)
    return buildSeedState()
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Quota/private-mode failures are non-fatal; the app keeps running in memory.
  }
}

let pending: ReturnType<typeof setTimeout> | undefined
let latest: AppState | undefined

/** Debounced save (300 ms); call flushSave on pagehide so nothing is lost. */
export function debouncedSave(state: AppState): void {
  latest = state
  if (pending !== undefined) clearTimeout(pending)
  pending = setTimeout(() => {
    pending = undefined
    if (latest) saveState(latest)
  }, 300)
}

export function flushSave(): void {
  if (pending !== undefined) {
    clearTimeout(pending)
    pending = undefined
  }
  if (latest) saveState(latest)
}

export function exportFilename(): string {
  return `nutri-backup-${todayISO()}.json`
}

export function serializeState(state: AppState): string {
  return JSON.stringify(state, null, 2)
}

/** Parse an imported backup; throws with a readable message when invalid. */
export function parseImport(text: string): AppState {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Not a valid JSON file.')
  }
  if (!isPlausibleState(parsed)) throw new Error('Not a NUTRI backup (missing expected fields).')
  return migrate(parsed)
}
