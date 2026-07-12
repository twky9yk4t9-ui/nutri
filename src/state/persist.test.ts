import { describe, expect, it } from 'vitest'
import { parseImport, serializeState, exportFilename } from './persist'
import { buildSeedState, SEED_INGREDIENTS, SEED_RECIPES } from '../domain/seed'
import { ingredientMap } from '../domain/macros'
import { generateCycle } from '../domain/rotation'

// Export/import (§8): one-tap download/upload of the full JSON.

describe('export / import round-trip', () => {
  it('serializes and re-imports a full state losslessly', () => {
    const state = buildSeedState()
    state.weeks = [generateCycle('2026-07-11', SEED_RECIPES, ingredientMap(SEED_INGREDIENTS))]
    state.weights = [{ dateISO: '2026-07-11', kg: 72.4 }]

    const imported = parseImport(serializeState(state))
    expect(imported).toEqual(state)
  })

  it('rejects non-JSON and non-backup files with readable messages', () => {
    expect(() => parseImport('not json {')).toThrow(/valid JSON/)
    expect(() => parseImport('{"foo": 1}')).toThrow(/NUTRI backup/)
    expect(() => parseImport(JSON.stringify({ ...buildSeedState(), version: 99 }))).toThrow(/version/)
  })

  it('migrates a v1 state/backup by merging the new snack-canon seed entries', () => {
    const NEW_RECIPES = ['snack_f', 'snack_g', 'snack_h']
    const NEW_INGREDIENTS = ['whey_protein', 'tuna_drained', 'rice_cakes', 'cottage_cheese', 'cherry_tomatoes']
    const v1 = buildSeedState()
    v1.version = 1
    v1.recipes = v1.recipes.filter((r) => !NEW_RECIPES.includes(r.id))
    v1.ingredients = v1.ingredients.filter((i) => !NEW_INGREDIENTS.includes(i.id))
    v1.weights = [{ dateISO: '2026-07-11', kg: 72.4 }]

    const migrated = parseImport(serializeState(v1))
    expect(migrated.version).toBe(2)
    for (const id of NEW_RECIPES) expect(migrated.recipes.map((r) => r.id)).toContain(id)
    for (const id of NEW_INGREDIENTS) expect(migrated.ingredients.map((i) => i.id)).toContain(id)
    expect(migrated.weights).toEqual([{ dateISO: '2026-07-11', kg: 72.4 }]) // user data untouched
  })

  it('names backups by date', () => {
    expect(exportFilename()).toMatch(/^nutri-backup-\d{4}-\d{2}-\d{2}\.json$/)
  })
})
