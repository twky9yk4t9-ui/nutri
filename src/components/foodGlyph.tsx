import type { ReactNode } from 'react'
import type { Recipe } from '../domain/types'
import { IconApple, IconBird, IconBowl, IconCow, IconFish, IconFlask } from './icons'

// UI-only mapping from a recipe's lead ingredient to its row glyph.
const BY_INGREDIENT: [string, (size: number) => ReactNode][] = [
  ['chicken_breast', (s) => <IconBird size={s} />],
  ['beef_mince_5', (s) => <IconCow size={s} />],
  ['salmon', (s) => <IconFish size={s} />],
  ['cod', (s) => <IconFish size={s} />],
  ['tuna_drained', (s) => <IconFish size={s} />],
  ['whey_protein', (s) => <IconFlask size={s} />],
]

export function foodGlyph(recipe: Recipe, size = 18): ReactNode {
  if (recipe.slotType === 'breakfast') return <IconBowl size={size} />
  for (const [ingredientId, glyph] of BY_INGREDIENT) {
    if (recipe.ingredients.some((ri) => ri.ingredientId === ingredientId)) return glyph(size)
  }
  return <IconApple size={size} />
}
