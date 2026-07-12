import type { CSSProperties, ReactNode } from 'react'
import type { Recipe, SlotKey } from '../domain/types'
import { IconApple, IconBird, IconBowl, IconCow, IconFish, IconFlask, IconMoon, IconSun } from './icons'

// UI-only color-coding: every food category owns a hue, every slot owns a
// glyph. Color never travels alone — the glyph always carries the meaning too.

const BY_INGREDIENT: [string, string, (size: number) => ReactNode][] = [
  ['chicken_breast', 'var(--orange)', (s) => <IconBird size={s} />],
  ['beef_mince_5', 'var(--red)', (s) => <IconCow size={s} />],
  ['salmon', 'var(--blue)', (s) => <IconFish size={s} />],
  ['cod', 'var(--blue)', (s) => <IconFish size={s} />],
  ['tuna_drained', 'var(--blue)', (s) => <IconFish size={s} />],
  ['whey_protein', 'var(--purple)', (s) => <IconFlask size={s} />],
]

export function foodGlyph(recipe: Recipe, size = 18): ReactNode {
  if (recipe.slotType === 'breakfast') return <IconBowl size={size} />
  for (const [ingredientId, , glyph] of BY_INGREDIENT) {
    if (recipe.ingredients.some((ri) => ri.ingredientId === ingredientId)) return glyph(size)
  }
  return <IconApple size={size} />
}

export function foodColor(recipe: Recipe): string {
  if (recipe.slotType === 'breakfast') return 'var(--yellow)'
  for (const [ingredientId, color] of BY_INGREDIENT) {
    if (recipe.ingredients.some((ri) => ri.ingredientId === ingredientId)) return color
  }
  return 'var(--mint)'
}

/** Tinted rounded-square chip: the recipe's category color + glyph. */
export function FoodChip({ recipe, size, sm = false }: { recipe: Recipe; size?: number; sm?: boolean }) {
  return (
    <span className={`icon-chip${sm ? ' sm' : ''}`} style={{ '--chip': foodColor(recipe) } as CSSProperties}>
      {foodGlyph(recipe, size ?? (sm ? 15 : 18))}
    </span>
  )
}

/** Slot identity for grids and day dots: breakfast bowl, snack apple,
 *  lunch sun, dinner moon — each in its own hue. */
export const SLOT_GLYPH: Record<SlotKey, { color: string; icon: (size: number) => ReactNode }> = {
  B: { color: 'var(--yellow)', icon: (s) => <IconBowl size={s} /> },
  S1: { color: 'var(--mint)', icon: (s) => <IconApple size={s} /> },
  L: { color: 'var(--orange)', icon: (s) => <IconSun size={s} /> },
  S2: { color: 'var(--mint)', icon: (s) => <IconApple size={s} /> },
  D: { color: 'var(--indigo)', icon: (s) => <IconMoon size={s} /> },
}
