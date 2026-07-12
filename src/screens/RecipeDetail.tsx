import { useMemo, useState } from 'react'
import { useApp } from '../state/store'
import { useNav } from '../App'
import { ingredientMap } from '../domain/macros'
import { SEASONING_NOTE, scaleRecipe, waterFor } from '../domain/scaling'
import { EMERGENCY_BREAKFAST } from '../domain/seed'
import { Num } from '../components/Num'
import { IconChevronLeft } from '../components/icons'

// §9.3: serving selector 1–4 recalculates every gram, batch macros and step
// overrides live. Ingredients are a two-column table: names left, quantities
// right-aligned in tabular figures.

export function RecipeDetail({ recipeId, initialServings }: { recipeId: string; initialServings: number }) {
  const { state } = useApp()
  const { closeRecipe } = useNav()
  const ingredients = useMemo(() => ingredientMap(state.ingredients), [state.ingredients])
  const recipe = state.recipes.find((r) => r.id === recipeId)
  const [servings, setServings] = useState(() => Math.min(Math.max(initialServings, 1), 4))

  if (!recipe) {
    return (
      <>
        <button className="btn btn-ghost" onClick={closeRecipe}>
          <IconChevronLeft size={18} /> Back
        </button>
        <p className="dim">Recipe not found.</p>
      </>
    )
  }

  const scalable = recipe.slotType === 'main'
  const effectiveServings = scalable ? servings : 1
  const scaled = scaleRecipe(recipe, effectiveServings)
  const water = waterFor(recipe, effectiveServings)
  const v = recipe.verified

  return (
    <>
      <button className="btn btn-ghost" style={{ marginLeft: -12, minHeight: 44 }} onClick={closeRecipe}>
        <IconChevronLeft size={18} /> Back
      </button>
      <h1 className="screen-title" style={{ marginTop: 0 }}>
        {recipe.name}
      </h1>
      <p className="screen-sub" style={{ marginBottom: 12 }}>
        <Num v={v.kcal} u="kcal" /> <Num v={v.p} u="P" /> <Num v={v.c} u="C" /> <Num v={v.f} u="F" />
        <span className="tiny faint"> per serving</span>
        {recipe.tags.map((t) => (
          <span key={t} className="chip tag" style={{ marginLeft: 6 }}>
            {t}
          </span>
        ))}
      </p>

      {scalable && (
        <div className="card" style={{ background: 'var(--surface-2)', borderColor: 'var(--line-strong)' }}>
          <div className="row-between">
            <div className="card-title">Servings</div>
            <div className="row" style={{ gap: 4 }}>
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  className="btn"
                  style={{
                    minWidth: 48,
                    padding: '8px 0',
                    fontWeight: 700,
                    ...(n === servings
                      ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--accent-ink)' }
                      : { background: 'var(--surface)', borderColor: 'var(--line)' }),
                  }}
                  onClick={() => setServings(n)}
                  aria-pressed={n === servings}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          {servings > 1 && (
            <div className="small dim" style={{ marginTop: 8 }}>
              Batch: <Num v={scaled.batch.kcal} u="kcal" /> <Num v={scaled.batch.p} u="P" /> <Num v={scaled.batch.c} u="C" />{' '}
              <Num v={scaled.batch.f} u="F" />
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="card-title">
          Ingredients{' '}
          <span className="dim" style={{ fontWeight: 400, fontSize: 'var(--t-label)' }}>
            · {effectiveServings} serving{effectiveServings > 1 ? 's' : ''} · raw weights unless stated
          </span>
        </div>
        <ul className="list-plain" style={{ marginTop: 4 }}>
          {scaled.ingredients.length === 0 && <li className="dim small">Bought item — no tracked ingredients.</li>}
          {scaled.ingredients.map((ri) => {
            const ing = ingredients.get(ri.ingredientId)
            return (
              <li key={ri.ingredientId} className="dataline" style={{ minHeight: 36 }}>
                <span>{ing?.name ?? ri.ingredientId}</span>
                <span>
                  <Num v={ri.grams} u="g" />
                  {ri.state !== 'as-sold' && ri.state !== 'raw' && <span className="tiny faint"> {ri.state}</span>}
                </span>
              </li>
            )
          })}
        </ul>
        {water.length > 0 && (
          <div className="row" style={{ flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
            {water.map((w) => (
              <span key={w.kind} className="chip chip-accent">
                {w.label}: {w.detail}
              </span>
            ))}
          </div>
        )}
      </div>

      {recipe.steps.length > 0 && (
        <div className="card">
          <div className="card-title">Method</div>
          <ol style={{ margin: '6px 0 0', paddingLeft: 20 }}>
            {scaled.steps.map((s, i) => (
              <li key={i} className="small" style={{ padding: '4px 0', color: 'var(--dim)' }}>
                <span style={{ color: 'var(--text)' }}>{s.text}</span>
                {s.overridden && (
                  <span className="chip chip-amber tag" style={{ marginLeft: 6 }}>
                    {effectiveServings}-serving version
                  </span>
                )}
              </li>
            ))}
          </ol>
          {scalable && effectiveServings > 1 && (
            <p className="tiny faint" style={{ margin: '8px 0 0' }}>
              {SEASONING_NOTE}
            </p>
          )}
        </div>
      )}

      <div className="card">
        <div className="card-title">Storage & reheat</div>
        <p className="small dim" style={{ margin: '4px 0 0' }}>
          {recipe.reheatNote}
        </p>
      </div>

      {recipe.slotType === 'breakfast' && (
        <div className="card" style={{ borderStyle: 'dashed' }}>
          <div className="card-title">{EMERGENCY_BREAKFAST.title}</div>
          <p className="tiny faint" style={{ margin: '2px 0 6px' }}>
            {EMERGENCY_BREAKFAST.note}
          </p>
          <p className="small" style={{ margin: 0 }}>
            {EMERGENCY_BREAKFAST.body}
          </p>
          <p className="small dim" style={{ margin: '6px 0 0' }}>
            {EMERGENCY_BREAKFAST.macros}
          </p>
        </div>
      )}
    </>
  )
}
