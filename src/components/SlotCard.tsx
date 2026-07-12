import { useState } from 'react'
import type { Ingredient, PlanSlot, Recipe } from '../domain/types'
import { SLOT_LABELS } from '../state/selectors'
import { useApp } from '../state/store'
import { useNav } from '../App'
import { Num, MacroPair } from './Num'
import { IconCheck } from './icons'

// §7 logging with a glanceable hierarchy: the next planned slot is the hero
// (one obvious "Mark eaten" target), later planned slots are quiet rows that
// cycle on tap, logged slots collapse to single glyph-lines. Status always
// reads by glyph shape as well as color.

export type SlotVariant = 'hero' | 'row' | 'done'

export function SlotCard({
  slot,
  recipe,
  ingredients,
  variant = 'row',
}: {
  slot: PlanSlot
  recipe: Recipe | undefined
  ingredients: Map<string, Ingredient>
  variant?: SlotVariant
}) {
  const { dispatch } = useApp()
  const { openRecipe } = useNav()
  const [expanded, setExpanded] = useState(false)

  if (!recipe) return null

  const statusLabel = slot.status === 'planned' ? 'Planned' : slot.status === 'eaten' ? 'Eaten' : 'Off-plan'
  const cycle = () => dispatch({ type: 'cycleSlotStatus', date: slot.date, slot: slot.slot })
  const setStatus = (status: PlanSlot['status']) =>
    dispatch({ type: 'setSlotStatus', date: slot.date, slot: slot.slot, status })
  const aria = `${SLOT_LABELS[slot.slot]}: ${recipe.name}, ${statusLabel}.`

  const grams = expanded && (
    <div style={{ padding: '0 14px 10px', borderTop: '1px solid var(--line)' }}>
      <ul className="list-plain small" style={{ padding: '8px 0 2px' }}>
        {recipe.ingredients.length === 0 && <li className="dim">No tracked ingredients (bought item).</li>}
        {recipe.ingredients.map((ri) => {
          const ing = ingredients.get(ri.ingredientId)
          return (
            <li key={ri.ingredientId} className="dataline" style={{ minHeight: 34 }}>
              <span className="dim">{ing?.name ?? ri.ingredientId}</span>
              <span>
                <Num v={ri.grams} u="g" />
                {ri.state !== 'as-sold' && ri.state !== 'raw' && <span className="tiny faint"> {ri.state}</span>}
              </span>
            </li>
          )
        })}
      </ul>
      <button
        className="btn btn-ghost small"
        style={{ minHeight: 40, padding: '4px 0', color: 'var(--blue)' }}
        onClick={() => openRecipe(recipe.id, 1)}
      >
        View recipe →
      </button>
    </div>
  )

  if (variant === 'done' && !expanded) {
    return (
      <div className={`slot-done ${slot.status}`}>
        <div className="row" style={{ alignItems: 'stretch' }}>
          <button
            className="row"
            style={{ flex: 1, minHeight: 'var(--tap)', padding: '4px 0 4px 12px', textAlign: 'left' }}
            onClick={cycle}
            aria-label={`${aria} Tap to change.`}
          >
            <span className={`status-glyph ${slot.status}`} aria-hidden>
              {slot.status === 'eaten' ? '✓' : '–'}
            </span>
            <span className="small dim" style={{ flex: 1, fontWeight: 600 }}>
              {recipe.name}
            </span>
            <span className="tiny faint">{SLOT_LABELS[slot.slot]}</span>
          </button>
          <button
            style={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--faint)' }}
            onClick={() => setExpanded(true)}
            aria-label="Show gram amounts"
            aria-expanded={false}
          >
            ▾
          </button>
        </div>
      </div>
    )
  }

  if (variant === 'hero' && slot.status === 'planned') {
    return (
      <div className="slot-hero">
        <div className="row" style={{ alignItems: 'stretch' }}>
          <button
            style={{ flex: 1, textAlign: 'left', padding: '16px 0 4px 16px' }}
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-label={`${aria} Tap for gram amounts.`}
          >
            <div className="kicker">{SLOT_LABELS[slot.slot]} · up next</div>
            <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.01em', margin: '2px 0 4px' }}>
              {recipe.name}
            </div>
            <MacroPair kcal={recipe.verified.kcal} p={recipe.verified.p} lg />
          </button>
          <button
            style={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--faint)' }}
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? 'Hide details' : 'Show gram amounts'}
            aria-expanded={expanded}
          >
            <span style={{ transform: expanded ? 'rotate(180deg)' : undefined, transition: 'transform 150ms var(--ease)' }}>▾</span>
          </button>
        </div>
        <div className="row" style={{ padding: '12px 16px 16px', gap: 8 }}>
          <button className="btn btn-accent" style={{ flex: 1 }} onClick={() => setStatus('eaten')}>
            <IconCheck size={18} /> Mark eaten
          </button>
          <button
            className="btn btn-ghost"
            style={{ color: 'var(--warm)', flexShrink: 0 }}
            onClick={() => setStatus('off-plan')}
            aria-label="Mark off-plan"
          >
            – Off-plan
          </button>
        </div>
        {grams}
      </div>
    )
  }

  return (
    <div className="slot-row">
      <div className="row" style={{ alignItems: 'stretch' }}>
        <button
          style={{ flex: 1, textAlign: 'left', padding: '12px 0 12px 14px', minHeight: 'var(--tap)' }}
          onClick={cycle}
          aria-label={`${aria} Tap to change status.`}
        >
          <div className="kicker">
            {SLOT_LABELS[slot.slot]}
            {slot.status !== 'planned' && ` · ${statusLabel}`}
          </div>
          <div style={{ fontWeight: 700, margin: '1px 0 2px' }}>{recipe.name}</div>
          <MacroPair kcal={recipe.verified.kcal} p={recipe.verified.p} />
        </button>
        <button
          style={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--faint)' }}
          onClick={() => setExpanded((e) => !e)}
          aria-label={expanded ? 'Hide details' : 'Show gram amounts'}
          aria-expanded={expanded}
        >
          <span style={{ transform: expanded ? 'rotate(180deg)' : undefined, transition: 'transform 150ms var(--ease)' }}>▾</span>
        </button>
      </div>
      {grams}
    </div>
  )
}
