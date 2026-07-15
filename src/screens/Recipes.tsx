import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Recipe, RecipeTag } from '../domain/types'
import { useApp } from '../state/store'
import { useNav } from '../App'
import { ScreenHeader } from '../components/ScreenHeader'
import { FoodChip } from '../components/foodGlyph'
import { Num } from '../components/Num'
import { IconApple, IconBolt, IconBowl, IconClock, IconInfo, IconPot } from '../components/icons'
import type { CSSProperties } from 'react'

// Glanceable library: leading food glyph, one-line name, right-aligned
// figures. Tags are tiny muted glyphs; their legend lives behind ⓘ.

const TAG_GLYPH: Record<RecipeTag, (size: number) => ReactNode> = {
  quick: (s) => <IconBolt size={s} />,
  keeper: (s) => <IconClock size={s} />,
  bigpot: (s) => <IconPot size={s} />,
}

const TAG_COLOR: Record<RecipeTag, string> = {
  quick: 'var(--yellow)',
  keeper: 'var(--cyan)',
  bigpot: 'var(--orange)',
}

function RecipeRow({ recipe }: { recipe: Recipe }) {
  const { openRecipe } = useNav()
  return (
    <button className="check-row" style={{ gap: 12 }} onClick={() => openRecipe(recipe.id, 1)} aria-label={`Open ${recipe.name}`}>
      <FoodChip recipe={recipe} />
      <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{recipe.name}</span>
        {recipe.tags.map((t) => (
          <span key={t} style={{ flexShrink: 0, display: 'inline-flex', color: TAG_COLOR[t], opacity: 0.85 }} title={t}>
            {TAG_GLYPH[t](13)}
          </span>
        ))}
      </span>
      <span className="small" style={{ flexShrink: 0 }}>
        <Num v={recipe.verified.kcal} u="kcal" />{' '}
        <span style={{ display: 'inline-block', minWidth: 42, textAlign: 'right' }}>
          <Num v={recipe.verified.p} u="P" />
        </span>
      </span>
    </button>
  )
}

export function Recipes() {
  const { state } = useApp()
  const [showLegend, setShowLegend] = useState(false)
  const mains = state.recipes.filter((r) => r.slotType === 'main')
  const snacks = state.recipes.filter((r) => r.slotType === 'snack')
  const breakfast = state.recipes.filter((r) => r.slotType === 'breakfast')

  const groups: { title: string; color: string; icon: ReactNode; items: Recipe[] }[] = [
    { title: 'Main meals', color: 'var(--orange)', icon: <IconPot size={15} />, items: mains },
    { title: 'Snacks', color: 'var(--mint)', icon: <IconApple size={15} />, items: snacks },
    { title: 'Breakfast', color: 'var(--yellow)', icon: <IconBowl size={15} />, items: breakfast },
  ]

  return (
    <>
      <ScreenHeader title="Recipes" />

      {groups.map((g, gi) => (
        <div className="card" style={{ padding: '10px 18px 4px' }} key={g.title}>
          <div className="widget-head">
            <span className="icon-chip sm" style={{ '--chip': g.color } as CSSProperties}>
              {g.icon}
            </span>
            <span className="group-label" style={{ flex: 1 }}>
              {g.title}
            </span>
            {gi === 0 && (
              <button
                className="icon-btn"
                style={{ width: 40, height: 40, margin: 0 }}
                onClick={() => setShowLegend((v) => !v)}
                aria-expanded={showLegend}
                aria-label="Tag legend"
              >
                <IconInfo size={15} />
              </button>
            )}
          </div>
          {gi === 0 && showLegend && (
            <p className="footnote" style={{ margin: '0 0 8px' }}>
              <span style={{ color: TAG_COLOR.quick }}><IconBolt size={11} /></span> quick — 20-min one-pan, Tuesday-friendly ·{' '}
              <span style={{ color: TAG_COLOR.keeper }}><IconClock size={11} /></span> keeper — holds 2+ days ·{' '}
              <span style={{ color: TAG_COLOR.bigpot }}><IconPot size={11} /></span> big pot — scales easily to 4 ·{' '}
              chip color = protein: <span style={{ color: 'var(--orange)' }}>poultry</span> <span style={{ color: 'var(--red)' }}>beef</span>{' '}
              <span style={{ color: 'var(--blue)' }}>fish</span> <span style={{ color: 'var(--purple)' }}>whey</span>{' '}
              <span style={{ color: 'var(--mint)' }}>fresh</span>
            </p>
          )}
          {g.items.map((r) => (
            <RecipeRow key={r.id} recipe={r} />
          ))}
        </div>
      ))}
    </>
  )
}
