import type { Recipe } from '../domain/types'
import { useApp } from '../state/store'
import { useNav } from '../App'
import { Num } from '../components/Num'

// Library as a dense table: names left, macros right-aligned in tabular
// figures so the columns read like an instrument panel.

function RecipeRow({ recipe }: { recipe: Recipe }) {
  const { openRecipe } = useNav()
  return (
    <button
      className="check-row"
      style={{ gap: 8 }}
      onClick={() => openRecipe(recipe.id, 1)}
      aria-label={`Open ${recipe.name}`}
    >
      <span style={{ flex: 1, fontWeight: 600 }}>
        {recipe.name}
        {recipe.tags.length > 0 && (
          <span className="tiny faint" style={{ marginLeft: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {recipe.tags.join(' · ')}
          </span>
        )}
      </span>
      <span className="small" style={{ flexShrink: 0 }}>
        <Num v={recipe.verified.kcal} u="kcal" />{' '}
        <span style={{ display: 'inline-block', minWidth: 44, textAlign: 'right' }}>
          <Num v={recipe.verified.p} u="P" />
        </span>
      </span>
    </button>
  )
}

export function Recipes() {
  const { state } = useApp()
  const mains = state.recipes.filter((r) => r.slotType === 'main')
  const snacks = state.recipes.filter((r) => r.slotType === 'snack')
  const breakfast = state.recipes.filter((r) => r.slotType === 'breakfast')

  const groups: { title: string; sub: string; items: Recipe[] }[] = [
    { title: 'Main meals', sub: '755–815 kcal · 40–50 g protein · 1 serving', items: mains },
    { title: 'Snack canon', sub: 'two a day from your weekly pick', items: snacks },
    { title: 'Breakfast', sub: 'fixed, daily', items: breakfast },
  ]

  return (
    <>
      <h1 className="screen-title">Recipes</h1>
      <p className="screen-sub">
        Fixed library — {mains.length} mains, {snacks.length} snacks, permanent breakfast.
      </p>

      {groups.map((g) => (
        <div className="card" key={g.title}>
          <div className="row-between">
            <div className="card-title">{g.title}</div>
            <span className="tiny faint">{g.sub}</span>
          </div>
          <div style={{ marginTop: 4 }}>
            {g.items.map((r) => (
              <RecipeRow key={r.id} recipe={r} />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
