import type { CookSession, Recipe, WeekPlan } from '../domain/types'
import { addDays, fmtShort } from '../domain/dates'
import { SESSION_SHAPES } from '../domain/rotation'
import { useApp } from '../state/store'
import { useNav } from '../App'
import { IconCheck, IconSwap } from './icons'

export function SessionCard({
  plan,
  session,
  recipe,
  onSwap,
  highlight = false,
}: {
  plan: WeekPlan
  session: CookSession
  recipe: Recipe | undefined
  onSwap?: () => void
  highlight?: boolean
}) {
  const { dispatch } = useApp()
  const { openRecipe } = useNav()
  if (!recipe) return null

  const shape = SESSION_SHAPES.find((s) => s.id === session.id)!
  const cookDate = addDays(plan.weekStartISO, shape.cookOffset)
  const coverDates = [...new Set(session.covers.map((c) => c.date))]

  return (
    <div
      className="card"
      style={
        highlight
          ? { background: 'var(--surface-2)', borderColor: 'var(--accent-dim)' }
          : undefined
      }
    >
      <div className="row-between">
        <div>
          <div className="kicker">
            {session.id} · cook {fmtShort(cookDate)} · {session.portions} portions
            {highlight && ' · due'}
          </div>
          <div style={{ fontWeight: 700, fontSize: highlight ? 17 : 'var(--t-body)', margin: '1px 0' }}>
            {recipe.name}
          </div>
          <div className="tiny dim">
            covers {coverDates.map((d) => fmtShort(d).slice(0, 6)).join(' · ')}
            {recipe.tags.length > 0 && <span className="faint"> · {recipe.tags.join(' · ')}</span>}
          </div>
        </div>
        <button
          className="btn"
          style={{
            minWidth: 48,
            padding: 0,
            color: session.done ? 'var(--accent)' : 'var(--faint)',
            borderColor: session.done ? 'var(--accent-dim)' : 'var(--line-strong)',
            background: session.done ? 'color-mix(in srgb, var(--accent) 10%, var(--surface-2))' : undefined,
          }}
          onClick={() => dispatch({ type: 'toggleSessionDone', weekStartISO: plan.weekStartISO, sessionId: session.id })}
          aria-pressed={session.done}
          aria-label={`Mark session ${session.id} ${session.done ? 'not cooked' : 'cooked'}`}
        >
          <IconCheck />
        </button>
      </div>
      <div className="row mt" style={{ gap: 8 }}>
        <button className="btn" style={{ flex: 1 }} onClick={() => openRecipe(recipe.id, session.portions)}>
          Open recipe at {session.portions} servings
        </button>
        {onSwap && (
          <button className="btn" onClick={onSwap} aria-label={`Swap recipe for session ${session.id}`}>
            <IconSwap size={18} /> Swap
          </button>
        )}
      </div>
    </div>
  )
}
