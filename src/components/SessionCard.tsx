import type { CookSession, Recipe, WeekPlan } from '../domain/types'
import { addDays, fmtShort } from '../domain/dates'
import { SESSION_SHAPES } from '../domain/rotation'
import { useApp } from '../state/store'
import { useNav } from '../App'
import { FoodChip } from './foodGlyph'
import { IconCheck, IconSwap } from './icons'

/** Full-width card — Today's due cook session (amber = needs attention). */
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
          ? { background: 'color-mix(in srgb, var(--warm) 8%, var(--surface))', borderColor: 'color-mix(in srgb, var(--warm) 35%, var(--line))' }
          : undefined
      }
    >
      <div className="row" style={{ gap: 12 }}>
        <FoodChip recipe={recipe} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kicker" style={highlight ? { color: 'var(--warm)' } : undefined}>
            {session.id} · cook {fmtShort(cookDate)}{highlight && ' · due'}
          </div>
          <div style={{ fontWeight: 700, margin: '1px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {recipe.name}
          </div>
          <div className="tiny dim">
            {session.portions} portions · covers {coverDates.map((d) => fmtShort(d).slice(0, 6)).join(' · ')}
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
          Open recipe · {session.portions}×
        </button>
        {onSwap && (
          <button className="btn" onClick={onSwap} aria-label={`Swap recipe for session ${session.id}`}>
            <IconSwap size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

/** Compact card for the Week screen's horizontal snap-scroll session row. */
export function SessionChip({
  plan,
  session,
  recipe,
  onSwap,
}: {
  plan: WeekPlan
  session: CookSession
  recipe: Recipe | undefined
  onSwap: () => void
}) {
  const { dispatch } = useApp()
  const { openRecipe } = useNav()
  if (!recipe) return null

  const shape = SESSION_SHAPES.find((s) => s.id === session.id)!
  const cookDate = addDays(plan.weekStartISO, shape.cookOffset)

  return (
    <div className="card mb0" style={{ width: 190, padding: 12 }}>
      <div className="row-between">
        <FoodChip recipe={recipe} />
        <button
          style={{
            width: 48,
            height: 48,
            margin: '-6px -6px 0 0',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            color: session.done ? 'var(--accent)' : 'var(--faint)',
            background: session.done ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : undefined,
          }}
          onClick={() => dispatch({ type: 'toggleSessionDone', weekStartISO: plan.weekStartISO, sessionId: session.id })}
          aria-pressed={session.done}
          aria-label={`Mark session ${session.id} ${session.done ? 'not cooked' : 'cooked'}`}
        >
          <IconCheck size={20} />
        </button>
      </div>
      <button style={{ display: 'block', width: '100%', textAlign: 'left' }} onClick={() => openRecipe(recipe.id, session.portions)}>
        <div className="kicker" style={{ marginTop: 6 }}>
          {session.id} · {fmtShort(cookDate).slice(0, 6)}
        </div>
        <div style={{ fontWeight: 700, fontSize: 'var(--t-body)', margin: '1px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {recipe.name}
        </div>
      </button>
      <div className="row-between" style={{ marginTop: 4 }}>
        <span className="tiny dim">{session.portions} portions</span>
        <button
          className="icon-btn"
          style={{ width: 44, height: 44, margin: '-4px -8px -8px 0' }}
          onClick={onSwap}
          aria-label={`Swap recipe for session ${session.id}`}
        >
          <IconSwap size={17} />
        </button>
      </div>
    </div>
  )
}
